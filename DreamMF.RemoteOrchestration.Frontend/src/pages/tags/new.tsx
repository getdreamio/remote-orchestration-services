import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { useCreateTag } from '@/hooks/useTags';

const NewTagPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const createTag = useCreateTag();

    const onFinish = async (values: any) => {
        try {
            await createTag.mutateAsync(values);
            message.success('Tag created successfully');
            navigate('/tags');
        } catch (error) {
            message.error('Failed to create tag');
        }
    };

    return (
        <div>
            <h1>New Tag</h1>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Text"
                        name="text"
                        rules={[{ required: true, message: 'Please input the tag text!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create Tag
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => navigate('/tags')}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default NewTagPage;
