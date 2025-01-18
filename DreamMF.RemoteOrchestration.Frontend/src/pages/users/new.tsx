import React from 'react';
import { Card, Typography, Button, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserForm, { UserStatus, AuthProvider } from '@/components/users/user-form';
import { Helmet } from 'react-helmet';

const { Title } = Typography;

const NewUserPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/users');
    };

    return (
        <div>
            <Helmet>
                <title>[ROS] | New User</title>
                <meta name="description" content="Dream.mf [ROS] | Create New User" />
            </Helmet>
            <div className="flex justify-between items-center mb-4">
                <Title level={4} className="!mb-0">Create New User</Title>
            </div>
            <Card>
                <Alert
                    message="User Creation"
                    description="Create a new user by filling out their basic information and selecting an authentication provider. Additional security settings can be configured after creation."
                    type="info"
                    showIcon
                    className="mb-6"
                />
                <UserForm
                    mode="general"
                    onSuccess={handleSuccess}
                    editingUser={{
                        id: 0,
                        status: UserStatus.Active,
                        authProvider: AuthProvider.Local
                    }}
                    renderFooter={(isSubmitting) => (
                        <div className="flex justify-end gap-2 mt-6">
                            <Button onClick={() => navigate('/users')}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                Create User
                            </Button>
                        </div>
                    )}
                />
            </Card>
        </div>
    );
};

export default NewUserPage;
