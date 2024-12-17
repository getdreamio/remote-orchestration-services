import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useCreateHost, useUpdateHost } from '@/hooks/useHosts';

interface HostModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingHost?: {
        host_ID: number;
        name: string;
        hostname: string;
        port: number;
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
                await createHost.mutateAsync(values);
                message.success('Host created successfully');
            }
            onClose();
            form.resetFields();
        } catch (error) {
            message.error('Failed to save host');
        }
    };

    return (
        <Modal
            title={editingHost ? 'Edit Host' : 'Create Host'}
            open={isOpen}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ port: 22 }}
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input the host name!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Hostname"
                    name="hostname"
                    rules={[{ required: true, message: 'Please input the hostname!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Port"
                    name="port"
                    rules={[{ required: true, message: 'Please input the port!' }]}
                >
                    <Input type="number" />
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
