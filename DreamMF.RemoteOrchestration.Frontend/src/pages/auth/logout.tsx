import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spin } from 'antd';

const LogoutPage: React.FC = () => {
    const { logout } = useAuth();

    useEffect(() => {
        logout();
    }, [logout]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Spin size="large" tip="Signing out..." />
        </div>
    );
};

export default LogoutPage;
