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

export function SettingsPage() {
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

    const storageType = getConfigValue(STORAGE_TYPE_KEY) as StorageType;

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <SettingsCard title="Storage Configuration">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Storage Type
                        </label>
                        <select
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            value={storageType}
                            onChange={(e) => handleSave(STORAGE_TYPE_KEY, e.target.value)}
                        >
                            <option value="AzureBlobStorage">Azure Blob Storage</option>
                            <option value="AwsS3Bucket">AWS S3 Bucket</option>
                        </select>
                    </div>
                </div>
            </SettingsCard>

            {storageType === 'AzureBlobStorage' && (
                <SettingsCard title="Azure Blob Storage Settings">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Container Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                value={getConfigValue(AZURE_CONTAINER_NAME_KEY)}
                                onChange={(e) => handleSave(AZURE_CONTAINER_NAME_KEY, e.target.value)}
                                placeholder="Enter container name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Blob Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                value={getConfigValue(AZURE_BLOB_NAME_KEY)}
                                onChange={(e) => handleSave(AZURE_BLOB_NAME_KEY, e.target.value)}
                                placeholder="Enter blob name"
                            />
                        </div>
                    </div>
                </SettingsCard>
            )}

            {storageType === 'AwsS3Bucket' && (
                <SettingsCard title="AWS S3 Bucket Settings">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Bucket Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                value={getConfigValue(AWS_BUCKET_NAME_KEY)}
                                onChange={(e) => handleSave(AWS_BUCKET_NAME_KEY, e.target.value)}
                                placeholder="Enter bucket name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Bucket Key
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                value={getConfigValue(AWS_BUCKET_KEY_KEY)}
                                onChange={(e) => handleSave(AWS_BUCKET_KEY_KEY, e.target.value)}
                                placeholder="Enter bucket key"
                            />
                        </div>
                    </div>
                </SettingsCard>
            )}

            {(isUpdating || isCreating) && (
                <div className="text-sm text-muted-foreground">Saving changes...</div>
            )}
        </div>
    );
}
