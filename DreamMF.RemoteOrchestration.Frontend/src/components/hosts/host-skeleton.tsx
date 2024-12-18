import { Card, CardContent } from '@/components/ui/card';

export const HostSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-200 rounded dark:bg-gray-700" />
                        <div className="h-3 w-24 bg-gray-200 rounded dark:bg-gray-700" />
                    </div>
                    {/* IP Address skeleton */}
                    <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700" />
                </div>

                <div className="mt-4 space-y-2">
                    {/* System Info skeleton */}
                    <div className="h-3 w-full bg-gray-200 rounded dark:bg-gray-700" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded dark:bg-gray-700" />
                </div>

                <div className="mt-4 flex items-center space-x-4">
                    {/* Memory skeleton */}
                    <div className="h-3 w-24 bg-gray-200 rounded dark:bg-gray-700" />
                    {/* CPU skeleton */}
                    <div className="h-3 w-24 bg-gray-200 rounded dark:bg-gray-700" />
                </div>
            </CardContent>
        </Card>
    );
};
