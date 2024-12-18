import React from 'react';
import { Card, Row, Col, Statistic, Button, Progress } from 'antd';
import { useHosts } from '@/hooks/useHosts';
import { useTags } from '@/hooks/useTags';
import { useRemotes } from '@/hooks/useRemotes';
import { ServerIcon, TagIcon, DatabaseIcon, ClockIcon, ArrowRightIcon, BarChart3Icon, AlertCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { useNavigate } from 'react-router-dom';

// Mock data for analytics and logs (replace with real data later)
const analyticsData = {
    hostUptime: 99.8,
    remoteUsage: 85.2,
    errorRate: 0.3,
    totalRequests: 15482,
    avgResponseTime: 120,
};

const recentLogs = [
    { type: 'success', message: 'Remote module deployment successful', timestamp: new Date().toISOString() },
    { type: 'error', message: 'Host connection timeout', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { type: 'info', message: 'Configuration updated', timestamp: new Date(Date.now() - 7200000).toISOString() },
];

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: hosts } = useHosts();
    const { data: tags } = useTags();
    const { data: remotes } = useRemotes();

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

    return (
        <div>
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
                                <Progress 
                                    type="circle" 
                                    percent={analyticsData.hostUptime} 
                                    size="small"
                                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                    <Card 
                        title="Remote Usage"
                        className="h-full bg-gray-50 dark:bg-gray-800"
                        extra={<Button type="link" onClick={() => navigate('/analytics')}>View Usage</Button>}>
                            <div className="space-y-4">
                                <Statistic
                                    value={analyticsData.totalRequests}
                                    suffix="requests"
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card 
                            title="Error Rate"
                            className="h-full bg-gray-50 dark:bg-gray-800"
                            extra={<Button type="link" onClick={() => navigate('/analytics')}>View Analytics</Button>}>
                            <div className="space-y-4">
                                <Progress
                                    percent={analyticsData.errorRate}
                                    size="small"
                                    strokeColor="#f5222d"
                                />
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
                            <div className="space-y-4">
                                {recentLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50">
                                        {getLogIcon(log.type)}
                                        <div className="flex-1">
                                            <div className="font-medium">{log.message}</div>
                                            <div className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                                                {formatDate(log.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                        <div className="flex items-center gap-2">
                                            <ServerIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                            <span className="font-medium">{host.name}</span>
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
