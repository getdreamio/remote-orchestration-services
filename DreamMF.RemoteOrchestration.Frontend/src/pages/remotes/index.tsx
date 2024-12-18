import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRemotes, useDeleteRemote, useRemoteModuleCounts } from '@/hooks/useRemotes';
import { useRemoteHostCounts } from '@/hooks/useHosts';
import { formatDate } from '@/lib/date-utils';
import { useRemoteSubRemoteCounts } from '@/hooks/useRemotes';

const RemotesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: remotes, isLoading } = useRemotes();
    const { data: hostCounts } = useRemoteHostCounts();
    const { data: moduleCounts } = useRemoteModuleCounts();
    const { data: subRemoteCounts } = useRemoteSubRemoteCounts();
    const deleteRemote = useDeleteRemote();

    const handleDelete = async (id: number) => {
        try {
            await deleteRemote.mutateAsync(id);
            message.success('Remote deleted successfully');
        } catch (error) {
            message.error('Failed to delete remote');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Modules',
            key: 'modules',
            render: (_: any, record: any) => {
                const count = moduleCounts?.find(mc => mc.remoteId === record.id)?.count || 0;
                return (
                    <span>{count}</span>
                );
            },
        },
        {
            title: 'Sub-Remotes',
            key: 'subRemotes',
            render: (_: any, record: any) => {
                const count = subRemoteCounts?.find(src => src.remoteId === record.id)?.count || 0;
                return (
                    <span>{count}</span>
                );
            },
        },
        {
            title: 'Hosts',
            key: 'hosts',
            render: (_: any, record: any) => {
                const count = hostCounts?.find(hc => hc.remoteId === record.id)?.count || 0;
                return (
                    <span>{count}</span>
                );
            },
        },
        {
            title: 'Created Date',
            dataIndex: 'created_Date',
            key: 'created_Date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_Date',
            key: 'updated_Date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <span>
                    <Button
                        type="link"
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
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-2xl font-bold">Remotes</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/remotes/new')}
                >
                    Add Remote
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={remotes}
                loading={isLoading}
                rowKey="id"
            />
        </div>
    );
};

export default RemotesPage;
