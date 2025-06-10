"use client";
import { useGetFriendsQuery, useDeleteFriendMutation } from "@/lib/requests/friendData";
import { useState } from "react";
import Loader from "../Components/Loader";
import Link from "next/link";
import Image from "next/image";

export default function FriendsPage() {
    const { data: friends, isLoading, isError, refetch } = useGetFriendsQuery({});
    const [deleteFriend, { isLoading: isDeleting }] = useDeleteFriendMutation();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="text-lg text-red-500 bg-white">Failed to load friends.</span>
            </div>
        );
    }

    if (!friends || friends.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="text-lg">You have no friends yet.</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Your Friends</h1>
            <ul className="space-y-4">
                {friends.map((friend: any) => (
                    <li
                        key={friend.id}
                        className="flex items-center justify-between bg-white border rounded-lg shadow p-4"
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={friend.avatar || "/default-avatar.png"}
                                alt={friend.username}
                                className="w-12 h-12 rounded-full object-cover border"
                            />
                            <div>
                                <div className="font-semibold text-sm sm:text-lg">{friend.first} {friend.last} <Link href={`/profile//${friend.username}`} className="text-gray-500">@{friend.username}</Link></div>
                                <div className="sm:text-sm text-gray-500">{friend.email}</div>
                                <div className="flex gap-2 mt-1 items-center sm:gap-10">
                                    <a href={`https://www.codechef.com/users/${friend.codechef}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline"><Image src={'/codechef.svg'} alt="codechef" width={24} height={24} /></a>
                                    <a href={`https://codeforces.com/profile/${friend.codeforces}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline"><Image src={'/codeforces.svg'} alt="codeforces" width={24} height={24} /></a>
                                    <a href={`https://leetcode.com/${friend.leetcode}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline"><Image src={'/leetcode.svg'} alt="leetcode" width={24} height={24} /></a>
                                    <a href={`https://www.geeksforgeeks.org/user/${friend.gfg}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline"><Image src={'/gfg.svg'} alt="gfg" width={24} height={24} /></a>
                                </div>
                            </div>
                        </div>
                        <button
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-60"
                            disabled={isDeleting && deletingId === friend.id}
                            onClick={async () => {
                                setDeletingId(friend.id);
                                await deleteFriend(friend.id);
                                setDeletingId(null);
                                refetch();
                            }}
                        >
                            {isDeleting && deletingId === friend.id ? "Removing..." : "Remove"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}