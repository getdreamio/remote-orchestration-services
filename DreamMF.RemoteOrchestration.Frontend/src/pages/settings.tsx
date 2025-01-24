import { useEffect, useState } from 'react';
import { 
    useConfigurations,
    useUpdateConfigurationBatch,
} from '../hooks/useConfigurations';
import { StorageSettingsForm } from '../components/settings/storage-settings-form';
import { DatabaseSettingsForm } from '../components/settings/database-settings-form';
import { Card } from 'antd';
import { ApiSettingsForm } from '@/components/settings/api-settings-form';
import { Helmet } from 'react-helmet';

const SettingsPage = () => {
    const { data: configurations, isLoading } = useConfigurations();
    const { mutate: updateSettingBatch, isPending: isUpdating } = useUpdateConfigurationBatch();

    const handleSave = async (changes: { key: string, value: string }[]) => {
        console.log('Saving changes:', changes); // Debug log
        if (changes && changes.length > 0) {
            updateSettingBatch(changes);
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div>
            <Helmet>
                <title>[ROS] | Configuration</title>
                <meta name="description" content="Dream.mf [ROS] | Configuration Page" />
            </Helmet>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Configuration</h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <p>Note: Make sure to keep your storage credentials secure. Changes to storage settings will take effect immediately.</p>
                <p>Note: Changes to database settings will require a restart of the application to take effect. Make sure your database server is properly configured and accessible.</p>
            </div>

            {(isUpdating) && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
                    Saving changes...
                </div>
            )}

            <div className="space-y-6">
                <Card title="API Settings" className="shadow-sm mb-4 bg-gray-50 dark:bg-gray-800">
                    <ApiSettingsForm />
                </Card>
                <Card title="Database Settings" className="shadow-sm mb-4 bg-gray-50 dark:bg-gray-800">
                    <DatabaseSettingsForm 
                        configurations={configurations}
                        onSave={handleSave}
                    />
                </Card>
                <Card title="Storage Settings" className="shadow-sm bg-gray-50 dark:bg-gray-800">
                    <StorageSettingsForm 
                        configurations={configurations}
                        onSave={handleSave}
                    />
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
