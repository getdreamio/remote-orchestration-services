import React from 'react';
import { Form, Input, Card, Button } from 'antd';
import { Configuration } from '@/hooks/useConfigurations';

import { API_BASE_URL_KEY } from '@/constants/settings_constants';

interface ApiSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (key: string, value: string) => void;
}

export const ApiSettingsForm: React.FC<ApiSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    console.log('#api-settings#', configurations);
    
    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const handleSave = (values: { baseUrl: string }) => {
        onSave(API_BASE_URL_KEY, values.baseUrl);
    };

    return (
        <>
            <Form
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                    baseUrl: getConfigValue(API_BASE_URL_KEY),
                }}
            >
                <Form.Item
                    label="API Base URL"
                    name="baseUrl"
                    rules={[
                        { required: true, message: 'Please input the API base URL!' },
                        { type: 'url', message: 'Please enter a valid URL!' },
                    ]}
                    tooltip="The base URL for the backend API (e.g., https://localhost:5000)"
                >
                    <Input placeholder="https://localhost:5000" />
                </Form.Item>

                <Form.Item className="mb-0 flex justify-end">
                    <Button type="primary" htmlType="submit">
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};
