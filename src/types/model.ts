export type LeetCodeData={
    handle: string | null;
    easy: number | null;
    medium: number | null;
    hard: number | null;
    total: number | null;
    currentRating: number | null;
    maxRating:number | null;
    contestHistory: {
        rating: number | null;
        contestName: string | null;
        date: string | null;
    }[];
}

export type CodeforcesData={
    handle: string | null;
    easy: number | null;
    medium: number | null;
    hard: number | null;
    total: number | null;
    currentRating: number | null;
    maxRating:number | null;
    contestHistory: {
        rating: number | null;
        contestName: string | null;
        date: string | null;
    }[];
}

export type CodeChefData={
    handle: string | null;
    currentRating: number | null;
    maxRating:number | null;
    contestHistory: {
        rating: number | null;
        contestName: string | null;
        date: string | null;
    }[];
}

export type GFGData={
    handle: string | null;
    easy: number | null;
    medium: number | null;
    hard: number | null;
    total: number | null;
}
export type isSignedIn = {
    isSignedIn: boolean |undefined;
    isLoaded: boolean;
    username: string | null;
    error: string | null;
}

export interface Friend extends UserData {
    id: string;
    username: string;
}
export interface PlatformData {
    status: 'ok' | 'error';
    easy: number;
    medium: number;
    hard: number;
    total: number;
    currentRating?: number;
    maxRating?: number;
    contestHistory?: Array<{
        date: string;
        rating: number;
        contestName: string;
    }>;
}
export interface UserData {
    0: PlatformData; // CodeChef
    1: PlatformData; // Codeforces
    2: PlatformData; // GeeksforGeeks
    3: PlatformData; // Leetcode
    4: {
        leetcode: string;
        codeforces: string;
        gfg: string;
        codechef: string;
    };
    message?: string;
}

