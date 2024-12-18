import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

const LogoutPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                // TODO: Implement logout logic here
                // Clear tokens, session, etc.

                // Redirect to login page after logout
                navigate('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                // Handle error case
                navigate('/login');
            }
        };

        handleLogout();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Signing out...</p>
            </div>
        </div>
    );
};

export default LogoutPage;
