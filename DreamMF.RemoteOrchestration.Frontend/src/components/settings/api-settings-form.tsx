import React from 'react';
import { Form, Input, Card, Button, message } from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';

interface ApiSettingsFormProps {
    
}

export const ApiSettingsForm: React.FC<ApiSettingsFormProps> = () => {
    
    const baseUrl = window.DreamMF?.config?.BACKEND_URL || 'https://localhost:5001';
    const remotesUrl = `${baseUrl}/remotes`;
    const swaggerUrl = `${baseUrl}/swagger`;

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
    };

    const handleNavigate = (url: string) => {
        window.open(url, '_blank');
    };

    const { Group: InputGroup } = Input;

    return (
        <>
            <Form
                layout="vertical"
                initialValues={{
                    baseUrl: baseUrl,
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
                    <Input style={{ maxWidth: 400 }} readOnly disabled placeholder={'Reading from env-config.json...'} />
                </Form.Item>

                <Form.Item label="Remotes CDN" >
                    <div className="flex gap-2">
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => {
                                if (remotesUrl) {
                                    navigator.clipboard.writeText(remotesUrl);
                                    message.success('URL copied to clipboard');
                                }
                            }}
                            title="Copy URL"
                        />
                        <Button
                            icon={<LinkOutlined />}
                            onClick={() => {
                                if (remotesUrl) {
                                    window.open(remotesUrl, '_blank');
                                }
                            }}
                            title="Open URL"
                        />
                        <Input 
                            value={remotesUrl || ''} 
                            readOnly
                            disabled
                            style={{ maxWidth: 320 }}
                            className="flex-1"
                        />
                    </div>
                </Form.Item>

                <Form.Item label="Api Swagger" >
                    <div className="flex gap-2">
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => {
                                if (swaggerUrl) {
                                    navigator.clipboard.writeText(swaggerUrl);
                                    message.success('URL copied to clipboard');
                                }
                            }}
                            title="Copy URL"
                        />
                        <Button
                            icon={<LinkOutlined />}
                            onClick={() => {
                                if (swaggerUrl) {
                                    window.open(swaggerUrl, '_blank');
                                }
                            }}
                            title="Open URL"
                        />
                        <Input 
                            value={swaggerUrl || ''} 
                            readOnly
                            disabled
                            style={{ maxWidth: 320 }}
                            className="flex-1"
                        />
                    </div>
                </Form.Item>
            </Form>
        </>
    );
};
