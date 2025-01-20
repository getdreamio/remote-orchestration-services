import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Table, Button, Tag, Tooltip, Popconfirm } from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    DesktopOutlined, 
    AppstoreOutlined,
    BranchesOutlined 
} from '@ant-design/icons';
import { useRemotes, useDeleteRemote } from '@/hooks/useRemotes';
import { formatDate } from '@/lib/date-utils';
import { Helmet } from 'react-helmet';

interface Remote {
    id: number;
    name: string;
    scope: string;
    modules: string[];
    storageType: string;
    created_Date: string;
    updated_Date: string;
}

const RemotesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: remotes, isLoading } = useRemotes();
    const deleteRemote = useDeleteRemote();

    const handleDelete = async (id: number) => {
        try {
            await deleteRemote.mutateAsync(id);
        } catch (error) {
            console.error('Failed to delete remote:', error);
        }
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
            render: (scope: string) => <Tag>{scope}</Tag>,
            filters: [
                { text: 'Global', value: 'global' },
                { text: 'Local', value: 'local' },
            ],
            onFilter: (value: string | number | boolean, record: Remote) =>
                record.scope.toLowerCase() === value.toString().toLowerCase(),
        },
        {
            title: 'Modules',
            key: 'modules',
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.modules.length} module${record.modules.length === 1 ? '' : 's'}`}>
                        <div className="flex items-center gap-1">
                            <AppstoreOutlined />
                            <span>{record.modules.length}</span>
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Sub-Remotes',
            key: 'subRemotes',
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.subRemoteCounts} sub-remote${record.subRemoteCounts === 1 ? '' : 's'}`}>
                        <div className="flex items-center gap-1">
                            <BranchesOutlined />
                            <span>{record.subRemoteCounts}</span>
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Hosts',
            key: 'hosts',
            render: (_: any, record: any) => {
                return (
                    <Tooltip title={`${record.hostCounts} host${record.hostCounts === 1 ? '' : 's'}`}>
                        <div className="flex items-center gap-1">
                            <DesktopOutlined />
                            <span>{record.hostCounts}</span>
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_Date',
            key: 'updated_Date',
            render: (date: string) => formatDate(date),
            sorter: (a: Remote, b: Remote) => {
                if (!a.updated_Date || !b.updated_Date) return 0;
                return new Date(a.updated_Date).getTime() - new Date(b.updated_Date).getTime();
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Remote) => (
                <span onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/remotes/${record.id}`)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this remote?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
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