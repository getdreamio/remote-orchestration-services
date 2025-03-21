import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Modal, Upload } from 'antd';
import { UploadOutlined, DatabaseOutlined } from '@ant-design/icons';
import {
    Configuration,
} from '@/hooks/useConfigurations';

import {
    DB_HOST_TYPE,
    DB_HOST_FILENAME,
    DB_NAME_KEY,
    DB_USER_KEY,
    DB_PASSWORD_KEY,
    DB_HOST_KEY,
    DB_PORT_KEY,
} from '@/constants/settings_constants';
import notify from '../../utils/notifications';

interface DatabaseSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (changes: { key: string, value: string }[]) => void;
}

export const DatabaseSettingsForm: React.FC<DatabaseSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    const [form] = Form.useForm();
    const [selectedDatabaseType, setSelectedDatabaseType] = useState<string>(
        configurations?.find(c => c.key === DB_HOST_TYPE)?.value || 'sqlite'
    );
    const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
    const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const defaultSqlitePath = 'remote_orchestration.db';

    const handleSubmit = (values: any) => {
        const changes: { key: string, value: string }[] = [];

        // Database Type
        if (values.databaseType) {
            changes.push({ key: DB_HOST_TYPE, value: values.databaseType });
        }

        // SQLite Settings
        if (values.databasePath) {
            changes.push({ key: DB_HOST_FILENAME, value: values.databasePath });
        }

        // SQL Server / PostgreSQL Settings
        if (values.host) {
            changes.push({ key: DB_HOST_KEY, value: values.host });
        }
        if (values.port) {
            changes.push({ key: DB_PORT_KEY, value: values.port.toString() });
        }
        if (values.databaseName) {
            changes.push({ key: DB_NAME_KEY, value: values.databaseName });
        }
        if (values.username) {
            changes.push({ key: DB_USER_KEY, value: values.username });
        }
        if (values.password) {
            changes.push({ key: DB_PASSWORD_KEY, value: values.password });
        }

        onSave(changes);
    };

    const handleBackup = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/backup/database');
            if (!response.ok) {
                throw new Error('Failed to backup database');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'remote_orchestration_backup.db');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            notify.success(
                'Database backup downloaded successfully',
                'Your database backup has been downloaded to your computer.'
            );
        } catch (error) {
            notify.error(
                'Failed to backup database',
                'There was an error while creating the database backup. Please try again.'
            );
            console.error('Backup error:', error);
        } finally {
            setIsLoading(false);
            setIsBackupModalVisible(false);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            notify.error(
                'Please select a file to restore',
                'Please select a valid database backup file.'
            );
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/backup/restore', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                notify.success(
                    'Database restored successfully',
                    'The database has been restored from the backup file.'
                );
                window.location.reload();
            } else {
                notify.error(
                    'Failed to restore database',
                    'There was an error while restoring the database. Please ensure the backup file is valid.'
                );
            }
        } catch (error) {
            notify.error(
                'Failed to restore database',
                'There was an error while restoring the database. Please try again.'
            );
            console.error('Restore error:', error);
        } finally {
            setIsLoading(false);
            setIsRestoreModalVisible(false);
        }
    };

    const renderConnectionDetails = () => {
        switch (selectedDatabaseType) {
            case 'sqlite':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Database File Path"
                            name="databasePath"
                            initialValue={getConfigValue(DB_HOST_FILENAME)}
                            required
                            tooltip="The path where the SQLite database file will be stored"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                disabled
                                placeholder={defaultSqlitePath}
                            />
                        </Form.Item>
                        <div className="" style={{ marginBottom: 20, marginTop: -20 }}>
                            <Button
                                icon={<DatabaseOutlined />}
                                onClick={() => setIsBackupModalVisible(true)}
                                loading={isLoading}
                                style={{ marginRight: 5, width: 200 }}
                            >
                                Backup Database
                            </Button>
                            <Button
                                icon={<UploadOutlined />}
                                onClick={() => setIsRestoreModalVisible(true)}
                                loading={isLoading}
                                style={{ width: 200 }}
                            >
                                Restore Database
                            </Button>
                        </div>
                    </div>
                );

            case 'sqlserver':
            case 'postgres':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Host"
                            name="host"
                            initialValue={getConfigValue(DB_HOST_KEY)}
                            required
                            tooltip="The hostname or IP address of your database server"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder={selectedDatabaseType === 'sqlserver' ? 'localhost\\SQLEXPRESS' : 'localhost'}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Port"
                            name="port"
                            initialValue={getConfigValue(DB_PORT_KEY)}
                            required
                            tooltip="The port number your database is listening on"
                        >
                            <InputNumber
                                style={{ maxWidth: 200 }}
                                placeholder={selectedDatabaseType === 'sqlserver' ? '1433' : '5432'}
                                min={1}
                                max={65535}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Database Name"
                            name="databaseName"
                            initialValue={getConfigValue(DB_NAME_KEY)}
                            required
                            tooltip="The name of the database to connect to"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter database name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Username"
                            name="username"
                            initialValue={getConfigValue(DB_USER_KEY)}
                            required
                            tooltip="Database user username"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter username"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            initialValue={getConfigValue(DB_PASSWORD_KEY)}
                            required
                            tooltip="Database user password"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                placeholder="Enter password"
                            />
                        </Form.Item>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    databaseType: selectedDatabaseType,
                }}
            >
                <Form.Item
                    label="Database Type"
                    name="databaseType"
                    required
                    tooltip="The type of database to use"
                >
                    <Select
                        style={{ maxWidth: 400 }}
                        onChange={(value) => setSelectedDatabaseType(value)}
                    >
                        <Select.Option value="sqlite">SQLite (local)</Select.Option>
                        <Select.Option value="sqlserver" disabled>SQL Server</Select.Option>
                        <Select.Option value="mysql" disabled>MySQL</Select.Option>
                        <Select.Option value="postgres" disabled>PostgreSQL</Select.Option>
                    </Select>
                </Form.Item>

                {renderConnectionDetails()}

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>

            {/* Backup Confirmation Modal */}
            <Modal
                title="Backup Database"
                open={isBackupModalVisible}
                onOk={handleBackup}
                onCancel={() => setIsBackupModalVisible(false)}
                confirmLoading={isLoading}
            >
                <p>Are you sure you want to backup the database? This will download a copy of your current database.</p>
            </Modal>

            {/* Restore Confirmation Modal */}
            <Modal
                title="Restore Database"
                open={isRestoreModalVisible}
                onOk={handleRestore}
                onCancel={() => setIsRestoreModalVisible(false)}
                confirmLoading={isLoading}
            >
                <div className="space-y-4">
                    <p>Are you sure you want to restore the database? This will replace your current database with the selected backup file.</p>
                    <Upload.Dragger
                        beforeUpload={(file) => {
                            setSelectedFile(file);
                            return false;
                        }}
                        onRemove={() => setSelectedFile(null)}
                        maxCount={1}
                        accept=".db"
                        className="p-4"
                    >
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag database backup file to this area</p>
                        <p className="ant-upload-hint">
                            Only .db files are supported
                        </p>
                    </Upload.Dragger>
                </div>
            </Modal>
        </>
    );
};
