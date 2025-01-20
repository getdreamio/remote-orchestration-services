import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Spin, Tabs, Button, message } from 'antd';
import { useUser } from '@/hooks/useUsers';
import UserForm from '@/components/users/user-form';
import { Helmet } from 'react-helmet';

const { Title } = Typography;
const { TabPane } = Tabs;

const EditUserPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: user, isLoading } = useUser(Number(id));
    const [activeTab, setActiveTab] = useState('general');

    const handleSuccess = () => {
        //navigate('/users');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <div className="text-center">
                    <Title level={4}>User not found</Title>
                    <Button 
                        type="link"
                        onClick={() => navigate('/users')}
                    >
                        Back to Users
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Helmet>
                <title>[ROS] | Edit User {user.displayName}</title>
                <meta name="description" content={`Dream.mf [ROS] | Edit User ${user.displayName}`} />
            </Helmet>
            <div className="flex justify-between items-center mb-4">
                <Title level={4} className="!mb-0">Edit User: {user.displayName}</Title>
            </div>
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="General" key="general">
                        <UserForm
                            onSuccess={handleSuccess}
                            mode="general"
                            renderFooter={(isSubmitting) => (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button onClick={() => navigate('/users')}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                        Update User
                                    </Button>
                                </div>
                            )}
                            editingUser={{
                                id: user.id,
                                email: user.email,
                                displayName: user.displayName,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                status: user.status,
                                authProvider: user.authProvider,
                                authUserId: user.authUserId,
                                accessToken: user.accessToken,
                                refreshToken: user.refreshToken,
                                createdDate: user.createdDate,
                                updatedDate: user.updatedDate,
                                roles: user.roles
                            }}
                        />
                    </TabPane>
                    <TabPane tab="Security" key="security">
                        <UserForm
                            onSuccess={handleSuccess}
                            mode="security"
                            editingUser={{
                                id: user.id,
                                isTwoFactorEnabled: user.isTwoFactorEnabled,
                                isEmailVerified: user.isEmailVerified,
                                status: user.status,
                                failedLoginAttempts: user.failedLoginAttempts,
                                lastLoginDate: user.lastLoginDate,
                                lastLoginIp: user.lastLoginIp,
                                authProvider: user.authProvider
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default EditUserPage;
