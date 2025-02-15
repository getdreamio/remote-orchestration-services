import React, { useState } from 'react';
import { Form, Input, Select, Alert, InputNumber, Switch, message } from 'antd';
import { useCreateUser, useUpdateUser, useRoles } from '@/hooks/useUsers';
import PasswordStrength from './password-strength';

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

interface Role {
    id: number;
    name: string;
    description: string;
    createdDate: number;
    updatedDate: number;
}

interface UserFormProps {
    editingUser?: {
        id: number;
        email?: string;
        displayName?: string;
        firstName?: string;
        lastName?: string;
        status?: UserStatus;
        roles?: string[];
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
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const { data: roles = [] } = useRoles();

    const isEditing = editingUser && editingUser.id > 0;

    // Set initial form values and update roles when role data is loaded
    React.useEffect(() => {
        if (editingUser) {
            const formValues = { ...editingUser };
            
            // Convert role names to IDs if roles data is available
            if (roles.length > 0 && Array.isArray(editingUser.roles)) {
                const roleIds = editingUser.roles.map(roleName => 
                    roles.find(r => r.name === roleName)?.id
                ).filter(Boolean) as number[];
                formValues.roles = roleIds;
            }
            
            form.setFieldsValue(formValues);
        }
    }, [editingUser, roles, form]);

    const handleSubmit = async (values: any) => {
        try {
            // Convert role IDs to role names for both create and update
            const selectedRoles = values.roles?.map((roleId: number) => 
                roles.find(r => r.id === roleId)?.name
            ).filter(Boolean) || [];

            if (isEditing) {
                const updateData = {
                    id: editingUser.id,
                    user: {
                        displayName: values.displayName,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        status: values.status,
                        newPassword: values.newPassword,
                        isTwoFactorEnabled: values.isTwoFactorEnable,
                        roles: selectedRoles
                    }
                };
                await updateUser.mutateAsync(updateData);
                message.success('User updated successfully');
            } else {
                const createData = {
                    ...values,
                    roles: selectedRoles
                };
                await createUser.mutateAsync(createData);
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
                                <div>
                                    <Input.Password 
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <PasswordStrength password={password} />
                                </div>
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
                name="roles"
                label="Roles"
                rules={[{ required: true, message: 'Please select at least one role.', type: 'array' }]}
            >
                <Select mode="multiple" placeholder="Select roles" optionLabelProp="label" listHeight={500}>
                    {roles.map((role: Role) => (
                        <Option 
                            key={role.id} 
                            value={role.id} 
                            label={role.name}
                        >
                            <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="text-gray-500 text-sm">{role.description}</div>
                            </div>
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                name="newPassword"
                label="New Password"
                extra="Leave blank to keep current password"
            >
                <div>
                    <Input.Password 
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password" 
                    />
                    <PasswordStrength password={newPassword} />
                </div>
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
