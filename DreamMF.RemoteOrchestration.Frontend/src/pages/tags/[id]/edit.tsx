import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { useTag, useUpdateTag } from '@/hooks/useTags';

const EditTagPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { data: tag, isLoading } = useTag(Number(id));
    const updateTag = useUpdateTag();

    React.useEffect(() => {
        if (tag) {
            form.setFieldsValue(tag);
        }
    }, [tag, form]);

    const onFinish = async (values: any) => {
        try {
            await updateTag.mutateAsync({ id: Number(id), tag: values });
            message.success('Tag updated successfully');
            navigate('/tags');
        } catch (error) {
            message.error('Failed to update tag');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Edit Tag</h1>
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
                            Update Tag
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

export default EditTagPage;
