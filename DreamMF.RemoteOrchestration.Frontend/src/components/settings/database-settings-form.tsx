import React, { useState } from 'react';
import { Form, Input, Select, Card, InputNumber, Button } from 'antd';
import {
    Configuration,
    DatabaseType,
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

interface DatabaseSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (key: string, value: string) => void;
}

export const DatabaseSettingsForm: React.FC<DatabaseSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    const [form] = Form.useForm();
    const [selectedDatabaseType, setSelectedDatabaseType] = useState<string>(
        configurations?.find(c => c.key === DB_HOST_TYPE)?.value || 'sqlite'
    );

    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const defaultSqlitePath = 'remote_orchestration.db';

    const handleSubmit = (values: any) => {
        // Database Type
        if (values.databaseType) {
            onSave(DB_HOST_TYPE, values.databaseType);
        }

        // SQLite Settings
        if (values.databasePath) {
            onSave(DB_HOST_FILENAME, values.databasePath);
        }

        // SQL Server / Postgres Settings
        if (values.host) {
            onSave(DB_HOST_KEY, values.host);
        }
        if (values.port) {
            onSave(DB_PORT_KEY, values.port.toString());
        }
        if (values.databaseName) {
            onSave(DB_NAME_KEY, values.databaseName);
        }
        if (values.username) {
            onSave(DB_USER_KEY, values.username);
        }
        if (values.password) {
            onSave(DB_PASSWORD_KEY, values.password);
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
                                placeholder={defaultSqlitePath}
                            />
                        </Form.Item>
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
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <h2 className="text-lg font-semibold mb-4">Database Settings</h2>
            <div className="space-y-4">
                <Form.Item
                    label="Database Type"
                    name="databaseType"
                    initialValue={selectedDatabaseType}
                    required
                    tooltip="Choose your database type"
                >
                    <Select 
                        style={{ maxWidth: 400 }}
                        onChange={(value) => setSelectedDatabaseType(value)}
                    >
                        <Select.Option value="sqlite">SQLite</Select.Option>
                        <Select.Option value="sqlserver">SQL Server</Select.Option>
                        <Select.Option value="postgres">PostgreSQL</Select.Option>
                    </Select>
                </Form.Item>

                {renderConnectionDetails()}

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Save Changes
                    </Button>
                </Form.Item>
            </div>
        </Form>
    );
};
