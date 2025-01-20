import React from 'react';
import { Form, Input, Card, Button } from 'antd';

import { API_BASE_URL_KEY } from '@/constants/settings_constants';

interface ApiSettingsFormProps {
    
}

export const ApiSettingsForm: React.FC<ApiSettingsFormProps> = () => {
    
    const getConfigValue = (key: string) => {
        return window.DreamMF?.config?.BACKEND_URL || 'https://localhost:5001';
    };

    return (
        <>
            <Form
                layout="vertical"
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
                    tooltip="The base URL for the backend API (e.g., https://localhost:5001)"
                >
                    <Input style={{ maxWidth: 400 }} readOnly placeholder={'Reading from env-config.json...'} />
                </Form.Item>

                {/* <Form.Item className="mb-0 flex justify-end">
                    <Button type="primary" htmlType="submit">
                        Save Changes
                    </Button>
                </Form.Item> */}
            </Form>
        </>
    );
};
