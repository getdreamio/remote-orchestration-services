import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Card } from 'antd';
import {
    Configuration,
    StorageType,
    STORAGE_TYPE_KEY,
    LOCAL_STORAGE_PATH_KEY,
    AZURE_STORAGE_ACCOUNT_KEY,
    AZURE_STORAGE_KEY_KEY,
    AZURE_CONTAINER_NAME_KEY,
    AZURE_BLOB_NAME_KEY,
    AWS_ACCESS_KEY_ID_KEY,
    AWS_SECRET_ACCESS_KEY_KEY,
    AWS_REGION_KEY,
    AWS_BUCKET_NAME_KEY,
    AWS_BUCKET_KEY_KEY,
} from '@/hooks/useConfigurations';

interface StorageSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (key: string, value: string) => void;
}

export const StorageSettingsForm: React.FC<StorageSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const storageType = getConfigValue(STORAGE_TYPE_KEY) as StorageType;
    const defaultPath = '/remotes';

    useEffect(() => {
        // Set default storage type if not set
        if (!getConfigValue(STORAGE_TYPE_KEY)) {
            onSave(STORAGE_TYPE_KEY, 'LocalStorage');
        }
        
        // Set default path for local storage if not set
        if (!getConfigValue(LOCAL_STORAGE_PATH_KEY)) {
            onSave(LOCAL_STORAGE_PATH_KEY, defaultPath);
        }
    }, [configurations]);

    const renderConnectionDetails = () => {
        switch (storageType) {
            case 'LocalStorage':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Storage Path"
                            name="storagePath"
                            initialValue={getConfigValue(LOCAL_STORAGE_PATH_KEY)}
                            required
                            tooltip="The local path where files will be stored"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(LOCAL_STORAGE_PATH_KEY, e.target.value)}
                                placeholder={defaultPath}
                            />
                        </Form.Item>
                    </div>
                );

            case 'AzureBlobStorage':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Storage Account Name"
                            name="azureStorageAccount"
                            initialValue={getConfigValue(AZURE_STORAGE_ACCOUNT_KEY)}
                            required
                            tooltip="The name of your Azure Storage Account"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AZURE_STORAGE_ACCOUNT_KEY, e.target.value)}
                                placeholder="Enter storage account name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Storage Account Key"
                            name="azureStorageKey"
                            initialValue={getConfigValue(AZURE_STORAGE_KEY_KEY)}
                            required
                            tooltip="The access key for your Azure Storage Account"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AZURE_STORAGE_KEY_KEY, e.target.value)}
                                placeholder="Enter storage account key"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Container Name"
                            name="azureContainerName"
                            initialValue={getConfigValue(AZURE_CONTAINER_NAME_KEY)}
                            required
                            tooltip="The name of the blob container in your storage account"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AZURE_CONTAINER_NAME_KEY, e.target.value)}
                                placeholder="Enter container name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Blob Name Prefix"
                            name="azureBlobName"
                            initialValue={getConfigValue(AZURE_BLOB_NAME_KEY)}
                            tooltip="Optional prefix for blob names in the container"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AZURE_BLOB_NAME_KEY, e.target.value)}
                                placeholder="Enter blob name prefix (optional)"
                            />
                        </Form.Item>
                    </div>
                );

            case 'AwsS3Bucket':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="AWS Access Key ID"
                            name="awsAccessKeyId"
                            initialValue={getConfigValue(AWS_ACCESS_KEY_ID_KEY)}
                            required
                            tooltip="Your AWS IAM user access key ID"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AWS_ACCESS_KEY_ID_KEY, e.target.value)}
                                placeholder="Enter AWS access key ID"
                            />
                        </Form.Item>

                        <Form.Item
                            label="AWS Secret Access Key"
                            name="awsSecretAccessKey"
                            initialValue={getConfigValue(AWS_SECRET_ACCESS_KEY_KEY)}
                            required
                            tooltip="Your AWS IAM user secret access key"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AWS_SECRET_ACCESS_KEY_KEY, e.target.value)}
                                placeholder="Enter AWS secret access key"
                            />
                        </Form.Item>

                        <Form.Item
                            label="AWS Region"
                            name="awsRegion"
                            initialValue={getConfigValue(AWS_REGION_KEY)}
                            required
                            tooltip="The AWS region where your S3 bucket is located"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AWS_REGION_KEY, e.target.value)}
                                placeholder="e.g., us-west-2"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Bucket Name"
                            name="awsBucketName"
                            initialValue={getConfigValue(AWS_BUCKET_NAME_KEY)}
                            required
                            tooltip="The name of your S3 bucket"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AWS_BUCKET_NAME_KEY, e.target.value)}
                                placeholder="Enter bucket name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Bucket Key Prefix"
                            name="awsBucketKey"
                            initialValue={getConfigValue(AWS_BUCKET_KEY_KEY)}
                            tooltip="Optional prefix for objects in the bucket"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                onChange={(e) => onSave(AWS_BUCKET_KEY_KEY, e.target.value)}
                                placeholder="Enter bucket key prefix (optional)"
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
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">Cloud Storage Configuration</h3>
                    <Form layout="vertical">
                        <div className="space-y-4">
                            <Form.Item
                                label="Storage Type"
                                name="storageType"
                                initialValue={storageType || 'LocalStorage'}
                                required
                                tooltip="Select your preferred storage provider"
                            >
                                <Select
                                    style={{ maxWidth: 300 }}
                                    onChange={(value) => onSave(STORAGE_TYPE_KEY, value)}
                                    options={[
                                        { label: 'Local Storage', value: 'LocalStorage' },
                                        { label: 'Azure Blob Storage', value: 'AzureBlobStorage' },
                                        { label: 'AWS S3 Bucket', value: 'AwsS3Bucket' },
                                    ]}
                                />
                            </Form.Item>

                            {renderConnectionDetails()}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button type="primary" onClick={() => {
                                // You can add additional validation here if needed
                                console.log('Storage settings saved');
                            }}>
                                Save Storage Settings
                            </Button>
                        </div>
                    </Form>
                </div>

                
            </div>
        </>
    );
};
