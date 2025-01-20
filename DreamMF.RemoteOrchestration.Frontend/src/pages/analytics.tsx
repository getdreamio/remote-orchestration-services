import React from 'react';
import { Card, Row, Col, Statistic, Spin, Progress, Table } from 'antd';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';
import { Helmet } from 'react-helmet';
import { ArrowUpIcon, ArrowDownIcon, BarChart3Icon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface EntityAnalytics {
    entityId: number;
    entityName: string;
    totalReads: number;
    totalUpdates: number;
    totalCreates: number;
    totalDeletes: number;
    last30DaysActions: number;
    last24HoursActions: number;
}

interface DailyEntityAnalytics {
    readDate: string;
    entityId: number;
    entityName: string;
    totalReads: number;
    readCount: number;
    updateCount: number;
    createCount: number;
    deleteCount: number;
}

interface AnalyticsSummary {
    topHosts: EntityAnalytics[];
    topRemotes: EntityAnalytics[];
    recentHostActivity: DailyEntityAnalytics[];
    recentRemoteActivity: DailyEntityAnalytics[];
}

const fetchAnalyticsSummary = async () => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/analytics/summary`);
    if (!response.ok) throw new Error('Failed to fetch analytics summary');
    return response.json();
};

const fetchHostAnalytics = async () => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/analytics/hosts`);
    if (!response.ok) throw new Error('Failed to fetch host analytics');
    return response.json();
};

const fetchRemoteAnalytics = async () => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/analytics/remotes`);
    if (!response.ok) throw new Error('Failed to fetch remote analytics');
    return response.json();
};

const AnalyticsPage: React.FC = () => {
    // Fetch analytics data
    const { data: summary, isLoading: isLoadingSummary } = useQuery<AnalyticsSummary>({
        queryKey: ['analyticsSummary'],
        queryFn: fetchAnalyticsSummary,
    });

    const { data: hostAnalytics = [], isLoading: isLoadingHosts } = useQuery<EntityAnalytics[]>({
        queryKey: ['hostAnalytics'],
        queryFn: fetchHostAnalytics,
    });

    const { data: remoteAnalytics = [], isLoading: isLoadingRemotes } = useQuery<EntityAnalytics[]>({
        queryKey: ['remoteAnalytics'],
        queryFn: fetchRemoteAnalytics,
    });

    const navigate = useNavigate();

    // Sort remotes by last 30 days actions and limit to 5
    const sortedByUsage = [...remoteAnalytics]
        .sort((a, b) => b.last30DaysActions - a.last30DaysActions)
        .slice(0, 5);

    // Transform today's CRUD stats from the most recent activity
    const todayRemoteActivity = summary?.recentRemoteActivity[0] || {
        readCount: 0,
        updateCount: 0,
        createCount: 0,
        deleteCount: 0,
    };

    // Transform activity data for the stacked bar chart
    const activityData = React.useMemo(() => {
        if (!summary?.recentRemoteActivity) return [];
        
        // Get today's date for filtering
        const today = new Date('2024-12-19T13:43:11-07:00');
        today.setHours(0, 0, 0, 0);

        // Filter and transform today's activity
        return summary.recentRemoteActivity
            .filter(activity => {
                const activityDate = new Date(activity.readDate);
                return activityDate >= today;
            })
            .map(activity => ({
                hour: new Date(activity.readDate).getHours(),
                Created: activity.createCount,
                Read: activity.readCount,
                Updated: activity.updateCount,
                Deleted: activity.deleteCount,
            }))
            .reduce((acc, curr) => {
                const existing = acc.find(item => item.hour === curr.hour);
                if (existing) {
                    existing.Created += curr.Created;
                    existing.Read += curr.Read;
                    existing.Updated += curr.Updated;
                    existing.Deleted += curr.Deleted;
                } else {
                    acc.push(curr);
                }
                return acc;
            }, [] as Array<{ hour: number; Created: number; Read: number; Updated: number; Deleted: number }>)
            .sort((a, b) => a.hour - b.hour);
    }, [summary?.recentRemoteActivity]);

    // Calculate CRUD operation totals and percentages
    const crudStats = React.useMemo(() => {
        const stats = {
            Created: todayRemoteActivity.createCount,
            Read: todayRemoteActivity.readCount,
            Updated: todayRemoteActivity.updateCount,
            Deleted: todayRemoteActivity.deleteCount
        };
        
        const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
        
        return {
            data: Object.entries(stats).map(([name, value]) => ({
                name,
                value,
                percentage: total > 0 ? Math.round((value / total) * 100) : 0,
                color: name === 'Created' ? '#22c55e' : 
                       name === 'Read' ? '#0284c7' : 
                       name === 'Updated' ? '#f59e0b' : 
                       '#ef4444'
            })),
            total
        };
    }, [todayRemoteActivity]);

    const remoteColumns = [
        {
            title: 'Remote Name',
            dataIndex: 'entityName',
            key: 'entityName',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.entityName.localeCompare(b.entityName),
            render: (text: string, record: EntityAnalytics) => (
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {text}
                </span>
            ),
        },
        {
            title: 'Total Reads',
            dataIndex: 'totalReads',
            key: 'totalReads',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalReads - b.totalReads,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Total Updates',
            dataIndex: 'totalUpdates',
            key: 'totalUpdates',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalUpdates - b.totalUpdates,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Total Creates',
            dataIndex: 'totalCreates',
            key: 'totalCreates',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalCreates - b.totalCreates,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Total Deletes',
            dataIndex: 'totalDeletes',
            key: 'totalDeletes',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalDeletes - b.totalDeletes,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Last 30 Days',
            dataIndex: 'last30DaysActions',
            key: 'last30DaysActions',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.last30DaysActions - b.last30DaysActions,
            render: (value: number) => value.toLocaleString(),
        },
    ];

    const hostColumns = [
        {
            title: 'Host Name',
            dataIndex: 'entityName',
            key: 'entityName',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.entityName.localeCompare(b.entityName),
            render: (text: string, record: EntityAnalytics) => (
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    {text}
                </span>
            ),
        },
        {
            title: 'Total Reads',
            dataIndex: 'totalReads',
            key: 'totalReads',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalReads - b.totalReads,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Total Updates',
            dataIndex: 'totalUpdates',
            key: 'totalUpdates',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalUpdates - b.totalUpdates,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Total Creates',
            dataIndex: 'totalCreates',
            key: 'totalCreates',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalCreates - b.totalCreates,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Total Deletes',
            dataIndex: 'totalDeletes',
            key: 'totalDeletes',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.totalDeletes - b.totalDeletes,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Last 30 Days',
            dataIndex: 'last30DaysActions',
            key: 'last30DaysActions',
            sorter: (a: EntityAnalytics, b: EntityAnalytics) => a.last30DaysActions - b.last30DaysActions,
            render: (value: number) => value.toLocaleString(),
        },
    ];

    return (
        <div className="space-y-6">
            <Helmet>
                <title>[ROS] | Analytics</title>
                <meta name="description" content="Dream.mf [ROS] | Analytics Page" />
            </Helmet>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Analytics</h1>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(summary?.recentRemoteActivity[0]?.readDate || new Date()).toLocaleString()}
                </div>
            </div>

            {/* Recent Remote Usage Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Card className="bg-gray-50 dark:bg-gray-800">
                        {isLoadingSummary ? (
                            <div className="h-32 flex items-center justify-center">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3Icon className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-medium">Recent Remote Usage</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <Statistic
                                            title={<span className="text-sm">Last 24 Hours</span>}
                                            value={summary?.topRemotes[0]?.last24HoursActions ?? 0}
                                            suffix="actions"
                                            valueStyle={{ color: '#0284c7' }}
                                        />
                                    </div>
                                    <div>
                                        <Statistic
                                            title={<span className="text-sm">Last 30 Days</span>}
                                            value={summary?.topRemotes[0]?.last30DaysActions ?? 0}
                                            suffix="actions"
                                            valueStyle={{ color: '#22c55e' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="bg-gray-50 dark:bg-gray-800">
                        {isLoadingSummary ? (
                            <div className="h-32 flex items-center justify-center">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <ClockIcon className="h-5 w-5 text-purple-500" />
                                    <h3 className="text-lg font-medium">Daily Trends</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <Statistic
                                            title={<span className="text-sm">Reads Trend</span>}
                                            value={todayRemoteActivity.readCount}
                                            precision={1}
                                            valueStyle={{ color: todayRemoteActivity.readCount >= 0 ? '#22c55e' : '#ef4444' }}
                                            prefix={todayRemoteActivity.readCount >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                                            suffix="%"
                                        />
                                    </div>
                                    <div>
                                        <Statistic
                                            title={<span className="text-sm">Updates Trend</span>}
                                            value={todayRemoteActivity.updateCount}
                                            precision={1}
                                            valueStyle={{ color: todayRemoteActivity.updateCount >= 0 ? '#22c55e' : '#ef4444' }}
                                            prefix={todayRemoteActivity.updateCount >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                                            suffix="%"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Most Used Remotes (Last 30 Days)" className="bg-gray-50 dark:bg-gray-800">
                        {isLoadingRemotes ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div className="h-[400px] overflow-auto">
                                <div className="space-y-4">
                                    {sortedByUsage.map((remote, index) => (
                                        <div 
                                            key={remote.entityId}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200"
                                            onClick={() => navigate(`/remotes/${remote.entityId}`)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    navigate(`/remotes/${remote.entityId}`);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                        {remote.entityName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Last used: {new Date(summary?.recentRemoteActivity[0]?.readDate).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {remote.last30DaysActions.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    actions
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Today's Operations" className="bg-gray-50 dark:bg-gray-800">
                        {isLoadingSummary ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center">
                                <div className="text-center mb-4">
                                    <div className="text-2xl font-semibold">{crudStats.total.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">Total Operations Today</div>
                                </div>
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={crudStats.data}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="60%"
                                                outerRadius="80%"
                                                paddingAngle={2}
                                            >
                                                {crudStats.data.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name, props) => [
                                                    `${value.toLocaleString()} (${props.payload.percentage}%)`,
                                                    name
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    {crudStats.data.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-sm">
                                                {entry.name}: {entry.value.toLocaleString()} ({entry.percentage}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center text-sm text-muted-foreground mt-4">
                                    {new Date('2024-12-19T13:43:49-07:00').toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Remote Analytics Table */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Remote Analytics Details" className="bg-gray-50 dark:bg-gray-800">
                        <Table
                            dataSource={remoteAnalytics}
                            columns={remoteColumns}
                            rowKey="entityId"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Total ${total} items`,
                            }}
                            loading={isLoadingRemotes}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                            onRow={(record) => ({
                                onClick: () => navigate(`/remotes/${record.entityId}`),
                                style: { cursor: 'pointer' },
                                className: 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'
                            })}
                        />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="Host Analytics Details" className="bg-gray-50 dark:bg-gray-800">
                        <Table
                            dataSource={hostAnalytics}
                            columns={hostColumns}
                            rowKey="entityId"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Total ${total} items`,
                            }}
                            loading={isLoadingHosts}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                            onRow={(record) => ({
                                onClick: () => navigate(`/hosts/${record.entityId}`),
                                style: { cursor: 'pointer' },
                                className: 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'
                            })}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsPage;
