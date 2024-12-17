import React from 'react';
import { Button, Table, message, Empty, Tag, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useHosts, useDeleteHost } from '@/hooks/useHosts';
import HostModal from '@/components/hosts/host-modal';

const { Text } = Typography;

const HostsPage: React.FC = () => {
    const { data: hosts, isLoading } = useHosts();
    const deleteHost = useDeleteHost();
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editingHost, setEditingHost] = React.useState<any>(null);

    const handleEdit = (host: any) => {
        setEditingHost(host);
        setModalOpen(true);
    };

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

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
            render: (name: string, record: any) => (
                <div>
                    <div>{name}</div>
                    <Text type="secondary" className="text-sm">
                        {record.description}
                    </Text>
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
            title: 'Created',
            dataIndex: 'created_Date',
            key: 'created_Date',
            render: (date: string) => new Date(date).toLocaleDateString(),
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
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.host_ID)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingHost(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Hosts</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Host
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={hosts}
                loading={isLoading}
                rowKey="host_ID"
                locale={{
                    emptyText: (
                        <Empty
                            description="No hosts found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ),
                }}
            />

            <HostModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                editingHost={editingHost}
            />
        </div>
    );
};

export default HostsPage;