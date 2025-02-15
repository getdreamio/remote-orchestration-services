import React, { useState } from 'react';
import { Card, Avatar, Table, Button, Tag, Tooltip, Popconfirm, Modal, Form, Input, Select, Typography } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useUsers, useCreateUser, useDeleteUser, User, CreateUserRequest, AuthProvider } from '@/hooks/useUsers';
import { formatDateShort, formatDateFull } from '@/lib/date-utils';
import notify from '../../utils/notifications';

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
            notify.success('User created successfully');
            setIsCreateModalVisible(false);
            createForm.resetFields();
        } catch (error: any) {
            notify.error('Error', error.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (user: User) => {
        try {
            await deleteUserMutation.mutateAsync(user.id);
            notify.success('User deleted successfully');
        } catch (error: any) {
            notify.error('Error', error.message || 'Failed to delete user');
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
            render: (roles: string[]) => {
                return (
                    <Tooltip title={`${roles.length} module${roles.length === 1 ? '' : 's'} roles`}>
                        <Tag color="blue">
                            {roles.length || '0'}
                        </Tag>
                    </Tooltip>
                );
            }
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
            title: 'Updated',
            dataIndex: 'updatedDate',
            key: 'updatedDate',
            width: 120,
            render: (date: string) => (
                <Tooltip title={formatDateFull(date)}>
                    <span>{formatDateShort(date)}</span>
                </Tooltip>
            ),
            sorter: (a: User, b: User) => {
                if (!a.updatedDate || !b.updatedDate) return 0;
                return new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime();
            },
        },
        {
            title: 'Created',
            dataIndex: 'createdDate',
            key: 'createdDate',
            width: 120,
            render: (date: string) => (
                <Tooltip title={formatDateFull(date)}>
                    <span>{formatDateShort(date)}</span>
                </Tooltip>
            ),
            sorter: (a: User, b: User) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: User) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            className="flex items-center justify-center w-8 h-8"
                            icon={<EditOutlined className="text-lg" />}
                            onClick={() => navigate(`/users/${record.id}`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button 
                                type="text" 
                                danger 
                                className="flex items-center justify-center w-8 h-8"
                                icon={<DeleteOutlined className="text-lg" />} 
                            />
                        </Tooltip>
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
