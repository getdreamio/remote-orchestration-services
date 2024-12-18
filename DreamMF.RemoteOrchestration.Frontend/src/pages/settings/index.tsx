import React from 'react';
import { Card, Form, Input, Button, Switch, Divider, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const SettingsPage: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Settings saved:', values);
        message.success('Settings saved successfully');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        defaultPort: 22,
                        enableNotifications: true,
                        autoRefresh: false,
                    }}
                >
                    <h2 className="text-lg font-medium mb-4">General Settings</h2>
                    
                    <Form.Item
                        label="Default SSH Port"
                        name="defaultPort"
                        rules={[{ required: true, message: 'Please input the default SSH port!' }]}
                    >
                        <Input type="number" style={{ maxWidth: 200 }} />
                    </Form.Item>

                    <Form.Item
                        label="Enable Notifications"
                        name="enableNotifications"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="Auto Refresh Data"
                        name="autoRefresh"
                        valuePropName="checked"
                        extra="Automatically refresh data every 30 seconds"
                    >
                        <Switch />
                    </Form.Item>

                    <Divider />

                    <h2 className="text-lg font-medium mb-4">API Configuration</h2>

                    <Form.Item
                        label="API Base URL"
                        name="apiBaseUrl"
                        initialValue={process.env.BACKEND_URL}
                        extra="Changes will take effect after restart"
                    >
                        <Input style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            Save Settings
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SettingsPage;
