import React, { useEffect } from 'react';
import { Form, Input, Select, Card, InputNumber, Button } from 'antd';
import {
    Configuration,
    DatabaseType,
    DATABASE_TYPE_KEY,
    DATABASE_CONNECTION_KEY,
    DATABASE_NAME_KEY,
    DATABASE_USER_KEY,
    DATABASE_PASSWORD_KEY,
    DATABASE_HOST_KEY,
    DATABASE_PORT_KEY,
} from '@/hooks/useConfigurations';

interface DatabaseSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (key: string, value: string) => void;
}

export const DatabaseSettingsForm: React.FC<DatabaseSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const defaultSqlitePath = 'remote_orchestration.db';
    const databaseType = getConfigValue(DATABASE_TYPE_KEY) as DatabaseType || 'sqlite';

    useEffect(() => {
        // Set default database type if not set
        if (!getConfigValue(DATABASE_TYPE_KEY)) {
            onSave(DATABASE_TYPE_KEY, 'sqlite');
        }
        
        // Set default SQLite path if using SQLite and path not set
        if (databaseType === 'sqlite' && !getConfigValue(DATABASE_CONNECTION_KEY)) {
            onSave(DATABASE_CONNECTION_KEY, defaultSqlitePath);
        }
    }, [configurations]);

    const renderConnectionDetails = () => {
        switch (databaseType) {
            case 'sqlite':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Database File Path"
                            name="databasePath"
                            initialValue={getConfigValue(DATABASE_CONNECTION_KEY)}
                            required
                            tooltip="The path where the SQLite database file will be stored"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(DATABASE_CONNECTION_KEY, e.target.value)}
                                defaultValue={defaultSqlitePath}
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
                            initialValue={getConfigValue(DATABASE_HOST_KEY)}
                            required
                            tooltip="The hostname or IP address of your database server"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(DATABASE_HOST_KEY, e.target.value)}
                                placeholder={databaseType === 'sqlserver' ? 'localhost\\SQLEXPRESS' : 'localhost'}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Port"
                            name="port"
                            initialValue={getConfigValue(DATABASE_PORT_KEY)}
                            required
                            tooltip="The port number your database is listening on"
                        >
                            <InputNumber
                                style={{ maxWidth: 200 }}
                                onChange={(value) => onSave(DATABASE_PORT_KEY, value?.toString() || '')}
                                placeholder={databaseType === 'sqlserver' ? '1433' : '5432'}
                                min={1}
                                max={65535}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Database Name"
                            name="databaseName"
                            initialValue={getConfigValue(DATABASE_NAME_KEY)}
                            required
                            tooltip="The name of your database"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(DATABASE_NAME_KEY, e.target.value)}
                                placeholder={databaseType === 'sqlserver' ? 'DreamMF' : 'dreammf'}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Username"
                            name="username"
                            initialValue={getConfigValue(DATABASE_USER_KEY)}
                            required
                            tooltip="The username to connect to your database"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(DATABASE_USER_KEY, e.target.value)}
                                placeholder="Enter username"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            initialValue={getConfigValue(DATABASE_PASSWORD_KEY)}
                            required
                            tooltip="The password to connect to your database"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(DATABASE_PASSWORD_KEY, e.target.value)}
                                placeholder="Enter password"
                            />
                        </Form.Item>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">Database Configuration</h3>
                    <Form layout="vertical">
                        <div className="space-y-4">
                            <Form.Item
                                label="Database Type"
                                name="databaseType"
                                initialValue={databaseType}
                                required
                                tooltip="Select your preferred database type"
                            >
                                <Select
                                    style={{ maxWidth: 300 }}
                                    onChange={(value) => onSave(DATABASE_TYPE_KEY, value)}
                                    options={[
                                        { label: 'SQLite', value: 'sqlite' },
                                        { label: 'SQL Server', value: 'sqlserver' },
                                        { label: 'PostgreSQL', value: 'postgres' },
                                    ]}
                                />
                            </Form.Item>

                            {renderConnectionDetails()}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button type="primary" onClick={() => {
                                // You can add additional validation here if needed
                                console.log('Database settings saved');
                            }}>
                                Save Database Settings
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    );
};
