import React from 'react';
import { Card, Row, Col, Statistic, Button, Progress, Spin } from 'antd';
import { useHosts } from '@/hooks/useHosts';
import { useTags } from '@/hooks/useTags';
import { useRemotes } from '@/hooks/useRemotes';
import { ServerIcon, TagIcon, DatabaseIcon, ClockIcon, ArrowRightIcon, BarChart3Icon, AlertCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';

// Mock data for analytics and logs (replace with real data later)
const analyticsData = {
    hostUptime: 99.9,
    errorRate: 0.3,
    errors24h: 42,
    errors30d: 1240,
    requests24h: 15482,
    requests30d: 428650,
    avgResponseTime: 120,
    s3ResponseTime: 42,
    azureResponseTime: 38,
    dbResponseTime: 12,
};

const recentLogs = {
    information: [
        { timestamp: '2023-12-18 13:45:23', message: 'Remote service deployment completed successfully' },
        { timestamp: '2023-12-18 13:42:15', message: 'Backup process initiated' },
        { timestamp: '2023-12-18 13:40:00', message: 'System health check completed' }
    ],
    warnings: [
        { timestamp: '2023-12-18 13:44:10', message: 'High memory usage detected on host-01' },
        { timestamp: '2023-12-18 13:41:30', message: 'Slow response time from storage service' },
        { timestamp: '2023-12-18 13:39:45', message: 'Database connection pool nearing capacity' }
    ],
    exceptions: [
        { timestamp: '2023-12-18 13:43:05', message: 'Failed to connect to remote endpoint' },
        { timestamp: '2023-12-18 13:40:55', message: 'Authentication token expired' },
        { timestamp: '2023-12-18 13:38:20', message: 'Database query timeout' }
    ]
};

interface RecentRemoteAnalytics {
    last24HoursCount: number;
    last30DaysCount: number;
    queryTime: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: hosts } = useHosts();
    const { data: tags } = useTags();
    const { data: remotes } = useRemotes();

    const { data: recentAnalytics, isLoading: isLoadingAnalytics } = useQuery<RecentRemoteAnalytics>({
        queryKey: ['recentRemoteAnalytics'],
        queryFn: async () => {
            const response = await fetch(`${config.backendUrl}/api/analytics/recent-remotes`);
            if (!response.ok) throw new Error('Failed to fetch recent analytics');
            return response.json();
        },
    });

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case 'error':
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircleIcon className="h-4 w-4 text-blue-500" />;
        }
    };

    const getEnvironmentBadgeColor = (environment: string) => {
        switch (environment.toLowerCase()) {
            case 'production':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'staging':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'development':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <div>
            <Helmet>
                <title>[ROS] | Dashboard</title>
                <meta name="description" content="Dream.mf [ROS] | Dashboard Page" />
            </Helmet>
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card 
                        className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-gray-50 dark:bg-gray-800"
                        onClick={() => navigate('/hosts')}
                    >
                        <Statistic
                            title={<div className="text-lg font-semibold">Total Hosts</div>}
                            value={hosts?.length || 0}
                            prefix={<ServerIcon className="mr-2" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card 
                        className="border-l-4 border-l-purple-500 dark:border-l-purple-400 bg-gray-50 dark:bg-gray-800"
                        onClick={() => navigate('/tags')}
                    >
                        <Statistic
                            title={<div className="text-lg font-semibold">Total Tags</div>}
                            value={tags?.length || 0}
                            prefix={<TagIcon className="mr-2" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card 
                        className="border-l-4 border-l-green-500 dark:border-l-green-400 bg-gray-50 dark:bg-gray-800"
                        onClick={() => navigate('/remotes')}
                    >
                        <Statistic
                            title={<div className="text-lg font-semibold">Total Remotes</div>}
                            value={remotes?.length || 0}
                            prefix={<DatabaseIcon className="mr-2" />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card title="System Health" className="h-full bg-gray-50 dark:bg-gray-800">
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Statistic
                                            title="AWS S3"
                                            value={analyticsData.s3ResponseTime || 42}
                                            suffix="ms"
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </div>
                                    <div>
                                        <Statistic
                                            title="Azure Blob"
                                            value={analyticsData.azureResponseTime || 38}
                                            suffix="ms"
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </div>
                                    <div>
                                        <Statistic
                                            title="Database"
                                            value={analyticsData.dbResponseTime || 12}
                                            suffix="ms"
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                    <Card 
                        title="Remote Usage"
                        className="h-full bg-gray-50 dark:bg-gray-800"
                        extra={<Button type="link" onClick={() => navigate('/analytics')}>View Usage</Button>}>
                            {isLoadingAnalytics ? (
                                <div className="h-24 flex items-center justify-center">
                                    <Spin />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Statistic
                                            title="24 Hour Total"
                                            value={recentAnalytics?.last24HoursCount ?? 0}
                                            suffix="requests"
                                        />
                                        <Statistic
                                            title="30 Day Total"
                                            value={recentAnalytics?.last30DaysCount ?? 0}
                                            suffix="requests"
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card 
                            title="Error Rate"
                            className="h-full bg-gray-50 dark:bg-gray-800"
                            extra={<Button type="link" onClick={() => navigate('/analytics')}>View Analytics</Button>}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Statistic
                                        title="24 Hour Average"
                                        value={analyticsData.errors24h}
                                        suffix="errors"
                                        valueStyle={{ color: analyticsData.errors24h > 50 ? '#cf1322' : '#3f8600' }}
                                    />
                                    <Statistic
                                        title="30 Day Average"
                                        value={Math.round(analyticsData.errors30d / 30)}
                                        suffix="errors"
                                        valueStyle={{ color: (analyticsData.errors30d / 30) > 50 ? '#cf1322' : '#3f8600' }}
                                    />
                                </div>
                                <div className="pt-2">
                                    <Progress
                                        percent={Math.round((analyticsData.errors24h / 100) * 100)}
                                        size="small"
                                        strokeColor={analyticsData.errors24h > 50 ? '#cf1322' : '#3f8600'}
                                        showInfo={false}
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">System Logging</h2>
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Card 
                            title="Recent Logs"
                            className="h-full bg-gray-50 dark:bg-gray-800"
                            extra={<Button type="link" onClick={() => navigate('/logging')}>View All Logs</Button>}
                        >
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-base font-medium mb-2 text-blue-600 dark:text-blue-400">Information</h3>
                                    <div className="space-y-2">
                                        {recentLogs.information.map((log, i) => (
                                            <div key={i} className="text-sm">
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{log.timestamp}</div>
                                                <div className="text-gray-900 dark:text-gray-100">{log.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium mb-2 text-yellow-600 dark:text-yellow-400">Warnings</h3>
                                    <div className="space-y-2">
                                        {recentLogs.warnings.map((log, i) => (
                                            <div key={i} className="text-sm">
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{log.timestamp}</div>
                                                <div className="text-gray-900 dark:text-gray-100">{log.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium mb-2 text-red-600 dark:text-red-400">Exceptions</h3>
                                    <div className="space-y-2">
                                        {recentLogs.exceptions.map((log, i) => (
                                            <div key={i} className="text-sm">
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{log.timestamp}</div>
                                                <div className="text-gray-900 dark:text-gray-100">{log.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Changes</h2>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card
                            title="Recent Hosts"
                            extra={<Button type="link" onClick={() => navigate('/hosts')}>View All</Button>}
                            className="h-full bg-gray-50 dark:bg-gray-800"
                        >
                            <div className="space-y-3">
                                {hosts?.slice(0, 3).map((host, i) => (
                                    <div key={i} className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/hosts/${host.id}`)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ServerIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                                <span className="font-medium">{host.name}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEnvironmentBadgeColor(host.environment)}`}>
                                                {host.environment}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground/70">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>Updated {formatDate(host.updated_Date)}</span>
                                        </div>
                                    </div>
                                ))}
                                {!hosts?.length && <p className="text-muted-foreground dark:text-muted-foreground/70">No hosts found</p>}
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card
                            title="Recent Tags"
                            extra={<Button type="link" onClick={() => navigate('/tags')}>View All</Button>}
                            className="h-full bg-gray-50 dark:bg-gray-800"
                        >
                            <div className="space-y-3">
                                {tags?.slice(0, 3).map((tag, i) => (
                                    <div key={i} className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <TagIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                            <span className="font-medium">{tag.text}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground/70">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>Updated {formatDate(tag.updated_Date)}</span>
                                        </div>
                                    </div>
                                ))}
                                {!tags?.length && <p className="text-muted-foreground dark:text-muted-foreground/70">No tags found</p>}
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card
                            title="Recent Remotes"
                            extra={<Button type="link" onClick={() => navigate('/remotes')}>View All</Button>}
                            className="h-full bg-gray-50 dark:bg-gray-800"
                        >
                            <div className="space-y-3">
                                {remotes?.slice(0, 3).map((remote, i) => (
                                    <div key={i} className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/remotes/${remote.id}`)}>
                                        <div className="flex items-center gap-2">
                                            <DatabaseIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
                                            <span className="font-medium">{remote.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-muted-foreground/70">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>Updated {formatDate(remote.updated_Date)}</span>
                                        </div>
                                    </div>
                                ))}
                                {!remotes?.length && <p className="text-muted-foreground dark:text-muted-foreground/70">No remotes found</p>}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DashboardPage;
