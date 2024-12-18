import React from 'react';
import { Card } from 'antd';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';

interface RemoteAnalytics {
    remoteId: string;
    remoteName: string;
    requestCount: number;
    updateCount: number;
    lastAccessed: string;
    lastUpdated: string;
}

interface DailyStats {
    date: string;
    requests: number;
    updates: number;
}

const AnalyticsPage: React.FC = () => {
    // Fetch analytics data
    const { data: remoteAnalytics = [] } = useQuery<RemoteAnalytics[]>({
        queryKey: ['remoteAnalytics'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/analytics/remotes`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            return response.json();
        },
    });

    const { data: dailyStats = [] } = useQuery<DailyStats[]>({
        queryKey: ['dailyStats'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/analytics/daily`);
            if (!response.ok) throw new Error('Failed to fetch daily stats');
            return response.json();
        },
    });

    // Sort remotes by request count for the usage chart
    const sortedByUsage = [...remoteAnalytics]
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 10);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Analytics</h1>
            
            {/* Top Remotes by Usage */}
            <Card title="Most Used Remotes" className="shadow-sm">
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedByUsage}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="remoteName" 
                                angle={-45} 
                                textAnchor="end" 
                                height={100}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                                dataKey="requestCount" 
                                name="Request Count" 
                                fill="#0284c7"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Daily Activity */}
            <Card title="Daily Activity" className="shadow-sm">
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date" 
                                angle={-45} 
                                textAnchor="end" 
                                height={100}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="requests" 
                                name="Requests" 
                                stroke="#0284c7" 
                                strokeWidth={2}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="updates" 
                                name="Updates" 
                                stroke="#22c55e" 
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Remote Details Table */}
            <Card title="Remote Analytics Details" className="shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Remote Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Requests
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Updates
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Last Accessed
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Last Updated
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {remoteAnalytics.map((remote) => (
                                <tr key={remote.remoteId}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {remote.remoteName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {remote.requestCount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {remote.updateCount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {new Date(remote.lastAccessed).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {new Date(remote.lastUpdated).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
