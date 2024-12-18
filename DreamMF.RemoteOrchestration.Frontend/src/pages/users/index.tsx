import React from 'react';
import { Card, Avatar, List, Button, Tag } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';

// This is a placeholder component since user management wasn't in the API
// You can replace this with actual user management functionality when available

const mockUsers = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'Administrator',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Test User',
        email: 'test@example.com',
        role: 'User',
        status: 'Active',
    },
];

const UsersPage: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Users</h1>
                <Button type="primary" icon={<PlusOutlined />}>
                    Add User
                </Button>
            </div>

            <Card className="bg-gray-50 dark:bg-transparent">
                <List
                    itemLayout="horizontal"
                    dataSource={mockUsers}
                    renderItem={(user) => (
                        <List.Item
                            actions={[
                                <Button key="edit" type="link">
                                    Edit
                                </Button>,
                                <Button key="delete" type="link" danger>
                                    Delete
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar icon={<UserOutlined />} />
                                }
                                title={user.name}
                                description={user.email}
                            />
                            <div className="flex gap-2">
                                <Tag color={user.role === 'Administrator' ? 'blue' : 'green'}>
                                    {user.role}
                                </Tag>
                                <Tag color="success">{user.status}</Tag>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            <div className="mt-4 text-gray-500 text-sm">
                Note: This is a placeholder page. User management functionality will be implemented in a future update.
            </div>
        </div>
    );
};

export default UsersPage;
