import React, { useState } from 'react';
import { Form, Input, Button, message, Select, Typography } from 'antd';
import { type HostRequest, useCreateHost, useUpdateHost } from '@/hooks/useHosts';
import { CopyOutlined } from '@ant-design/icons';
import { TagInput, type TagItem } from '@/components/tags/tag-input';
import { useTags } from '@/hooks/useTags';

const { TextArea } = Input;
const { Text } = Typography;

interface HostFormProps {
    onSuccess: () => void;
    renderFooter?: (isSubmitting: boolean) => React.ReactNode;
    mode: 'general' | 'information';
    editingHost?: {
        id: number;
        name: string;
        description: string;
        url: string;
        key: string;
        environment: string;
        tags?: TagItem[];
        repository?: string;
        contactName?: string;
        contactEmail?: string;
        documentationUrl?: string;
    };
}

const HostForm: React.FC<HostFormProps> = ({ onSuccess, editingHost, renderFooter, mode }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createHost = useCreateHost();
    const updateHost = useUpdateHost();
    const { data: existingTags = [] } = useTags();

    const formattedExistingTags = existingTags.map(tag => ({
        key: 'tag',
        value: tag.key
    }));

    const handleSubmit = async (values: HostRequest) => {
        try {
            setIsSubmitting(true);
            const hostData = {
                ...values,
                tags: values.tags?.map(tag => tag.value) || []
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Key copied to clipboard');
    };

    console.log(form.getFieldsValue());

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="py-4"
            initialValues={editingHost}
            key={editingHost?.id}
            preserve={false}
        >
            {mode === 'general' && (
                <>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the host name!' }]}
                    >
                        <Input placeholder="e.g., Production Server 1" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input the description!' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Describe the purpose and details of this host"
                            className="w-full"
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
                        <Input placeholder="e.g., https://example.com" className="w-full" />
                    </Form.Item>

                    {editingHost && (
                        <Form.Item label="Access Key">
                            <div className="flex items-center gap-2 border border-[--ant-color-border] bg-[--ant-color-bg-elevated] p-2 rounded w-full">
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
                        <Select placeholder="Select environment" className="w-full">
                            <Select.Option value="development">Development</Select.Option>
                            <Select.Option value="staging">Staging</Select.Option>
                            <Select.Option value="production">Production</Select.Option>
                        </Select>
                    </Form.Item>

                    {editingHost && (
                        <Form.Item
                            label="Tags"
                            name="tags"
                            initialValue={[]}
                        >
                            <TagInput entityType={'host'} entityId={editingHost?.id || -1} existingTags={formattedExistingTags} className='w-full' />
                        </Form.Item>
                    )}
                </>
            )}

            {mode === 'information' && (
                <>
                    <Form.Item
                        label="Repository"
                        name="repository"
                        rules={[
                            { type: 'url', message: 'Please enter a valid repository URL!' }
                        ]}
                    >
                        <Input placeholder="e.g., https://github.com/organization/repo" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Name"
                        name="contactName"
                    >
                        <Input placeholder="e.g., John Smith" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Email"
                        name="contactEmail"
                        rules={[
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input placeholder="e.g., john.smith@company.com" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        label="Documentation URL"
                        name="documentationUrl"
                        rules={[
                            { type: 'url', message: 'Please enter a valid URL!' }
                        ]}
                    >
                        <Input placeholder="e.g., https://docs.example.com" className="w-full" />
                    </Form.Item>
                </>
            )}

            {renderFooter && renderFooter(isSubmitting)}
        </Form>
    );
};

export default HostForm;