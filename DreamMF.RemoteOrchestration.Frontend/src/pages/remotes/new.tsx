import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs, Table, Input as AntInput, Typography } from 'antd';
import { useCreateRemote } from '@/hooks/useRemotes';
import { PlusOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons';
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

const NewRemotePage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const createRemote = useCreateRemote();
    const [activeTab, setActiveTab] = useState('general');
    const [modules, setModules] = useState<string[]>([]);
    const [tags, setTags] = useState<TagItem[]>([]);
    const [newModule, setNewModule] = useState('');
    const [versions] = useState<Version[]>([]); // This would be populated from your API
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    const { data: existingTags = [] } = useTags();
    
    // Convert the existing tags to the format expected by TagInput
    const formattedExistingTags = existingTags.map(tag => ({
        key: 'tag',
        value: tag.text
    }));

    const onFinish = async (values: any) => {
        try {
            await createRemote.mutateAsync({
                ...values,
                modules,
                tags
            });
            message.success('Remote created successfully');
            navigate('/remotes');
        } catch (error) {
            message.error('Failed to create remote');
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">New Remote</Title>
            </div>
            <Helmet>
                <title>[ROS] | Create Remote</title>
                <meta name="description" content={`Dream.mf [ROS] | Create Remote`} />
            </Helmet>
            <Card className="bg-gray-50 dark:bg-gray-800">
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
                                label="Key"
                                name="key"
                                rules={[
                                    { required: true, message: 'Please input the remote key!' },
                                    { pattern: /^[A-Za-z_]+$/, message: 'Key can only contain alphabetical characters and underscores!' }
                                ]}
                                help="Only letters (A-Z, a-z) and underscores (_) are allowed"
                            >
                                <Input placeholder="Enter alphabetical characters and underscores only" />
                            </Form.Item>

                            <Form.Item
                                label="Scope"
                                name="scope"
                                rules={[
                                    { required: true, message: 'Please input the scope!' },
                                    { pattern: /^[A-Za-z_]+$/, message: 'Scope can only contain alphabetical characters!' }
                                ]}
                                help="Only letters (A-Z, _, a-z) are allowed"
                            >
                                <Input placeholder="Enter alphabetical characters only" />
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

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button onClick={() => navigate('/remotes')}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Create Remote
                                </Button>
                            </div>
                        </Form>
                    </TabPane>

                    <TabPane tab="Information" key="information">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="space-y-4"
                        >
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

                            <Form.Item className="!mb-0">
                                <Button type="primary" htmlType="submit">
                                    Create Remote
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default NewRemotePage;
