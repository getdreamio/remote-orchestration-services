import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs, Table, Input as AntInput, Typography } from 'antd';
import { useUpdateRemote, useRemote } from '@/hooks/useRemotes';
import { PlusOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons';
import { formatDate } from '@/lib/date-utils';
import { TagInput, TagItem } from '@/components/tags/tag-input';
import { useTags } from '@/hooks/useTags';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Version {
    id: string;
    version: string;
    createdAt: string;
    isActive: boolean;
}

const EditRemotePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const updateRemote = useUpdateRemote();
    const { data: remote, isLoading, error } = useRemote(id!);
    const { data: existingTags = [] } = useTags();
    const [activeTab, setActiveTab] = useState('general');
    const [modules, setModules] = useState<string[]>([]);
    const [tags, setTags] = useState<TagItem[]>([]);
    const [newModule, setNewModule] = useState('');
    const [versions] = useState<Version[]>([]); // This would be populated from your API
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    useEffect(() => {
        if (remote) {
            form.setFieldsValue({
                name: remote.name,
                scope: remote.scope,
            });
            setModules(remote.modules || []);
            setTags(remote.tags || []);
            setSelectedVersion(remote.activeVersion || null);
        }
    }, [remote, form]);

    const onFinish = async (values: any) => {
        try {
            await updateRemote.mutateAsync({
                id: id!,
                remote: {
                    ...values,
                    modules,
                    tags,
                    activeVersion: selectedVersion,
                }
            });
            message.success('Remote updated successfully');
            navigate('/remotes');
        } catch (error) {
            message.error('Failed to update remote');
        }
    };

    const addModule = () => {
        if (newModule && !modules.includes(newModule)) {
            setModules([...modules, newModule]);
            setNewModule('');
        }
    };

    const removeModule = (moduleToRemove: string) => {
        setModules(modules.filter(m => m !== moduleToRemove));
    };

    const handleModuleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (newModule && !modules.includes(newModule)) {
                setModules([...modules, newModule]);
                setNewModule('');
            }
        }
    };

    const columns = [
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
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
            title: 'Status',
            key: 'status',
            render: (_: any, record: Version) => (
                <span className={record.isActive ? 'text-green-500' : 'text-gray-500'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    const rowSelection = {
        type: 'radio' as const,
        selectedRowKeys: selectedVersion ? [selectedVersion] : [],
        onChange: (selectedRowKeys: React.Key[]) => {
            setSelectedVersion(selectedRowKeys[0] as string);
        },
    };

    // Convert the existing tags to the format expected by TagInput
    const formattedExistingTags = existingTags.map(tag => ({
        key: 'tag',
        value: tag.text
    }));

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">Edit Remote: {remote.name}</Title>
            </div>
            <Card className="bg-gray-50 dark:bg-transparent">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="General" key="general">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="space-y-4"
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input the remote name!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Scope"
                                name="scope"
                                rules={[{ required: true, message: 'Please input the scope!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="URL"
                            >
                                <Input value={remote?.url} disabled />
                            </Form.Item>

                            <div className="space-y-2">
                                <label className="block">Modules</label>
                                <div className="flex gap-2">
                                    <AntInput
                                        prefix={<CodeOutlined className="text-muted-foreground" />}
                                        value={newModule}
                                        onChange={(e) => setNewModule(e.target.value)}
                                        onKeyPress={handleModuleKeyPress}
                                        placeholder="Add a module and press Enter"
                                    />
                                    <Button
                                        type="primary"
                                        onClick={addModule}
                                        icon={<PlusOutlined />}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {modules.map((module) => (
                                        <div key={module} className="flex justify-between items-center p-2 bg-card rounded">
                                            <div className="flex items-center gap-2">
                                                <CodeOutlined className="text-muted-foreground" />
                                                <span>{module}</span>
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeModule(module)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Form.Item label="Tags">
                                <TagInput
                                    tags={tags}
                                    onChange={setTags}
                                    existingTags={formattedExistingTags}
                                />
                            </Form.Item>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button onClick={() => navigate('/remotes')}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </Form>
                    </TabPane>
                    <TabPane tab="Sub-Remotes" key="remotes">
                        Coming soon....
                    </TabPane>
                    <TabPane tab="Versions" key="versions">
                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={versions}
                            rowKey="id"
                            pagination={false}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default EditRemotePage;
