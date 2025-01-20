import React, { useState } from 'react';
import { Card, Avatar, Table, Button, Tag, message, Tooltip, Popconfirm, Modal, Form, Input, Select } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useUsers, useCreateUser, useDeleteUser, User, CreateUserRequest, AuthProvider } from '@/hooks/useUsers';

const { Option } = Select;

const UsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    // Queries and Mutations
    const { data: users = [], isLoading } = useUsers();
    const createUserMutation = useCreateUser();
    const deleteUserMutation = useDeleteUser();

    const handleCreateUser = async (values: CreateUserRequest) => {
        try {
            await createUserMutation.mutateAsync(values);
            message.success('User created successfully');
            setIsCreateModalVisible(false);
            createForm.resetFields();
        } catch (error: any) {
            message.error(error.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (user: User) => {
        try {
            await deleteUserMutation.mutateAsync(user.id);
            message.success('User deleted successfully');
        } catch (error: any) {
            message.error(error.message || 'Failed to delete user');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'success',
            Inactive: 'default',
            Suspended: 'error',
            PendingVerification: 'warning'
        };
        return colors[status] || 'default';
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_: any, record: User) => (
                <div className="flex items-center gap-3">
                    <Avatar 
                        src={record.profilePictureUrl}
                        icon={!record.profilePictureUrl && <UserOutlined />}
                    />
                    <div>
                        <div className="font-medium">{record.displayName}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
            sorter: (a: User, b: User) => a.displayName.localeCompare(b.displayName),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: User) => (
                <div className="flex items-center gap-2">
                    <Tag color={getStatusColor(status)}>{status}</Tag>
                    {status === 'Active' && record.isTwoFactorEnabled && (
                        <Tooltip title="2FA Enabled">
                            <Tag icon={<LockOutlined />} color="blue">2FA</Tag>
                        </Tooltip>
                    )}
                </div>
            ),
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Inactive', value: 'Inactive' },
                { text: 'Suspended', value: 'Suspended' },
                { text: 'Pending Verification', value: 'PendingVerification' },
            ],
            onFilter: (value: string, record: User) => record.status === value,
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles: string[]) => roles.length,
        },
        {
            title: 'Auth Provider',
            dataIndex: 'authProvider',
            key: 'authProvider',
            filters: [
                { text: 'Local', value: 'Local' },
                { text: 'Google', value: 'Google' },
                { text: 'GitHub', value: 'GitHub' },
                { text: 'Microsoft', value: 'Microsoft' },
            ],
            onFilter: (value: string, record: User) => record.authProvider === value,
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedDate',
            key: 'updatedDate',
            render: (date: string) => formatDate(date),
            sorter: (a: User, b: User) => {
                if (!a.updatedDate || !b.updatedDate) return 0;
                return new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime();
            },
        },
        {
            title: 'Created',
            dataIndex: 'createdDate',
            key: 'createdDate',
            render: (date: string) => formatDate(date),
            sorter: (a: User, b: User) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: User) => (
                <div className="flex gap-2">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/users/${record.id}/edit`)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Helmet>
                <title>[ROS] | User Management</title>
                <meta name="description" content="Dream.mf [ROS] | User Management" />
            </Helmet>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Users</h1>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/users/new')}
                >
                    Add User
                </Button>
            </div>

            <Table
                    columns={columns}
                    dataSource={users}
                    loading={isLoading}
                    rowKey="id"
                />
        </div>
    );
};

export default UsersPage;
