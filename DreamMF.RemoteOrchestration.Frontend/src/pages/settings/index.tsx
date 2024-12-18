import React from 'react';
import { Card, Tabs } from 'antd';
import { Settings as SettingsIcon, Database, HardDrive } from 'lucide-react';
import { useConfigurations, useUpdateConfiguration, useCreateConfiguration } from '@/hooks/useConfigurations';
import { DatabaseSettingsForm } from '@/components/settings/database-settings-form';
import { StorageSettingsForm } from '@/components/settings/storage-settings-form';

const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
    const { data: configurations, isLoading } = useConfigurations();
    const { mutate: updateConfiguration } = useUpdateConfiguration();
    const { mutate: createConfiguration } = useCreateConfiguration();

    const handleSave = async (key: string, value: string) => {
        const config = configurations?.find(c => c.key === key);
        if (config) {
            updateConfiguration({ id: config.id, key, value });
        } else {
            createConfiguration({ key, value });
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="h-8 w-8 text-gray-500" />
                <h1 className="text-2xl font-semibold">Settings</h1>
            </div>

            <Tabs defaultActiveKey="database" className="settings-tabs">
                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database
                        </span>
                    }
                    key="database"
                >
                    <DatabaseSettingsForm
                        configurations={configurations}
                        onSave={handleSave}
                    />
                </TabPane>

                <TabPane
                    tab={
                        <span className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Storage
                        </span>
                    }
                    key="storage"
                >
                    <StorageSettingsForm
                        configurations={configurations}
                        onSave={handleSave}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
