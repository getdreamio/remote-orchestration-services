import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs, Table, Input as AntInput } from 'antd';
import { useCreateRemote } from '@/hooks/useRemotes';
import { PlusOutlined } from '@ant-design/icons';
import { formatDate } from '@/lib/date-utils';

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
    const [newModule, setNewModule] = useState('');
    const [versions] = useState<Version[]>([]); // This would be populated from your API
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    const onFinish = async (values: any) => {
        try {
            await createRemote.mutateAsync({
                ...values,
                modules,
                activeVersion: selectedVersion,
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
            <h1 className="text-2xl font-semibold">New Remote</h1>
            <Card>
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
                                <Input disabled placeholder="URL will be generated on the backend" />
                            </Form.Item>

                            <div className="space-y-2">
                                <label className="block">Modules</label>
                                <div className="flex gap-2">
                                    <AntInput
                                        value={newModule}
                                        onChange={(e) => setNewModule(e.target.value)}
                                        placeholder="Add a module"
                                    />
                                    <Button type="primary" onClick={addModule} icon={<PlusOutlined />}>
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {modules.map((module) => (
                                        <div key={module} className="flex justify-between items-center p-2 bg-card rounded">
                                            <span>{module}</span>
                                            <Button
                                                type="text"
                                                danger
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

export default NewRemotePage;
