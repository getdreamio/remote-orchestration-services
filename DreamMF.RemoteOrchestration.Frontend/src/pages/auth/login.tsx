import React from 'react';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme/theme-provider';
import { SSOLoginButtons } from '@/components/auth/sso-login-buttons';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const { theme } = useTheme();
    const { login } = useAuth();
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        setError(null);
        try {
            await login(values.email, values.password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className={theme === 'dark' ? 'bg-white rounded-full p-1' : ''}>
                            <img src="/logo_white.png" alt="Dream.MF Logo" />
                        </div>
                    </div>
                    <Title level={2} className="mt-6">
                        Welcome back to Dream.mf
                    </Title>
                    <Text className="mt-2 text-gray-600 dark:text-gray-400">
                        Sign in to your account
                    </Text>
                </div>

                <Card className="mt-8 bg-gray-50 dark:bg-transparent">
                    {location.state?.message && (
                        <Alert
                            message={location.state.message}
                            type="success"
                            showIcon
                            style={{ marginBottom: 24 }}
                            closable
                        />
                    )}

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <Form
                        form={form}
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        requiredMark={false}
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input size="large" placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: 'Please enter your password' }]}
                        >
                            <Input.Password size="large" placeholder="Enter your password" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                block
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Sign in
                            </Button>
                        </Form.Item>
                    </Form>
                    
                    {/* SSO Login Buttons */}
                    <SSOLoginButtons />

                    <div className="text-center mt-4">
                        <Text className="text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Button
                                type="link"
                                onClick={() => navigate('/auth/register')}
                                className="p-0"
                            >
                                Register now
                            </Button>
                        </Text>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
