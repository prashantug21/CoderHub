import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from "recharts";
import { PlatformData } from "@/types/model";

const CHART_CONFIG: ChartConfig = {
    rating: {
        label: "Rating",
        color: "#000000",
    },
};

const formatRating = (rating: number | undefined): string =>
    rating ? Math.round(rating).toString() : "-";

interface RatingChartProps {
    platforms: Array<{ name: string; index: number; data: PlatformData }>;
    selectedIndex: number;
    onIndexChange: (index: number) => void;
}

const RatingChart = ({
    platforms,
    selectedIndex,
    onIndexChange
}: RatingChartProps) => {
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

export default RatingChart;