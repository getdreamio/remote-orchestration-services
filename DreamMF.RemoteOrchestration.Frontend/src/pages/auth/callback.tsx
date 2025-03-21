import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Typography, Alert } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme/theme-provider';

const { Title, Text } = Typography;

const OAuthCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const { theme } = useTheme();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                const token = searchParams.get('token');
                if (!token) {
                    throw new Error('No token received from the authentication provider');
                }

                // Login with the token
                await loginWithToken(token);
                
                // Redirect to home page
                navigate('/', { replace: true });
            } catch (err: any) {
                console.error('OAuth callback error:', err);
                setError(err.message || 'Failed to authenticate with the provider');
                setIsProcessing(false);
            }
        };

        handleOAuthCallback();
    }, [searchParams, loginWithToken, navigate]);

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
                        Authenticating...
                    </Title>
                    <Text className="mt-2 text-gray-600 dark:text-gray-400">
                        Please wait while we complete your sign-in
                    </Text>
                </div>

                <Card className="mt-8 bg-gray-50 dark:bg-transparent">
                    {error ? (
                        <Alert
                            message="Authentication Failed"
                            description={error}
                            type="error"
                            showIcon
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                            {isProcessing && <Spin size="large" />}
                            <Text className="mt-4">
                                {isProcessing ? "Completing authentication..." : "Redirecting to dashboard..."}
                            </Text>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
