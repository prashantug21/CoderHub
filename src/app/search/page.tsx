"use client";
import { useAppSelector } from "@/lib/hooks";
import { useAddFriendMutation } from "@/lib/requests/friendData";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
;
type SearchResult = {
    username?: string;
    first?: string;
    last?: string;
    avatar?: string;
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    gfg?: string;
};

export default function SearchPage() {
    const signedIn = useAppSelector((state: any) => state.signedIn);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [addFriend, { isSuccess: addSuccess }] = useAddFriendMutation();
    useEffect(() => {
        if (addSuccess) {
            toast.success("Friend added!");
        }
    }
        , [addSuccess]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Clear previous interval if any
        if (intervalRef.current) clearTimeout(intervalRef.current);

        intervalRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                } else {
                    setResults([]);
                    toast.error("Failed to fetch results.");
                }
            } catch {
                setResults([]);
            }
            setLoading(false);
        }, 2000);

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [query]);

    return (
        <>
            <div className="max-w-2xl mx-auto py-10 px-4">

                <h1 className="text-3xl font-bold mb-8 text-center">Search Users</h1>
                <input
                    type="text"
                    className="w-full border-2 border-black rounded-lg px-4 py-2 mb-6"
                    placeholder="Type username or handle..."
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setTouched(true);
                    }}
                    autoFocus
                />
                {loading && (
                    <div className="flex justify-center items-center py-4">
                        <span className="text-lg">Searching...</span>
                    </div>
                )}
                {!loading && touched && query.trim() && results.length === 0 && (
                    <div className="flex justify-center items-center py-4">
                        <span className="text-lg text-gray-500">No users found.</span>
                    </div>
                )}
                <ul className="space-y-4">
                    {results.map((user, idx) => (
                        <li
                            key={user.username || user.leetcode || user.codeforces || user.codechef || user.gfg || idx}
                            className="flex items-center gap-4 bg-white border rounded-lg shadow p-4"
                        >
                            <Image
                                src={user.avatar || "/default-avatar.png"}
                                alt={user.username || "avatar"}
                                className="w-12 h-12 rounded-full object-cover border"
                            />
                            <div>
                                <div className="font-semibold text-lg">
                                    {user.first} {user.last}{" "}
                                    {user.username && (
                                        <span className="text-gray-500">@{user.username}</span>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                    {user.leetcode && (<div className="flex items-center gap-1">
                                        <Image src={'/leetcode.svg'} width={16} height={16} alt="leetcode" />
                                        <a
                                            href={`https://leetcode.com/${user.leetcode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {user.leetcode}
                                        </a></div>
                                    )}
                                    {user.codeforces && (
                                        <div className="flex items-center gap-1">
                                            <Image src={'/codeforces.svg'} width={16} height={16} alt="codeforces" />
                                            <a
                                                href={`https://codeforces.com/profile/${user.codeforces}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {user.codeforces}
                                            </a></div>
                                    )}
                                    {user.codechef && (
                                        <div className="flex items-center gap-1">
                                            <Image src={'/codechef.svg'} width={16} height={16} alt="codechef" />
                                            <a
                                                href={`https://www.codechef.com/users/${user.codechef}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {user.codechef}
                                            </a></div>
                                    )}
                                    {user.gfg && (
                                        <div className="flex items-center gap-1">
                                            <Image src={'/gfg.svg'} width={16} height={16} alt="gfg" />
                                            <a
                                                href={`https://www.geeksforgeeks.org/user/${user.gfg}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {user.gfg}
                                            </a></div>
                                    )}
                                </div>
                            </div>
                            {signedIn.isSignedIn && signedIn.username !== user.username && (
                                <button
                                    className="float-right"
                                    onClick={() => {
                                        addFriend({ username: user.username })
                                    }}
                                >
                                    <span className="button_top">Add Friend</span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

            </div>
        </>
    );
}