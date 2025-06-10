import sql from '@/config/database';
import { NextRequest, NextResponse } from 'next/server';

function convertTimestampToDate(timestamp: number) {
    if (!timestamp || isNaN(timestamp)) return "Invalid Date";
    if (timestamp < 10000000000) {
        timestamp *= 1000;
    }
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Add timeout to fetch requests
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]) as Promise<Response>;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { handle } = await req.json();
        const res = await sql`SELECT handles.* FROM handles JOIN users ON handles.id = users.id WHERE users.username = ${handle}`;
        
        if (res.length === 0) {
            return NextResponse.json({ message: 'User handle not found' }, { status: 404 });
        }

        const userHandles = res[0];
        
        // Prepare all API calls with error handling
        const apiCalls = [];
        
        // Only make API calls for existing handles
        if (userHandles.codechef) {
            apiCalls.push(
                fetchWithTimeout(`https://codechef-api.vercel.app/${userHandles.codechef}`)
                    .then(res => res.json())
                    .catch(() => ({ success: false }))
            );
        } else {
            apiCalls.push(Promise.resolve({ success: false }));
        }

        if (userHandles.codeforces) {
            // Combine both codeforces API calls into one by using user.info endpoint
            apiCalls.push(
                fetchWithTimeout(`https://codeforces.com/api/user.status?handle=${userHandles.codeforces}&from=1&count=1000`)
                    .then(res => res.json())
                    .catch(() => ({ status: "FAILED" }))
            );
            apiCalls.push(
                fetchWithTimeout(`https://codeforces.com/api/user.rating?handle=${userHandles.codeforces}`)
                    .then(res => res.json())
                    .catch(() => ({ status: "FAILED" }))
            );
        } else {
            apiCalls.push(Promise.resolve({ status: "FAILED" }));
            apiCalls.push(Promise.resolve({ status: "FAILED" }));
        }

        if (userHandles.gfg) {
            apiCalls.push(
                fetchWithTimeout(`https://www.geeksforgeeks.org/gfg-assets/_next/data/FYklEAyXivT1T8T9JuA9B/user/${userHandles.gfg}.json`)
                    .then(res => res.json())
                    .catch(() => ({}))
            );
        } else {
            apiCalls.push(Promise.resolve({}));
        }

        if (userHandles.leetcode) {
            const leetcodeQuery = {
                operationName: "combinedUserInfo",
                query: `
                    query combinedUserInfo($username: String!) {
                        userContestRankingHistory(username: $username) {
                            attended
                            rating
                            contest {
                                title
                                startTime
                            }
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    count
                                }
                            }
                        }
                    }
                `,
                variables: { username: userHandles.leetcode }
            };

            apiCalls.push(
                fetchWithTimeout("https://leetcode.com/graphql/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(leetcodeQuery)
                })
                    .then(res => res.json())
                    .catch(() => ({ data: undefined }))
            );
        } else {
            apiCalls.push(Promise.resolve({ data: undefined }));
        }

        const [codechef, codeforces0, codeforces, gfg, leetcode] = await Promise.all(apiCalls);

        // Process results more efficiently
        const results = [];

        // CodeChef processing
        if (codechef.success === false) {
            results.push({ status: "error", message: "User not found" });
        } else {
            results.push({
                status: "ok",
                currentRating: codechef.currentRating,
                maxRating: codechef.highestRating,
                contestHistory: codechef.ratingData?.map((item: any) => ({
                    rating: Number(item.rating),
                    contestName: item.name,
                    date: convertTimestampToDate(Date.parse(item.end_date)),
                })) || []
            });
        }

        // Codeforces processing
        if (codeforces.status === "OK") {
            let maxRating = 0;
            let easy = 0, medium = 0, hard = 0;

            // Process submissions efficiently
            if (codeforces0.status === "OK") {
                codeforces0.result.forEach((item: any) => {
                    if (item.verdict === "OK" && item.problem.rating) {
                        if (item.problem.rating <= 1000) easy++;
                        else if (item.problem.rating <= 1600) medium++;
                        else hard++;
                    }
                });
            }

            // Find max rating
            codeforces.result.forEach((item: any) => {
                if (item.newRating > maxRating) {
                    maxRating = item.newRating;
                }
            });

            results.push({
                status: "ok",
                currentRating: codeforces.result[codeforces.result.length - 1]?.newRating || 0,
                contestHistory: codeforces.result.map((item: any) => ({
                    rating: Number(item.newRating),
                    contestName: item.contestName,
                    date: convertTimestampToDate(item.ratingUpdateTimeSeconds),
                })),
                maxRating,
                easy,
                medium,
                hard,
                total: easy + medium + hard
            });
        } else {
            results.push({ status: "error", message: "User not found" });
        }

        // GFG processing
        if (gfg.pageProps?.userHandle !== undefined) {
            const submissions = gfg.pageProps.userSubmissionsInfo;
            const easyCount = Object.keys(submissions.Easy || {}).length + Object.keys(submissions.Basic || {}).length;
            const mediumCount = Object.keys(submissions.Medium || {}).length;
            const hardCount = Object.keys(submissions.Hard || {}).length;
            
            results.push({
                status: "ok",
                easy: easyCount,
                medium: mediumCount,
                hard: hardCount,
                total: easyCount + mediumCount + hardCount,
            });
        } else {
            results.push({ status: "error", message: "User not found" });
        }

        // LeetCode processing
        if (leetcode?.data !== undefined) {
            let maxRating = 0;
            
            leetcode.data.userContestRankingHistory?.forEach((item: any) => {
                if (item.attended && item.rating > maxRating) {
                    maxRating = item.rating;
                }
            });

            results.push({
                status: "ok",
                easy: leetcode.data.matchedUser?.submitStats?.acSubmissionNum?.[1]?.count || 0,
                medium: leetcode.data.matchedUser?.submitStats?.acSubmissionNum?.[2]?.count || 0,
                hard: leetcode.data.matchedUser?.submitStats?.acSubmissionNum?.[3]?.count || 0,
                total: leetcode.data.matchedUser?.submitStats?.acSubmissionNum?.[0]?.count || 0,
                currentRating: leetcode.data.userContestRankingHistory?.[leetcode.data.userContestRankingHistory.length - 1]?.rating || 0,
                maxRating,
                contestHistory: leetcode.data.userContestRankingHistory?.filter((item: any) => item.attended).map((item: any) => ({
                    rating: Number(item.rating),
                    contestName: item.contest.title,
                    date: convertTimestampToDate(item.contest.startTime)
                })) || [],
            });
        } else {
            results.push({ status: "error", message: "User not found" });
        }

        // Add handles info
        results.push({
            leetcode: userHandles.leetcode,
            codechef: userHandles.codechef,
            codeforces: userHandles.codeforces,
            gfg: userHandles.gfg
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}