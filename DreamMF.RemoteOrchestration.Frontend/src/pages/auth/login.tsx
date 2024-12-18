import React from 'react';
import { Card, Form, Input, Button, Divider, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { GithubOutlined, GoogleOutlined, WindowsOutlined } from '@ant-design/icons';
import { useTheme } from '../../components/theme/theme-provider';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { theme } = useTheme();

    const handleSubmit = async (values: any) => {
        // TODO: Implement login logic
        navigate('/');
    };

    const handleSocialLogin = (provider: string) => {
        // TODO: Implement social login
        console.log(`Logging in with ${provider}`);
    };

    const handleSSOLogin = () => {
        // TODO: Implement SSO login
        console.log('Logging in with SSO');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className={theme === 'dark' ? 'bg-white rounded-full p-1' : ''}>
                            <img src="/logo.png" alt="Dream.MF Logo" />
                        </div>
                    </div>
                    <Title level={2} className="mt-6">
                        Welcome back to Dream.mf
                    </Title>
                    <Text className="mt-2 text-gray-600 dark:text-gray-400">
                        Sign in to your account
                    </Text>
                </div>

                <Card className="mt-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSocialLogin('github')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <GithubOutlined className="h-5 w-5" />
                                <span className="ml-2">GitHub</span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <GoogleOutlined className="h-5 w-5" />
                                <span className="ml-2">Google</span>
                            </button>
                        </div>

                        <button
                            onClick={handleSSOLogin}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <WindowsOutlined className="h-5 w-5" />
                            <span className="ml-2">Single Sign-on</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
