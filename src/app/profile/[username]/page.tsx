'use client'
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "react-toastify";
import Loader from "@/app/Components/Loader";
import { useAppSelector } from "@/lib/hooks";
import { useAddFriendMutation, useFriendCheckQuery } from "@/lib/requests/friendData";
import { PlatformData, UserData } from "@/types/model";

// Dynamic imports for heavy components
const RatingChart = lazy(() => import('@/app/Components/RatingChart'));

// Dynamic import for chart libraries (only load when needed)
const loadChartLibraries = () => {
    return Promise.all([
        import("@/components/ui/chart"),
        import("recharts")
    ]);
};

// Constants
const PLATFORMS = [
    { name: "CodeChef", index: 0, icon: "/codechef.svg", urlBase: "https://www.codechef.com/users/" },
    { name: "Codeforces", index: 1, icon: "/codeforces.svg", urlBase: "https://codeforces.com/profile/" },
    { name: "Leetcode", index: 3, icon: "/leetcode.svg", urlBase: "https://www.leetcode.com/" },
] as const;

// Helper functions
const getSafeData = (data: PlatformData | undefined): PlatformData =>
    data?.status === "ok" ? data : { status: 'error', easy: 0, medium: 0, hard: 0, total: 0 };


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

// Chart loading fallback
const ChartFallback = () => (
    <Card className="w-full p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0)] rounded-2xl border-2 border-black h-full">
        <CardContent>
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-pulse text-gray-500">Loading chart...</div>
            </div>
        </CardContent>
    </Card>
);

// Main component
const UserProfilePage = () => {
    const router = useRouter();
    const { username } = useParams<{ username: string }>();
    const signedIn = useAppSelector((state: any) => state.signedIn);
    const [selectedPlatformIndex, setSelectedPlatformIndex] = useState(0);
    const [showChart, setShowChart] = useState(false);

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

    // Load chart when user data is available and user scrolls down
    useEffect(() => {
        if (userQuery.data && !showChart) {
            const timer = setTimeout(() => {
                setShowChart(true);
                // Preload chart libraries
                loadChartLibraries();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [userQuery.data, showChart]);

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
            <div className="w-full bg-white shadow-md rounded-lg p-6 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Image
                        src={userQuery.data[4].avatar || "/default-avatar.png"}
                        alt={`${userQuery.data[4].username}'s avatar`}
                        width={64}
                        height={64}
                        className="rounded-full border-2 border-black"
                    />
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold">{userQuery.data[4].first} {userQuery.data[4].last}</h1>
                        <p className="text-gray-600">@{userQuery.data[4].username}</p>
                    </div>
                </div>
                {showAddFriendButton && (
                    <AddFriendButton
                        onAddFriend={handleAddFriend}
                        isSignedIn={signedIn.isSignedIn}
                    />
                )}
            </div>

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

            {/* Rating Chart - Dynamically Loaded */}
            <div className="w-full py-8">
                {showChart ? (
                    <Suspense fallback={<ChartFallback />}>
                        <RatingChart
                            platforms={chartPlatforms}
                            selectedIndex={selectedPlatformIndex}
                            onIndexChange={setSelectedPlatformIndex}
                        />
                    </Suspense>
                ) : (
                    <ChartFallback />
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;