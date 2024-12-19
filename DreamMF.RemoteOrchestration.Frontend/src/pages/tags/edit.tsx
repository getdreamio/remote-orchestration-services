import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Spin, Table, Tabs, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTag, useUpdateTag, useTagRemotes, useTagHosts, useRemoveTagAssociation } from '@/hooks/useTags';
import { Helmet } from 'react-helmet';

const { Title } = Typography;
const { TabPane } = Tabs;

const EditTagPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { data: tag, isLoading: isTagLoading } = useTag(Number(id));
    const { data: remotes, isLoading: isRemotesLoading } = useTagRemotes(Number(id));
    const { data: hosts, isLoading: isHostsLoading } = useTagHosts(Number(id));
    const updateTag = useUpdateTag();
    const removeAssociation = useRemoveTagAssociation();

    React.useEffect(() => {
        if (tag) {
            form.setFieldsValue(tag);
        }
    }, [tag, form]);

    const onFinish = async (values: any) => {
        try {
            await updateTag.mutateAsync({ id: Number(id), tag: values });
            navigate('/tags');
        } catch (error) {
            // Error is handled by the mutation
        }
    };

    const handleRemoveAssociation = async (itemId: number, type: 'host' | 'remote') => {
        await removeAssociation.mutateAsync({
            tagId: Number(id),
            itemId,
            type
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: any, record: any) => (
                <Popconfirm
                    title="Remove Tag Association"
                    description="Are you sure you want to remove this tag from this item?"
                    onConfirm={() => handleRemoveAssociation(record.id, record.type)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button 
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                    />
                </Popconfirm>
            ),
        },
    ];

    if (isTagLoading || isRemotesLoading || isHostsLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <Title level={2} className="mb-6">Edit Tag</Title>
            <Helmet>
                <title>[ROS] | Edit Tag {tag ? tag.text : 'Loading...'}</title>
                <meta name="description" content={`Dream.mf [ROS] | Edit Tag ${tag ? tag.text : 'Loading...'}`} />
            </Helmet>
            <div className="space-y-6">
                <Card className="max-w-2xl bg-gray-50 dark:bg-gray-800">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="Key"
                            name="key"
                            rules={[
                                { required: true, message: 'Please input the tag key!' },
                                { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Key can only contain letters, numbers, underscores and hyphens' }
                            ]}
                            tooltip="The key identifies the tag. It can contain letters, numbers, underscores and hyphens."
                        >
                            <Input placeholder="e.g., environment" />
                        </Form.Item>

                        <Form.Item className="mb-0 flex justify-end">
                            <Button className="mr-2" onClick={() => navigate('/tags')}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Update Tag
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-800">
                    <Tabs defaultActiveKey="hosts">
                        <TabPane tab="Associated Hosts" key="hosts">
                            <Table
                                dataSource={hosts?.map(host => ({ ...host, type: 'host' }))}
                                columns={columns}
                                rowKey="id"
                                pagination={false}
                                locale={{ emptyText: 'No hosts are using this tag' }}
                            />
                        </TabPane>
                        <TabPane tab="Associated Remotes" key="remotes">
                            <Table
                                dataSource={remotes?.map(remote => ({ ...remote, type: 'remote' }))}
                                columns={columns}
                                rowKey="id"
                                pagination={false}
                                locale={{ emptyText: 'No remotes are using this tag' }}
                            />
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default EditTagPage;
