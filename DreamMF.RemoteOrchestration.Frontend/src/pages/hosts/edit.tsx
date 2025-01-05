import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Spin, Tabs, Table, Button, Modal, message } from 'antd';
import { LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import HostForm from '@/components/hosts/host-form';
import { useGetHost, useHostRemotes, useAttachRemote, useDetachRemote } from '@/hooks/useHosts';
import { useRemotes } from '@/hooks/useRemotes';
import { formatDate } from '@/lib/date-utils';
import { Helmet } from 'react-helmet';

const { Title } = Typography;
const { TabPane } = Tabs;

const EditHostPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: host, isLoading } = useGetHost(Number(id));
    const { data: hostRemotes } = useHostRemotes(Number(id));
    const { data: allRemotes } = useRemotes();
    const attachRemote = useAttachRemote();
    const detachRemote = useDetachRemote();
    const [activeTab, setActiveTab] = useState('general');
    const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);

    const handleSuccess = () => {
        navigate('/hosts');
    };

    // Filter out already attached remotes
    const availableRemotes = useMemo(() => {
        if (!allRemotes || !hostRemotes) return [];
        const attachedRemoteIds = new Set(hostRemotes.map(hr => hr.id));
        return allRemotes.filter(remote => !attachedRemoteIds.has(remote.id));
    }, [allRemotes, hostRemotes]);

    const handleAttachRemote = async (remoteId: number) => {
        try {
            await attachRemote.mutateAsync({ hostId: Number(id), remoteId });
            message.success('Remote attached successfully');
            setIsAttachModalOpen(false);
        } catch (error) {
            message.error('Failed to attach remote');
        }
    };

    const handleDetachRemote = async (remoteId: number) => {
        try {
            console.log(`Detaching remote ${remoteId} from host ${id}`);
            await detachRemote.mutateAsync({ hostId: Number(id), remoteId });
            message.success('Remote detached successfully');
        } catch (error) {
            message.error('Failed to detach remote');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: any) => name,
        },
        {
            title: 'Scope',
            dataIndex: 'scope',
            key: 'scope',
            render: (scope: any) => scope,
        },
        {
            title: 'Attached Date',
            dataIndex: 'created_Date',
            key: 'created_Date',
            render: (date: string) => formatDate(date),
            sorter: (a: any, b: any) => {
                if (!a.created_date || !b.created_date) return 0;
                return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: any) => (
                <Button
                    type="text"
                    icon={<DisconnectOutlined />}
                    onClick={() => handleDetachRemote(record.id)}
                    danger
                >
                    Detach
                </Button>
            ),
        },
    ];

    const availableRemoteColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Scope',
            dataIndex: 'scope',
            key: 'scope',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => handleAttachRemote(record.id)}
                >
                    Attach
                </Button>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" />
            </div>
        );
    }

    if (!host) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <Title level={4}>Host not found</Title>
                    <button
                        onClick={() => navigate('/hosts')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Hosts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">Edit Host: {host.name}</Title>
            </div>
            <Helmet>
                <title>[ROS] | Edit Host {host.name}</title>
                <meta name="description" content={`Dream.mf [ROS] | Edit Host ${host.name}`} />
            </Helmet>
            <Card className="bg-gray-50 dark:bg-gray-800">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="General" key="general">
                        <HostForm
                            onSuccess={handleSuccess}
                            mode="general"
                            renderFooter={(isSubmitting) => (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                        Update Host
                                    </Button>
                                </div>
                            )}
                            editingHost={{
                                id: host.id,
                                name: host.name,
                                description: host.description,
                                url: host.url,
                                key: host.key,
                                environment: host.environment,
                                repository: host.repository,
                                contactName: host.contactName,
                                contactEmail: host.contactEmail,
                                documentationUrl: host.documentationUrl
                            }}
                        />
                    </TabPane>
                    <TabPane tab="Information" key="information">
                        <HostForm
                            onSuccess={handleSuccess}
                            mode="information"
                            renderFooter={(isSubmitting) => (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                        Update Host
                                    </Button>
                                </div>
                            )}
                            editingHost={{
                                id: host.id,
                                name: host.name,
                                description: host.description,
                                url: host.url,
                                key: host.key,
                                environment: host.environment,
                                repository: host.repository,
                                contactName: host.contactName,
                                contactEmail: host.contactEmail,
                                documentationUrl: host.documentationUrl
                            }}
                        />
                    </TabPane>
                    <TabPane tab="Remotes" key="remotes">
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button
                                    type="primary"
                                    icon={<LinkOutlined />}
                                    onClick={() => setIsAttachModalOpen(true)}
                                >
                                    Attach Remote
                                </Button>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={hostRemotes || []}
                                rowKey="id"
                                pagination={true}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Attach Remote"
                open={isAttachModalOpen}
                onCancel={() => setIsAttachModalOpen(false)}
                footer={null}
                width={800}
            >
                <Table
                    columns={availableRemoteColumns}
                    dataSource={availableRemotes}
                    rowKey="id"
                    pagination={true}
                />
            </Modal>
        </div>
    );
};

export default EditHostPage;
