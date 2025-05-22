import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Spin, Tabs, Table, Button, Modal, Select, Space } from 'antd';
import { LinkOutlined, DisconnectOutlined, DeleteOutlined } from '@ant-design/icons';
import HostForm from '@/components/hosts/host-form';
import HostConfigForm from '@/components/hosts/host-config-form';
import { useGetHost, useHostRemotes, useAttachRemote, useDetachRemote, useDeleteHost, useSetCurrentVersionOverride } from '@/hooks/useHosts';
import { useRemotes } from '@/hooks/useRemotes';
import { formatDate } from '@/lib/date-utils';
import { Helmet } from 'react-helmet';
import notify from '../../utils/notifications';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getApiUrl } from '@/utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { generateUUID } from '@/utils/guid';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const EditHostPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { data: host, isLoading } = useGetHost(Number(id));
    const { data: hostRemotes } = useHostRemotes(Number(id));
    const { data: allRemotes } = useRemotes();
    const attachRemote = useAttachRemote();
    const detachRemote = useDetachRemote();
    const deleteHost = useDeleteHost();
    const setCurrentVersionOverride = useSetCurrentVersionOverride();
    const [activeTab, setActiveTab] = useState('general');
    const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
    const [remoteVersionsMap, setRemoteVersionsMap] = useState<Record<string, any[]>>({});
    const [loadingVersions, setLoadingVersions] = useState<Record<string, boolean>>({});

    // Step 1: After the table loads, fetch versions for each remote
    useEffect(() => {
        const fetchVersionsForRemotes = async () => {

            // Only proceed if we have remotes
            if (!hostRemotes || hostRemotes.length === 0) return;
            
            
            // Process each remote
            for (const remote of hostRemotes) {
                // Skip if remoteId is missing
                if (!remote.id) {
                    console.warn('Skipping remote with no remoteId:', remote);
                    continue;
                }
                
                // Set loading state for this remote
                setLoadingVersions(prev => ({ ...prev, [remote.id]: true }));
                
                try {
                    // Fetch versions from API
                    const response = await fetchWithAuth(getApiUrl(`/api/remotes/${remote.id}/versions`));
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch versions for remote ${remote.id}: ${response.statusText}`);
                    }
                    
                    // Parse the response
                    const data = await response.json();
                    
                    // Ensure each version has a url property
                    const versionsWithUrls = Array.isArray(data) ? data.map((version: any) => ({
                        ...version,
                        // Make sure each version has a URL
                        url: version.url || `${remote.url || ''}/${version.value}`
                    })) : [];
                    
                    
                    // Store the versions in state
                    setRemoteVersionsMap(prev => ({
                        ...prev,
                        [remote.id]: versionsWithUrls
                    }));
                } catch (error) {
                    console.error(`Error fetching versions for remote ${remote.id}:`, error);
                } finally {
                    // Clear loading state
                    setLoadingVersions(prev => ({ ...prev, [remote.id]: false }));
                }
            }
        };
        
        // Execute the fetch function
        fetchVersionsForRemotes();
    }, [hostRemotes]);

    const handleSuccess = () => {
        notify.success('Host updated successfully');
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
            
            // Invalidate queries to refresh both the host remotes and all remotes data
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['hostRemotes', Number(id)] }),
                queryClient.invalidateQueries({ queryKey: ['remotes'] })
            ]);
            
            notify.success('Remote attached successfully');
        } catch (error) {
            notify.error('Error', 'Failed to attach remote');
        }
    };

    const handleDetachRemote = async (remoteId: number) => {
        try {
            await detachRemote.mutateAsync({ hostId: Number(id), remoteId });
            notify.success('Remote detached successfully');
        } catch (error) {
            notify.error('Error', 'Failed to detach remote');
        }
    };

    const handleSetVersionOverride = async (remoteId: number, url: string | null) => {
        try {
            await setCurrentVersionOverride.mutateAsync({ 
                hostId: Number(id), 
                remoteId, 
                url 
            });
            
            if (url === null) {
                notify.success('Using default remote version');
            } else {
                notify.success('Version override set successfully');
            }
            
            // Refresh the host remotes data to update the UI
            await queryClient.invalidateQueries({ queryKey: ['hostRemotes', Number(id)] });
        } catch (error) {
            notify.error('Error', 'Failed to set version override');
        }
    };

    const handleDeleteHost = () => {
        Modal.confirm({
            title: 'Are you sure you want to delete this host?',
            content: 'This action cannot be undone. Please confirm you want to delete this host.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteHost.mutateAsync(Number(id));
                    notify.success('Host deleted successfully');
                    navigate('/hosts');
                } catch (error) {
                    notify.error('Error', 'Failed to delete host');
                }
            }
        });
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
            title: 'Version Override',
            key: 'versionOverride',
            render: (record: any) => {                
                // Get versions for this remote
                const versions = [...(remoteVersionsMap[record.id] || [])]
                    // Sort by updated_Date in descending order
                    .sort((a, b) => b.updated_Date - a.updated_Date);
                console.log('record', record)
                return (
                    <Space direction="vertical" style={{ width: '100%' }} key={record.id}>
                        { versions.length > 0 ? (
                        <Select
                            style={{ width: 240 }}
                            placeholder="Select version"
                            loading={loadingVersions[record.id]}
                            onChange={(value) => handleSetVersionOverride(record.id, value)}
                            value={record.url || ""}
                        >
                            <Option key="use-latest" value={"latest"}>
                                <b>Always Use Active Version</b>
                            </Option>
                            {
                                versions.map((version: any) => {
                                    return(
                                        <Option key={version.value} value={version.url}>
                                            Version: {version.value} {version.isCurrent && <>(Current)</>}
                                        </Option>
                                    )})
                            }
                        </Select>) : (
                            <Select
                            style={{ width: 240 }}
                            value={""}
                            disabled
                        >
                            <Option key="no-versions" value={""} disabled>
                                No versions available
                            </Option>
                        </Select>
                        ) }

                        
                        {record.urlOverride && (
                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                Current: {record.urlOverride}
                            </Typography.Text>
                        )}
                    </Space>
                );
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
            <div className="flex items-center justify-between mb-6">
                <Title level={4} className="!mb-0">Edit Host: {host.name}</Title>
                <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteHost}
                    style={{ float: 'right' }}
                >
                    Delete
                </Button>
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
                                    <Button type="default" onClick={() => navigate('/hosts')}>Cancel</Button>
                                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                        Save Changes
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
                    {/* <TabPane tab="Information" key="information">
                        <HostForm
                            onSuccess={handleSuccess}
                            mode="information"
                            renderFooter={(isSubmitting) => (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="default" onClick={() => navigate('/hosts')}>Cancel</Button>
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
                    </TabPane>*/}
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
                                rowKey={() => generateUUID()}
                                pagination={{ pageSize: 10 }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="Configuration" key="configuration">
                        <HostConfigForm 
                            hostId={Number(id)}
                            initialConfig={[]} // We'll update this when we implement the backend
                            onSuccess={() => notify.success('Configuration updated successfully')}
                        />
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
                    rowKey={(record) => `available-remote-${record.id}`}
                    pagination={{ pageSize: 10 }}
                />
            </Modal>
        </div>
    );
};

export default EditHostPage;
