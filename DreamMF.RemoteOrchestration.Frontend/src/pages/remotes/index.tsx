import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRemotes, useDeleteRemote } from '@/hooks/useRemotes';

const RemotesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: remotes, isLoading } = useRemotes();
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
            title: 'Storage Type',
            dataIndex: 'storageType',
            key: 'storageType',
        },
        {
            title: 'Created Date',
            dataIndex: 'created_Date',
            key: 'created_Date',
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
