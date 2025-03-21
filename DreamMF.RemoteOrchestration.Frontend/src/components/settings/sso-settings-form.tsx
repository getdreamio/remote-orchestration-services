import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch, Card, Tabs, message, Spin } from 'antd';
import { useConfigurations, useUpdateConfigurationBatch } from '@/hooks/useConfigurations';
import { AuthProvider } from '@/types/auth';

const { TabPane } = Tabs;

interface SSOProviderConfig {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    additionalParams: string;
}

interface SSOSettings {
    [AuthProvider.Google]: SSOProviderConfig;
    [AuthProvider.GitHub]: SSOProviderConfig;
    [AuthProvider.Microsoft]: SSOProviderConfig;
}

const defaultSSOConfig: SSOProviderConfig = {
    enabled: false,
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    scope: '',
    additionalParams: '{}'
};

export const SSOSettingsForm: React.FC = () => {
    const { data: configurations, isLoading } = useConfigurations();
    const { mutate: updateSettingBatch, isPending: isUpdating } = useUpdateConfigurationBatch();
    const [form] = Form.useForm();
    const [settings, setSettings] = useState<SSOSettings>({
        [AuthProvider.Google]: { ...defaultSSOConfig },
        [AuthProvider.GitHub]: { ...defaultSSOConfig },
        [AuthProvider.Microsoft]: { ...defaultSSOConfig },
    });

    useEffect(() => {
        if (configurations) {
            const newSettings = { ...settings };
            
            // Google
            newSettings[AuthProvider.Google] = {
                enabled: configurations.find(c => c.key === 'OAuth:Google:Enabled')?.value === 'true',
                clientId: configurations.find(c => c.key === 'OAuth:Google:ClientId')?.value || '',
                clientSecret: configurations.find(c => c.key === 'OAuth:Google:ClientSecret')?.value || '',
                redirectUri: configurations.find(c => c.key === 'OAuth:Google:RedirectUri')?.value || '',
                scope: configurations.find(c => c.key === 'OAuth:Google:Scope')?.value || '',
                additionalParams: configurations.find(c => c.key === 'OAuth:Google:AdditionalParams')?.value || '{}'
            };
            
            // GitHub
            newSettings[AuthProvider.GitHub] = {
                enabled: configurations.find(c => c.key === 'OAuth:GitHub:Enabled')?.value === 'true',
                clientId: configurations.find(c => c.key === 'OAuth:GitHub:ClientId')?.value || '',
                clientSecret: configurations.find(c => c.key === 'OAuth:GitHub:ClientSecret')?.value || '',
                redirectUri: configurations.find(c => c.key === 'OAuth:GitHub:RedirectUri')?.value || '',
                scope: configurations.find(c => c.key === 'OAuth:GitHub:Scope')?.value || '',
                additionalParams: configurations.find(c => c.key === 'OAuth:GitHub:AdditionalParams')?.value || '{}'
            };
            
            // Microsoft
            newSettings[AuthProvider.Microsoft] = {
                enabled: configurations.find(c => c.key === 'OAuth:Microsoft:Enabled')?.value === 'true',
                clientId: configurations.find(c => c.key === 'OAuth:Microsoft:ClientId')?.value || '',
                clientSecret: configurations.find(c => c.key === 'OAuth:Microsoft:ClientSecret')?.value || '',
                redirectUri: configurations.find(c => c.key === 'OAuth:Microsoft:RedirectUri')?.value || '',
                scope: configurations.find(c => c.key === 'OAuth:Microsoft:Scope')?.value || '',
                additionalParams: configurations.find(c => c.key === 'OAuth:Microsoft:AdditionalParams')?.value || '{}'
            };
            
            setSettings(newSettings);
            form.setFieldsValue(newSettings);
        }
    }, [configurations, form]);

    const handleSave = async (provider: AuthProvider) => {
        try {
            const values = await form.validateFields();
            const providerConfig = values[provider];
            
            const changes = [
                { key: `OAuth:${provider}:Enabled`, value: providerConfig.enabled.toString() },
                { key: `OAuth:${provider}:ClientId`, value: providerConfig.clientId },
                { key: `OAuth:${provider}:ClientSecret`, value: providerConfig.clientSecret },
                { key: `OAuth:${provider}:RedirectUri`, value: providerConfig.redirectUri },
                { key: `OAuth:${provider}:Scope`, value: providerConfig.scope },
                { key: `OAuth:${provider}:AdditionalParams`, value: providerConfig.additionalParams }
            ];
            
            await updateSettingBatch(changes);
            message.success(`${provider} SSO settings updated successfully`);
        } catch (error) {
            console.error('Failed to save SSO settings:', error);
            message.error('Failed to save SSO settings');
        }
    };

    if (isLoading) {
        return <Spin tip="Loading SSO settings..." />;
    }

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={settings}
        >
            <Tabs defaultActiveKey={AuthProvider.Google}>
                <TabPane tab="Google" key={AuthProvider.Google}>
                    <Card className="mb-4 bg-white dark:bg-gray-700">
                        <Form.Item
                            name={[AuthProvider.Google, 'enabled']}
                            label="Enable Google SSO"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Google, 'clientId']}
                            label="Client ID"
                            rules={[{ required: true, message: 'Please enter the Client ID' }]}
                        >
                            <Input placeholder="Google OAuth Client ID" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Google, 'clientSecret']}
                            label="Client Secret"
                            rules={[{ required: true, message: 'Please enter the Client Secret' }]}
                        >
                            <Input.Password placeholder="Google OAuth Client Secret" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Google, 'redirectUri']}
                            label="Redirect URI"
                            rules={[{ required: true, message: 'Please enter the Redirect URI' }]}
                        >
                            <Input placeholder="https://yourdomain.com/api/oauth/callback/google" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Google, 'scope']}
                            label="Scope"
                            rules={[{ required: true, message: 'Please enter the OAuth scope' }]}
                        >
                            <Input placeholder="email profile openid" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Google, 'additionalParams']}
                            label="Additional Parameters (JSON)"
                        >
                            <Input.TextArea 
                                placeholder='{"access_type": "offline", "prompt": "consent"}'
                                rows={4}
                            />
                        </Form.Item>
                        
                        <Button 
                            type="primary" 
                            onClick={() => handleSave(AuthProvider.Google)}
                            loading={isUpdating}
                        >
                            Save Google Settings
                        </Button>
                    </Card>
                </TabPane>
                
                <TabPane tab="GitHub" key={AuthProvider.GitHub}>
                    <Card className="mb-4 bg-white dark:bg-gray-700">
                        <Form.Item
                            name={[AuthProvider.GitHub, 'enabled']}
                            label="Enable GitHub SSO"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.GitHub, 'clientId']}
                            label="Client ID"
                            rules={[{ required: true, message: 'Please enter the Client ID' }]}
                        >
                            <Input placeholder="GitHub OAuth Client ID" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.GitHub, 'clientSecret']}
                            label="Client Secret"
                            rules={[{ required: true, message: 'Please enter the Client Secret' }]}
                        >
                            <Input.Password placeholder="GitHub OAuth Client Secret" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.GitHub, 'redirectUri']}
                            label="Redirect URI"
                            rules={[{ required: true, message: 'Please enter the Redirect URI' }]}
                        >
                            <Input placeholder="https://yourdomain.com/api/oauth/callback/github" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.GitHub, 'scope']}
                            label="Scope"
                            rules={[{ required: true, message: 'Please enter the OAuth scope' }]}
                        >
                            <Input placeholder="user:email read:user" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.GitHub, 'additionalParams']}
                            label="Additional Parameters (JSON)"
                        >
                            <Input.TextArea 
                                placeholder='{}'
                                rows={4}
                            />
                        </Form.Item>
                        
                        <Button 
                            type="primary" 
                            onClick={() => handleSave(AuthProvider.GitHub)}
                            loading={isUpdating}
                        >
                            Save GitHub Settings
                        </Button>
                    </Card>
                </TabPane>
                
                <TabPane tab="Microsoft" key={AuthProvider.Microsoft}>
                    <Card className="mb-4 bg-white dark:bg-gray-700">
                        <Form.Item
                            name={[AuthProvider.Microsoft, 'enabled']}
                            label="Enable Microsoft SSO"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Microsoft, 'clientId']}
                            label="Client ID"
                            rules={[{ required: true, message: 'Please enter the Client ID' }]}
                        >
                            <Input placeholder="Microsoft OAuth Client ID" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Microsoft, 'clientSecret']}
                            label="Client Secret"
                            rules={[{ required: true, message: 'Please enter the Client Secret' }]}
                        >
                            <Input.Password placeholder="Microsoft OAuth Client Secret" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Microsoft, 'redirectUri']}
                            label="Redirect URI"
                            rules={[{ required: true, message: 'Please enter the Redirect URI' }]}
                        >
                            <Input placeholder="https://yourdomain.com/api/oauth/callback/microsoft" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Microsoft, 'scope']}
                            label="Scope"
                            rules={[{ required: true, message: 'Please enter the OAuth scope' }]}
                        >
                            <Input placeholder="openid profile email" />
                        </Form.Item>
                        
                        <Form.Item
                            name={[AuthProvider.Microsoft, 'additionalParams']}
                            label="Additional Parameters (JSON)"
                        >
                            <Input.TextArea 
                                placeholder='{}'
                                rows={4}
                            />
                        </Form.Item>
                        
                        <Button 
                            type="primary" 
                            onClick={() => handleSave(AuthProvider.Microsoft)}
                            loading={isUpdating}
                        >
                            Save Microsoft Settings
                        </Button>
                    </Card>
                </TabPane>
            </Tabs>
        </Form>
    );
};
