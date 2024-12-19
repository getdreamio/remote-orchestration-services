import React from 'react';
import { Button, Table, message, Tag, Typography, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, ApiOutlined } from '@ant-design/icons';
import { useHosts, useDeleteHost, useHostRemoteCounts } from '@/hooks/useHosts';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const { Text } = Typography;

const HostsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: hosts, isLoading } = useHosts();
    const { data: remoteCounts } = useHostRemoteCounts();
    const deleteHost = useDeleteHost();

    const handleDelete = async (id: number) => {
        try {
            await deleteHost.mutateAsync(id);
            message.success('Host deleted successfully');
        } catch (error) {
            message.error('Failed to delete host');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Key copied to clipboard');
    };

    const getEnvironmentColor = (environment: string) => {
        switch (environment.toLowerCase()) {
            case 'development':
                return 'blue';
            case 'staging':
                return 'orange';
            case 'production':
                return 'green';
            default:
                return 'default';
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
            render: (name: string) => (
                <div>
                    <div><b>{name}</b></div>
                </div>
            ),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            render: (url: string) => (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                </a>
            ),
        },
        {
            title: 'Access Key',
            dataIndex: 'key',
            key: 'key',
            render: (key: string) => (
                <div className="flex items-center gap-2">
                    <Text className="font-mono text-sm" ellipsis>
                        {key.substring(0, 8)}...{key.substring(key.length - 8)}
                    </Text>
                    <Tooltip title="Copy full key">
                        <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(key);
                            }}
                        />
                    </Tooltip>
                </div>
            ),
        },
        {
            title: 'Environment',
            dataIndex: 'environment',
            key: 'environment',
            render: (environment: string) => (
                <Tag color={getEnvironmentColor(environment)}>
                    {environment.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Development', value: 'development' },
                { text: 'Staging', value: 'staging' },
                { text: 'Production', value: 'production' },
            ],
            onFilter: (value: string, record: any) =>
                record.environment.toLowerCase() === value.toLowerCase(),
        },
        {
            title: 'Remotes',
            key: 'remotes',
            render: (_: any, record: any) => {
                const count = remoteCounts?.find(rc => rc.hostId === record.id)?.count || 0;
                return (
                    <Tooltip title={`${count} remote${count === 1 ? '' : 's'} connected`}>
                        <div className="flex items-center gap-1">
                            <ApiOutlined />
                            <span>{count}</span>
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_Date',
            key: 'updated_Date',
            render: (date: string) => formatDate(date),
            sorter: (a: any, b: any) => {
                if (!a.updated_Date || !b.updated_Date) return 0;
                return new Date(a.updated_Date).getTime() - new Date(b.updated_Date).getTime();
            },
        },
        {
            title: 'Created',
            dataIndex: 'created_Date',
            key: 'created_Date',
            render: (date: string) => formatDate(date),
            sorter: (a: any, b: any) => new Date(a.created_Date).getTime() - new Date(b.created_Date).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/hosts/${record.id}`)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this host?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Helmet>
                <title>[ROS] | List Hosts</title>
                <meta name="description" content="Dream.mf [ROS] | List Hosts Page" />
            </Helmet>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Hosts</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/hosts/new')}
                >
                    New Host
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={hosts}
                loading={isLoading}
                rowKey="id"
            />
        </div>
    );
};

export default HostsPage;