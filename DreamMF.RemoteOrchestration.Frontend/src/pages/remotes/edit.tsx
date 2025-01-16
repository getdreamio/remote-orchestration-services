import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs, Table, Input as AntInput, Typography, Empty, InputRef } from 'antd';
import { useUpdateRemote, useRemote, RemoteModule, useRemoteVersions, useUpdateRemoteUrl, Version } from '@/hooks/useRemotes';
import { PlusOutlined, DeleteOutlined, CodeOutlined, CopyOutlined, LinkOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatDate } from '@/lib/date-utils';
import { TagInput, TagItem } from '@/components/tags/tag-input';
import { useTags } from '@/hooks/useTags';
import { Helmet } from 'react-helmet';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Version {
    id: string;
    version: string;
    createdAt: string;
    isActive: boolean;
}

const EditRemotePage: React.FC = () => {
    const [moduleInput, setModuleInput] = useState('');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const updateRemote = useUpdateRemote();
    const updateRemoteUrl = useUpdateRemoteUrl();
    const { data: remote, isLoading, error } = useRemote(Number(id));
    const { data: versions = [], isLoading: versionsLoading } = useRemoteVersions(Number(id));
    const [activeTab, setActiveTab] = useState('general');
    const [modules, setModules] = useState<RemoteModule[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    useEffect(() => {
        if (remote) {
            form.setFieldsValue({
                name: remote.name,
                key: remote.key,
                scope: remote.scope,
                repository: remote.repository,
                contact_name: remote.contact_name,
                contact_email: remote.contact_email,
                documentation_url: remote.documentation_url
            });
            setModules(remote.modules || []);
            setSelectedVersion(remote.activeVersion || null);
        }
    }, [remote, form]);

    const onFinish = async (values: any) => {
        try {
            await updateRemote.mutateAsync({
                id: Number(id),
                remote: {
                    ...values,
                    modules,
                }
            });
            message.success('Remote updated successfully');
            navigate('/remotes');
        } catch (error) {
            message.error('Failed to update remote');
        }
    };

    const addModule = (moduleName: string) => {
        if (moduleName && !modules.some(m => m.name === moduleName)) {
            setModules(prev => [...prev, {
                name: moduleName,
            }]);
            setModuleInput('');
        }
    };

    const removeModule = (moduleToRemove: string) => {
        setModules(modules.filter(m => m.name !== moduleToRemove));
    };

    const handleModuleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addModule(String((e.target as HTMLInputElement).value));
        }
    };

    const columns = [
        {
            title: 'Version',
            dataIndex: 'value',
            key: 'version',
        },
        {
            title: 'Created At',
            dataIndex: 'created_Date',
            key: 'createdAt',
            render: (date: string) => {
                try {
                    return date ? formatDate(date) : '-';
                } catch (error) {
                    return '-';
                }
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: Version) => {
                const isCurrentVersion = remote?.url?.includes(`/${record.value}/`);
                return isCurrentVersion ? (
                    <span className="text-green-500 flex items-center gap-1">
                        <CheckCircleOutlined /> Currently Active
                    </span>
                ) : (
                    <Button
                        type="primary"
                        onClick={async () => {
                            try {
                                await updateRemoteUrl.mutateAsync({
                                    id: Number(id),
                                    version: record.value
                                });
                                message.success('Remote URL updated successfully');
                            } catch (error) {
                                message.error('Failed to update remote URL');
                            }
                        }}
                    >
                        Make Current
                    </Button>
                );
            },
        },
    ];

    const rowSelection = {
        type: 'radio' as const,
        selectedRowKeys: selectedVersion ? [selectedVersion] : [],
        onChange: (selectedRowKeys: React.Key[]) => {
            setSelectedVersion(selectedRowKeys[0] as string);
        },
    };

    if (isLoading) {
        return <EditRemoteSkeleton />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <Helmet>
                <title>[ROS] | Edit Remote {remote?.name}</title>
                <meta name="description" content={`Dream.mf [ROS] | Edit Remote ${remote?.name}`} />
            </Helmet>
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">Edit Remote: {remote?.name}</Title>
            </div>
            <Card className="bg-gray-50 dark:bg-gray-800">

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        name: remote.name,
                        key: remote.key,
                        scope: remote.scope,
                        repository: remote.repository,
                        contactName: remote.contactName,
                        contactEmail: remote.contactEmail,
                        documentationUrl: remote.documentationUrl
                    }}
                    className="space-y-4"
                >
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane tab="General" key="general">
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input the remote name!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Key"
                                name="key"
                                rules={[{ required: true, message: 'Please input the remote key!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Scope"
                                name="scope"
                                rules={[{ required: true, message: 'Please input the remote scope!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="URL"
                            >
                                <div className="flex gap-2">
                                    <Button
                                        icon={<CopyOutlined />}
                                        onClick={() => {
                                            if (remote?.url) {
                                                navigator.clipboard.writeText(remote.url);
                                                message.success('URL copied to clipboard');
                                            }
                                        }}
                                        title="Copy URL"
                                    />
                                    <Button
                                        icon={<LinkOutlined />}
                                        onClick={() => {
                                            if (remote?.url) {
                                                window.open(remote.url, '_blank');
                                            }
                                        }}
                                        title="Open URL"
                                    />
                                    <Input 
                                        value={remote?.url || ''} 
                                        readOnly
                                        disabled
                                        className="flex-1"
                                    />
                                </div>
                            </Form.Item>

                            <div className="space-y-2 max-w-[50%]">
                                <label className="block">Modules</label>
                                <div className="flex gap-2">
                                    <AntInput
                                        value={moduleInput}
                                        onChange={(e) => setModuleInput(e.target.value)}
                                        prefix={<CodeOutlined className="text-muted-foreground" />}
                                        onKeyDown={handleModuleKeyPress}
                                        placeholder="Add a module and press Enter"
                                    />
                                    <Button
                                        type="primary"
                                        onClick={() => addModule(moduleInput)}
                                        icon={<PlusOutlined />}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {modules.map((module, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 bg-card rounded">
                                            <div className="flex items-center gap-2">
                                                <CodeOutlined className="text-muted-foreground" />
                                                <span>{module.name}</span>
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeModule(module.name)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Form.Item label="Tags">
                                <TagInput
                                    entityType="remote"
                                    entityId={Number(id)}
                                />
                            </Form.Item>

                        </TabPane>
                        <TabPane tab="Information" key="information">
                            <Form.Item
                                label="Repository"
                                name="repository"
                                rules={[
                                    { type: 'url', message: 'Please enter a valid repository URL!' }
                                ]}
                            >
                                <Input placeholder="e.g., https://github.com/organization/repo" />
                            </Form.Item>

                            <Form.Item
                                label="Contact Name"
                                name="contactName"
                            >
                                <Input placeholder="e.g., John Smith" />
                            </Form.Item>

                            <Form.Item
                                label="Contact Email"
                                name="contactEmail"
                                rules={[
                                    { type: 'email', message: 'Please enter a valid email address!' }
                                ]}
                            >
                                <Input placeholder="e.g., john.smith@company.com" />
                            </Form.Item>

                            <Form.Item
                                label="Documentation URL"
                                name="documentationUrl"
                                rules={[
                                    { type: 'url', message: 'Please enter a valid URL!' }
                                ]}
                            >
                                <Input placeholder="e.g., https://docs.example.com" />
                            </Form.Item>
                        </TabPane>
                        <TabPane tab="Sub-Remotes" key="remotes">
                            Coming soon....
                        </TabPane>
                        <TabPane tab="Versions" key="versions">
                            <Table
                                dataSource={versions}
                                columns={columns}
                                rowKey="version_ID"
                                loading={versionsLoading}
                            />
                        </TabPane>
                    </Tabs>
                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => navigate('/remotes')}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={updateRemote.isPending}>
                                Save Changes
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditRemotePage;

export const EditRemoteSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-64 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
            </div>
            <Card>
                {/* Tab Headers */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex gap-4 px-2">
                        {['General', 'Sub-Remotes', 'Versions'].map((tab) => (
                            <div
                                key={tab}
                                className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse mb-4"
                            />
                        ))}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6 p-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                    </div>

                    {/* Scope Field */}
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                    </div>

                    {/* URL Field */}
                    <div className="space-y-2">
                        <div className="h-4 w-12 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                    </div>

                    {/* Modules Section */}
                    <div className="space-y-4">
                        <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        <div className="flex gap-2">
                            <div className="h-10 flex-1 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                            <div className="h-10 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        </div>
                        {/* Module Items */}
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-12 w-full bg-gray-200 rounded dark:bg-gray-700 animate-pulse"
                            />
                        ))}
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <div className="h-9 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                        <div className="h-9 w-32 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                    </div>
                </div>
            </Card>
        </div>
    );
};