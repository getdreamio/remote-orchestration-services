import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useCreateRemote } from '@/hooks/useRemotes';
import { Helmet } from 'react-helmet';

const { Title } = Typography;

const CreateRemotePage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const createRemote = useCreateRemote();

    const onFinish = async (values: any) => {
        try {
            await createRemote.mutateAsync({
                ...values,
                modules: []
            });
            message.success('Remote created successfully');
            navigate('/remotes');
        } catch (error) {
            message.error('Failed to create remote');
        }
    };

    return (
        <div>
            <Helmet>
                <title>[ROS] | Create Remote</title>
                <meta name="description" content="Dream.mf [ROS] | Create Remote" />
            </Helmet>
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">Create Remote</Title>
            </div>
            <Card className="bg-gray-50 dark:bg-gray-800">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="max-w-2xl"
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
                        rules={[{ required: true, message: 'Please input the remote scope!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Repository URL"
                        name="repository"
                        rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Contact Name"
                        name="contact_name"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Contact Email"
                        name="contact_email"
                        rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Documentation URL"
                        name="documentation_url"
                        rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => navigate('/remotes')}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={createRemote.isPending}>
                                Create Remote
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateRemotePage;
