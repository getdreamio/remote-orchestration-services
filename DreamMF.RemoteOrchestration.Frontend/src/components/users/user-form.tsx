import React from 'react';
import { Form, Input, Select, Alert, InputNumber, Switch, message } from 'antd';
import { useCreateUser, useUpdateUser, useUserRoles } from '@/hooks/useUsers';

const { Option } = Select;

export enum AuthProvider {
    Local = 'Local',
    Google = 'Google',
    GitHub = 'GitHub',
    Microsoft = 'Microsoft',
    Custom = 'Custom'
}

export enum UserStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Suspended = 'Suspended',
    PendingVerification = 'PendingVerification'
}

interface UserFormProps {
    editingUser?: {
        id: number;
        email?: string;
        displayName?: string;
        firstName?: string;
        lastName?: string;
        status?: UserStatus;
        authProvider?: AuthProvider;
        authUserId?: string;
        isTwoFactorEnabled?: boolean;
        isEmailVerified?: boolean;
        failedLoginAttempts?: number;
        lastLoginDate?: number;
        lastLoginIp?: string;
        createdDate?: number;
        updatedDate?: number;
    };
    mode?: 'general' | 'security' | 'auth';
    onSuccess?: () => void;
    renderFooter?: (isSubmitting: boolean) => React.ReactNode;
}

const UserForm: React.FC<UserFormProps> = ({
    editingUser,
    mode = 'general',
    onSuccess,
    renderFooter
}) => {
    const [form] = Form.useForm();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const { data: roles = [] } = useUserRoles();

    const isEditing = editingUser && editingUser.id > 0;

    React.useEffect(() => {
        if (editingUser) {
            form.setFieldsValue(editingUser);
        }
    }, [editingUser, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (isEditing) {
                await updateUser.mutateAsync({
                    ...values,
                    id: editingUser.id
                });
                message.success('User updated successfully');
            } else {
                await createUser.mutateAsync(values);
                message.success('User created successfully');
            }
            onSuccess?.();
        } catch (error: any) {
            message.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
        }
    };

    const renderGeneralFields = () => (
        <>
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Please input email' },
                    { type: 'email', message: 'Please input valid email' }
                ]}
            >
                <Input disabled={isEditing} />
            </Form.Item>
            <Form.Item
                name="displayName"
                label="Display Name"
                rules={[{ required: true, message: 'Please input display name' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item name="firstName" label="First Name">
                <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name">
                <Input />
            </Form.Item>
            <Form.Item
                name="authProvider"
                label="Authentication Provider"
                rules={[{ required: true, message: 'Please select auth provider' }]}
                initialValue={AuthProvider.Local}
            >
                <Select disabled={isEditing}>
                    {Object.values(AuthProvider).map(provider => (
                        <Option key={provider} value={provider}>{provider}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                    prevValues.authProvider !== currentValues.authProvider
                }
            >
                {({ getFieldValue }) => {
                    const authProvider = getFieldValue('authProvider');
                    if (authProvider === AuthProvider.Local && !isEditing) {
                        return (
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true, message: 'Please input password' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        );
                    }
                    if (authProvider !== AuthProvider.Local) {
                        return (
                            <>
                                <Form.Item
                                    name="authUserId"
                                    label="Provider User ID"
                                    rules={[{ required: true, message: 'Please input provider user ID' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item name="accessToken" label="Access Token">
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item name="refreshToken" label="Refresh Token">
                                    <Input.Password />
                                </Form.Item>
                            </>
                        );
                    }
                    return null;
                }}
            </Form.Item>
            <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
            >
                <Select>
                    {Object.values(UserStatus).map(status => (
                        <Option key={status} value={status}>{status}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                name="newPassword"
                label="New Password"
                extra="Leave blank to keep current password"
            >
                <Input.Password autoComplete="new-password" />
            </Form.Item>
        </>
    );

    const renderSecurityFields = () => (
        <>
            <Form.Item name="failedLoginAttempts" label="Failed Login Attempts">
                <InputNumber min={0} disabled />
            </Form.Item>
            <Form.Item name="lastLoginIp" label="Last Login IP">
                <Input disabled />
            </Form.Item>
            <Form.Item name="lastLoginDate" label="Last Login Date">
                <Input disabled />
            </Form.Item>
        </>
    );

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
        >
            {mode === 'general' && renderGeneralFields()}
            {mode === 'security' && renderSecurityFields()}
            {renderFooter?.(createUser.isPending || updateUser.isPending)}
        </Form>
    );
};

export default UserForm;
