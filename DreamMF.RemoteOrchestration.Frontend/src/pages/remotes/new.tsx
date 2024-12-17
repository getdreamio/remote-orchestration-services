import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { useCreateRemote } from '@/hooks/useRemotes';

const NewRemotePage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const createRemote = useCreateRemote();

    const onFinish = async (values: any) => {
        try {
            await createRemote.mutateAsync(values);
            message.success('Remote created successfully');
            navigate('/remotes');
        } catch (error) {
            message.error('Failed to create remote');
        }
    };

    return (
        <div>
            <h1>New Remote</h1>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the remote name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Storage Type"
                        name="storageType"
                        rules={[{ required: true, message: 'Please select the storage type!' }]}
                    >
                        <Select>
                            <Select.Option value="S3">S3</Select.Option>
                            <Select.Option value="Azure">Azure</Select.Option>
                            <Select.Option value="GCS">GCS</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Configuration"
                        name="configuration"
                        rules={[{ required: true, message: 'Please input the configuration!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create Remote
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => navigate('/remotes')}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default NewRemotePage;
