'use client'
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from "recharts";
import Image from "next/image";
import { toast } from "react-toastify";
import Loader from "@/app/Components/Loader";
import { useAppSelector } from "@/lib/hooks";
import { useAddFriendMutation, useFriendCheckQuery } from "@/lib/requests/friendData";
import { PlatformData, UserData } from "@/types/model";



// Constants
const CHART_CONFIG: ChartConfig = {
    rating: {
        label: "Rating",
        color: "#000000",
    },
};

const PLATFORMS = [
    { name: "CodeChef", index: 0, icon: "/codechef.svg", urlBase: "https://www.codechef.com/users/" },
    { name: "Codeforces", index: 1, icon: "/codeforces.svg", urlBase: "https://codeforces.com/profile/" },
    { name: "Leetcode", index: 3, icon: "/leetcode.svg", urlBase: "https://www.leetcode.com/" },
] as const;


// Helper functions
const getSafeData = (data: PlatformData | undefined): PlatformData =>
    data?.status === "ok" ? data : { status: 'error', easy: 0, medium: 0, hard: 0, total: 0 };

const formatRating = (rating: number | undefined): string =>
    rating ? Math.round(rating).toString() : "-";

// Components
const ErrorMessage = ({ message }: { message: string }) => (
    <div className="w-full flex justify-center items-center h-screen">
        Error: {message}
    </div>
);

const NotFoundMessage = ({ message }: { message: string }) => (
    <div className="w-full flex justify-center items-center h-screen bg-white">
        {message}
    </div>
);

const PlatformCard = ({
    platform,
    username,
    icon
}: {
    platform: string;
    username: string;
    icon: string;
}) => {
    const urlMap: Record<string, string> = {
        leetcode: `https://www.leetcode.com/${username}`,
        codeforces: `https://codeforces.com/profile/${username}`,
        gfg: `https://www.geeksforgeeks.org/user/${username}`,
        codechef: `https://www.codechef.com/users/${username}`,
    };

    return (
        <Card className="w-full md:max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0)] rounded-2xl border-2 border-black p-4 flex items-center gap-4">
            <Image src={icon} alt={platform} width={24} height={24} />
            <a href={urlMap[platform]} target="_blank" rel="noopener noreferrer">
                {username}
            </a>
        </Card>
    );
};

const StatsCard = ({
    title,
    data,
    hasError
}: {
    title: string;
    data: PlatformData;
    hasError: boolean;
}) => (
    <Card className="w-full md:max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0)] rounded-2xl border-2 border-black">
        <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
                {title}
                {hasError && (
                    <span className="text-sm text-red-500 block mt-1">
                        (Profile not found)
                    </span>
                )}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 justify-items-center gap-4">
                <p className="text-lg font-semibold easy">Easy: {data.easy}</p>
                <p className="text-lg font-semibold medium">Medium: {data.medium}</p>
                <p className="text-lg font-semibold hard">Hard: {data.hard}</p>
                <p className="text-lg font-semibold total">Total: {data.total}</p>
            </div>
        </CardContent>
    </Card>
);

const AddFriendButton = ({
    onAddFriend,
    isSignedIn
}: {
    onAddFriend: () => void;
    isSignedIn: boolean;
}) => (!isSignedIn ? <></> :
    <div className="flex justify-end mb-4">
        <button onClick={onAddFriend}>
            <span className="button_top">Add Friend</span>
        </button>
    </div>
);

const RatingChart = ({
    platforms,
    selectedIndex,
    onIndexChange
}: {
    platforms: Array<{ name: string; index: number; data: PlatformData }>;
    selectedIndex: number;
    onIndexChange: (index: number) => void;
}) => {
    const currentPlatform = platforms.find(p => p.index === selectedIndex) || platforms[0];
    const chartData = currentPlatform?.data?.contestHistory || [];
    const currentRating = formatRating(currentPlatform?.data?.currentRating);
    const maxRating = formatRating(currentPlatform?.data?.maxRating);

    return (
        <Card className="w-full p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0)] rounded-2xl border-2 border-black h-full">
            <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hidden py-2">
                        {platforms.map((platform) => (
                            <button key={platform.name}>
                                <span
                                    className={`button_top ${selectedIndex === platform.index ? 'bg-gray-200' : ''}`}
                                    onClick={() => onIndexChange(platform.index)}
                                >
                                    {platform.name}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-blue-500 font-semibold">
                            Current Rating: {currentRating}
                        </span>
                        <span className="text-green-500 font-semibold">
                            Max Rating: {maxRating}
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[300px]">
                        <LineChart
                            accessibilityLayer
                            className="max-h-fit"
                            data={chartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(5)}
                            />
                            <Tooltip
                                cursor={false}
                                content={({ payload }) => {
                                    if (!payload || payload.length === 0) return null;
                                    const { rating, contestName } = payload[0].payload;
                                    return (
                                        <div className="bg-white p-2 rounded-md shadow-md">
                                            <p className="font-semibold">{contestName}</p>
                                            <p className="font-bold">Rating: {Math.round(rating)}</p>
                                        </div>
                                    );
                                }}
                            />
                            <Line
                                dataKey="rating"
                                stroke="#000000"
                                strokeWidth={2}
                                dot={{ fill: "#000000", r: 2 }}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="flex justify-center items-center h-[300px]">
                        <p className="text-gray-500">
                            {chartData.length === 0 ? "No contest history available" : "No platform data available for rating chart"}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Main component
const UserProfilePage = () => {
    const router = useRouter();
    const { username } = useParams<{ username: string }>();
    const signedIn = useAppSelector((state: any) => state.signedIn);
    const [selectedPlatformIndex, setSelectedPlatformIndex] = useState(0);

    // API calls
    const userQuery = useQuery({
        queryKey: ["user", username],
        queryFn: async (): Promise<UserData> => {
            const res = await fetch("/api/userdata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handle: username }),
            });
            return res.json();
        },
        refetchOnWindowFocus: false,
        refetchInterval: 5 * 60 * 1000,
        retry: 1,
        retryDelay: 1000,
    });

    const { data: alreadyFriend } = useFriendCheckQuery(username);
    const [addFriend, { isLoading: isAdding, isSuccess: addSuccess }] = useAddFriendMutation();

    // Effects
    useEffect(() => {
        if (addSuccess) {
            toast.success("Friend added!");
        }
    }, [addSuccess]);

    // Memoized values
    const platformData = useMemo(() => {
        if (!userQuery.data) return null;

        return {
            gfg: getSafeData(userQuery.data[2]),
            codeforces: getSafeData(userQuery.data[1]),
            leetcode: getSafeData(userQuery.data[3]),
        };
    }, [userQuery.data]);

    const chartPlatforms = useMemo(() => {
        if (!userQuery.data) return [];

        return PLATFORMS.map(platform => ({
            name: platform.name,
            index: platform.index,
            data: userQuery.data[platform.index as keyof UserData] as PlatformData,
        }));
    }, [userQuery.data]);

    const isOwnProfile = signedIn?.username === username;
    const showAddFriendButton = !isOwnProfile && !alreadyFriend && !addSuccess;

    // Event handlers
    const handleAddFriend = () => {
        if (signedIn.isSignedIn) {
            addFriend({ username });
        } else {
            router.push('/sign-in');
        }
    };

    // Loading and error states
    if (userQuery.isLoading || isAdding) {
        return <Loader />;
    }

    if (userQuery.isError) {
        return <ErrorMessage message={(userQuery.error as Error).message} />;
    }

    if (!userQuery.data || userQuery.data.message) {
        return <NotFoundMessage message={userQuery.data?.message || "User not found"} />;
    }

    if (!platformData) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {showAddFriendButton && (
                <AddFriendButton
                    onAddFriend={handleAddFriend}
                    isSignedIn={signedIn.isSignedIn}
                />
            )}

            {/* Platform Profile Links */}
            <div className="w-full grid lg:flex lg:justify-between grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 my-8 justify-items-center">
                <PlatformCard platform="leetcode" username={userQuery.data[4].leetcode} icon="/leetcode.svg" />
                <PlatformCard platform="codeforces" username={userQuery.data[4].codeforces} icon="/codeforces.svg" />
                <PlatformCard platform="gfg" username={userQuery.data[4].gfg} icon="/gfg.svg" />
                <PlatformCard platform="codechef" username={userQuery.data[4].codechef} icon="/codechef.svg" />
            </div>

            {/* Statistics Cards */}
            <div className="w-full grid lg:flex lg:justify-between grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                <StatsCard
                    title="GeeksforGeeks Stats"
                    data={platformData.gfg}
                    hasError={userQuery.data[2]?.status === "error"}
                />
                <StatsCard
                    title="Codeforces Stats"
                    data={platformData.codeforces}
                    hasError={userQuery.data[1]?.status === "error"}
                />
                <StatsCard
                    title="Leetcode Stats"
                    data={platformData.leetcode}
                    hasError={userQuery.data[3]?.status === "error"}
                />
            </div>

            {/* Rating Chart */}
            <div className="w-full py-8">
                <RatingChart
                    platforms={chartPlatforms}
                    selectedIndex={selectedPlatformIndex}
                    onIndexChange={setSelectedPlatformIndex}
                />
            </div>
        </div>
    );
};

export default UserProfilePage;