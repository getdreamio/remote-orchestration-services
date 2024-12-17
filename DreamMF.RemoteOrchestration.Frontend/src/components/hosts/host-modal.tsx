import React from 'react';
import { Modal, Form, Input, Button, message, Select, Typography } from 'antd';
import { useCreateHost, useUpdateHost } from '@/hooks/useHosts';
import { CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface HostModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingHost?: {
        host_ID: number;
        name: string;
        description: string;
        url: string;
        key: string;
        environment: string;
    };
}

const HostModal: React.FC<HostModalProps> = ({ isOpen, onClose, editingHost }) => {
    const [form] = Form.useForm();
    const createHost = useCreateHost();
    const updateHost = useUpdateHost();

    React.useEffect(() => {
        if (editingHost) {
            form.setFieldsValue(editingHost);
        } else {
            form.resetFields();
        }
    }, [editingHost, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (editingHost) {
                await updateHost.mutateAsync({ id: editingHost.host_ID, host: values });
                message.success('Host updated successfully');
            } else {
                const result = await createHost.mutateAsync(values);
                message.success('Host created successfully');
            }
            onClose();
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
        <Modal
            title={editingHost ? 'Edit Host' : 'Create Host'}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
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
                            <Text className="flex-1 font-mono text-sm" ellipsis>
                                {editingHost.key}
                            </Text>
                            <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(editingHost.key)}
                            >
                                Copy
                            </Button>
                        </div>
                        <Text type="secondary" className="text-xs mt-1">
                            This key is automatically generated and cannot be modified
                        </Text>
                    </Form.Item>
                )}

                <Form.Item
                    label="Environment"
                    name="environment"
                    rules={[{ required: true, message: 'Please select the environment!' }]}
                >
                    <Select>
                        <Select.Option value="development">Development</Select.Option>
                        <Select.Option value="staging">Staging</Select.Option>
                        <Select.Option value="production">Production</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item className="mb-0 flex justify-end">
                    <Button onClick={onClose} className="mr-2">
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={createHost.isPending || updateHost.isPending}>
                        {editingHost ? 'Update' : 'Create'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default HostModal;
