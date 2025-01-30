import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Table, Button, Tag, Tooltip, Modal, message } from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    DesktopOutlined, 
    AppstoreOutlined,
    BranchesOutlined,
    CloudServerOutlined
} from '@ant-design/icons';
import { useRemotes, useDeleteRemote } from '@/hooks/useRemotes';
import { formatDateShort, formatDateFull } from '@/lib/date-utils';
import { Helmet } from 'react-helmet';

interface Remote {
    id: number;
    name: string;
    scope: string;
    moduleCount: number;
    subRemoteCount: number;
    hostCount: number;
    storageType: string;
    created_Date: string;
    updated_Date: string;
}

const RemotesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: remotes, isLoading } = useRemotes();
    const deleteRemote = useDeleteRemote();

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this remote?',
            content: 'This action cannot be undone. Please confirm you want to delete this remote.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteRemote.mutateAsync(id);
                    message.success('Remote deleted successfully');
                } catch (error) {
                    message.error('Failed to delete remote');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-medium">{text}</span>,
            sorter: (a: Remote, b: Remote) => a.name.localeCompare(b.name),
        },
        {
            title: 'Scope',
            dataIndex: 'scope',
            key: 'scope',
            filters: [
                { text: 'Public', value: 'public' },
                { text: 'Private', value: 'private' },
            ],
            onFilter: (value: string, record: Remote) =>
                record.scope.toLowerCase() === value.toString().toLowerCase(),
        },
        {
            title: 'Modules',
            key: 'modules',
            width: 100,
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.modules.length} module${record.modules.length === 1 ? '' : 's'} attached`}>
                        <Tag icon={<AppstoreOutlined />} color="blue">
                            {record.modules.length || '0'}
                        </Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Remotes',
            key: 'subRemotes',
            width: 100,
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.subRemoteCounts} remote${record.subRemoteCounts === 1 ? '' : 's'} attached`}>
                        <Tag icon={<BranchesOutlined />} color="purple">
                            {record.subRemoteCounts || '0'}
                        </Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Hosts',
            key: 'hosts',
            width: 100,
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.hostCounts} host${record.hostCounts === 1 ? '' : 's'} attached`}>
                        <Tag icon={<CloudServerOutlined />} color="green">
                            {record.hostCounts || '0'}
                        </Tag>
                    </Tooltip>
                );
            }
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
                            onClick={() => navigate(`/remotes/${record.id}`)}
                        />
                    </Tooltip>
                    <Button 
                        type="text" 
                        danger 
                        className="flex items-center justify-center w-8 h-8"
                        icon={<DeleteOutlined className="text-lg" />} 
                        onClick={() => handleDelete(record.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div>
            <Helmet>
                <title>[ROS] | List Remotes</title>
                <meta name="description" content={`Dream.mf [ROS] | List Remotes`} />
            </Helmet>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-2xl font-bold">Remotes</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/remotes/new')}
                >
                    New Remote
                </Button>
            </div>
                <Table
                    columns={columns}
                    dataSource={remotes}
                    rowKey="id"
                    loading={isLoading}
                />
        </div>
    );
};

export default RemotesPage;