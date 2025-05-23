import React from 'react';
import { Button, Table, Tag, Typography, Tooltip, Popconfirm, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, ApiOutlined } from '@ant-design/icons';
import { useHosts, useDeleteHost } from '@/hooks/useHosts';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { formatDateShort, formatDateFull } from '@/lib/date-utils';
import notify from '../../utils/notifications';

const { Text } = Typography;

const HostsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: hosts, isLoading } = useHosts();
    const deleteHost = useDeleteHost();

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this host?',
            content: 'This action cannot be undone. Please confirm you want to delete this host.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteHost.mutateAsync(id);
                    notify.success('Host deleted successfully');
                } catch (error) {
                    notify.error('Error', 'Failed to delete host');
                }
            }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        notify.success('Key copied to clipboard');
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

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => (
                <div>
                    <div><b>{name}</b></div>
                </div>
            ),
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            ellipsis: true,
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
            ellipsis: true,
            render: (key: string) => (
                <div className="flex items-center gap-2 rounded-[8px] pl-[10px] pr-[10px] dark:!bg-[#351515] !bg-[#ffb8b8] py-1 h-[32px] min-w-0">
                    <Tooltip title="Copy full key">
                        <Button
                            type="text"
                            size="small"
                            className="!p-0 flex-shrink-0"
                            icon={<CopyOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(key);
                            }}
                        />
                    </Tooltip>
                    <Text className="font-mono text-sm flex items-center truncate" ellipsis>
                        {key.substring(0, 8)}...{key.substring(key.length - 8)}
                    </Text>
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
            width: 100,
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.remoteCount} remote${record.remoteCount === 1 ? '' : 's'} attached`}>
                        <Tag icon={<ApiOutlined />} color="purple">
                            {record.remoteCount}
                        </Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Updated',
            dataIndex: 'updated_Date',
            key: 'updated_Date',
            width: 120,
            render: (date: string) => (
                <Tooltip title={formatDateFull(date)}>
                    <span>{formatDateShort(date)}</span>
                </Tooltip>
            ),
            sorter: (a: any, b: any) => {
                if (!a.updated_Date || !b.updated_Date) return 0;
                return new Date(a.updated_Date).getTime() - new Date(b.updated_Date).getTime();
            },
        },
        {
            title: 'Created',
            dataIndex: 'created_Date',
            key: 'created_Date',
            width: 120,
            render: (date: string) => (
                <Tooltip title={formatDateFull(date)}>
                    <span>{formatDateShort(date)}</span>
                </Tooltip>
            ),
            sorter: (a: any, b: any) => new Date(a.created_Date).getTime() - new Date(b.created_Date).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            className="flex items-center justify-center w-8 h-8"
                            icon={<EditOutlined className="text-lg" />}
                            onClick={() => navigate(`/hosts/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            type="text" 
                            danger 
                            className="flex items-center justify-center w-8 h-8"
                            icon={<DeleteOutlined className="text-lg" />} 
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
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