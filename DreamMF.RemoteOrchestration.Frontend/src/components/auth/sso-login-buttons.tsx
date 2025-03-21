import React, { useEffect, useState } from 'react';
import { Button, Divider, Space, Tooltip } from 'antd';
import { GoogleOutlined, GithubOutlined, WindowsOutlined } from '@ant-design/icons';
import { config } from '@/config/env';

interface SSOProviderStatus {
    google: boolean;
    github: boolean;
    microsoft: boolean;
}

export const SSOLoginButtons: React.FC = () => {
    const [enabledProviders, setEnabledProviders] = useState<SSOProviderStatus>({
        google: false,
        github: false,
        microsoft: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchEnabledProviders = async () => {
            try {
                const response = await fetch(`${config.backendUrl}/api/oauth/enabled-providers`);
                if (response.ok) {
                    const data = await response.json();
                    setEnabledProviders(data);
                }
            } catch (error) {
                console.error('Failed to fetch enabled SSO providers:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchEnabledProviders();
    }, []);

    const handleSSOLogin = (provider: string) => {
        window.location.href = `${config.backendUrl}/api/oauth/login/${provider}`;
    };

    // Always render the component, but show loading state if needed
    return (
        <div className="mt-6">
            <Divider>Or continue with</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Tooltip title={!enabledProviders.google && !loading ? "Google SSO not configured" : ""}>
                    <Button 
                        icon={<GoogleOutlined />} 
                        onClick={() => handleSSOLogin('google')}
                        block
                        className="flex items-center justify-center"
                        disabled={!enabledProviders.google || loading}
                        loading={loading && !error}
                    >
                        Sign in with Google
                    </Button>
                </Tooltip>
                
                <Tooltip title={!enabledProviders.github && !loading ? "GitHub SSO not configured" : ""}>
                    <Button 
                        icon={<GithubOutlined />} 
                        onClick={() => handleSSOLogin('github')}
                        block
                        className="flex items-center justify-center"
                        disabled={!enabledProviders.github || loading}
                        loading={loading && !error}
                    >
                        Sign in with GitHub
                    </Button>
                </Tooltip>
                
                <Tooltip title={!enabledProviders.microsoft && !loading ? "Microsoft SSO not configured" : ""}>
                    <Button 
                        icon={<WindowsOutlined />} 
                        onClick={() => handleSSOLogin('microsoft')}
                        block
                        className="flex items-center justify-center"
                        disabled={!enabledProviders.microsoft || loading}
                        loading={loading && !error}
                    >
                        Sign in with Microsoft
                    </Button>
                </Tooltip>
            </Space>
        </div>
    );
};
