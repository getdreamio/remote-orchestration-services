import React from 'react';
import { Button, Table, message, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useHosts, useDeleteHost } from '@/hooks/useHosts';
import HostModal from '@/components/hosts/host-modal';

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

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Hostname',
            dataIndex: 'hostname',
            key: 'hostname',
        },
        {
            title: 'Port',
            dataIndex: 'port',
            key: 'port',
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