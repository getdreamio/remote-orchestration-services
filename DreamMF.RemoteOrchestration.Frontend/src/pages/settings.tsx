import { useEffect, useState } from 'react';
import { 
    Configuration, 
    StorageType, 
    useConfigurations, 
    useUpdateConfiguration,
    useCreateConfiguration,
    STORAGE_TYPE_KEY, 
    AZURE_CONTAINER_NAME_KEY, 
    AZURE_BLOB_NAME_KEY, 
    AWS_BUCKET_NAME_KEY, 
    AWS_BUCKET_KEY_KEY 
} from '../hooks/useConfigurations';
import { SettingsCard } from '../components/settings/settings-card';
import { StorageSettingsForm } from '../components/settings/storage-settings-form';
import { DatabaseSettingsForm } from '../components/settings/database-settings-form';
import { Card } from 'antd';

const SettingsPage = () => {
    const { data: configurations, isLoading } = useConfigurations();
    const { mutate: updateConfiguration, isPending: isUpdating } = useUpdateConfiguration();
    const { mutate: createConfiguration, isPending: isCreating } = useCreateConfiguration();

    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const getConfigId = (key: string) => {
        return configurations?.find(c => c.key === key)?.id;
    };

    const handleSave = async (key: string, value: string) => {
        const configId = getConfigId(key);
        if (configId) {
            updateConfiguration({ id: configId, key, value });
        } else {
            createConfiguration({ key, value });
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (

        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Configuration</h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <p>Note: Make sure to keep your storage credentials secure. Changes to storage settings will take effect immediately.</p>
                <p>Note: Changes to database settings will require a restart of the application to take effect. Make sure your database server is properly configured and accessible.</p>
            </div>

            {(isUpdating || isCreating) && (
                    <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
                        Saving changes...
                    </div>
                )}

            <Card className='mb-4'>
                <DatabaseSettingsForm 
                    configurations={configurations}
                    onSave={handleSave}
                />
            </Card>
            <Card>
                <StorageSettingsForm 
                    configurations={configurations}
                    onSave={handleSave}
                />
            </Card>
        </div>
    );
}

export default SettingsPage;
