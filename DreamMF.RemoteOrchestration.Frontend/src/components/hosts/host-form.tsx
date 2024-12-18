import React from 'react';
import { Form, Input, Button, message, Select, Typography } from 'antd';
import { useCreateHost, useUpdateHost } from '@/hooks/useHosts';
import { CopyOutlined } from '@ant-design/icons';
import { TagInput, TagItem } from '@/components/tags/tag-input';
import { useTags } from '@/hooks/useTags';

const { TextArea } = Input;
const { Text } = Typography;

interface HostFormProps {
    onSuccess: () => void;
    editingHost?: {
        id: number;
        name: string;
        description: string;
        url: string;
        key: string;
        environment: string;
        tags?: TagItem[];
    };
}

const HostForm: React.FC<HostFormProps> = ({ onSuccess, editingHost }) => {
    const [form] = Form.useForm();
    const createHost = useCreateHost();
    const updateHost = useUpdateHost();
    const [tags, setTags] = React.useState<TagItem[]>(editingHost?.tags || []);
    const { data: existingTags = [] } = useTags();

    const formattedExistingTags = existingTags.map(tag => ({
        key: 'tag',
        value: tag.text
    }));

    React.useEffect(() => {
        if (editingHost) {
            form.setFieldsValue(editingHost);
        } else {
            form.resetFields();
        }
    }, [editingHost, form]);

    const handleSubmit = async (values: any) => {
        try {
            const hostData = {
                ...values,
                tags: tags.map(tag => tag.value)
            };

            if (editingHost) {
                await updateHost.mutateAsync({ id: editingHost.id, host: hostData });
                message.success('Host updated successfully');
            } else {
                await createHost.mutateAsync(hostData);
                message.success('Host created successfully');
            }
            onSuccess();
            form.resetFields();
        } catch (error) {
            message.error('Failed to save host');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Key copied to clipboard');
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-2xl py-4"
        >
            <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input the host name!' }]}
            >
                <Input placeholder="e.g., Production Server 1" />
            </Form.Item>

            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input the description!' }]}
            >
                <TextArea 
                    rows={3} 
                    placeholder="Describe the purpose and details of this host"
                />
            </Form.Item>

            <Form.Item
                label="URL"
                name="url"
                rules={[
                    { required: true, message: 'Please input the URL!' },
                    { type: 'url', message: 'Please enter a valid URL!' }
                ]}
            >
                <Input placeholder="e.g., https://example.com" />
            </Form.Item>

            {editingHost && (
                <Form.Item label="Access Key">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <Text className="font-mono flex-1" ellipsis>
                            {editingHost.key}
                        </Text>
                        <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(editingHost.key)}
                        />
                    </div>
                </Form.Item>
            )}

            <Form.Item
                label="Environment"
                name="environment"
                rules={[{ required: true, message: 'Please select an environment!' }]}
            >
                <Select placeholder="Select environment">
                    <Select.Option value="development">Development</Select.Option>
                    <Select.Option value="staging">Staging</Select.Option>
                    <Select.Option value="production">Production</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item label="Tags">
                <TagInput
                    value={tags}
                    onChange={setTags}
                    suggestions={formattedExistingTags}
                    placeholder="Add tags..."
                />
            </Form.Item>

            <Form.Item className="mb-0">
                <div className="flex justify-end gap-2">
                    <Button type="primary" htmlType="submit">
                        {editingHost ? 'Update Host' : 'Create Host'}
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default HostForm;
