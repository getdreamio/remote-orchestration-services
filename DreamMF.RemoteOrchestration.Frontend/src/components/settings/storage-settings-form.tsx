import React, { useState } from 'react';
import { Form, Input, Select, Card, Button } from 'antd';
import {
    Configuration,
    StorageType,
} from '@/hooks/useConfigurations';

import {
    STORAGE_TYPE_KEY,
    STORAGE_PATH_KEY,
    AZURE_STORAGE_ACCOUNT_KEY,
    AZURE_STORAGE_KEY_KEY,
    AZURE_CONTAINER_NAME_KEY,
    AZURE_BLOB_NAME_KEY,
    AWS_ACCESS_KEY_ID_KEY,
    AWS_SECRET_ACCESS_KEY_KEY,
    AWS_REGION_KEY,
    AWS_BUCKET_NAME_KEY,
    AWS_BUCKET_KEY_KEY,
} from '@/constants/settings_constants';

interface StorageSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (key: string, value: string) => void;
}

export const StorageSettingsForm: React.FC<StorageSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    const [form] = Form.useForm();
    const [selectedStorageType, setSelectedStorageType] = useState<string>(
        configurations?.find(c => c.key === STORAGE_TYPE_KEY)?.value || 'LocalStorage'
    );

    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    const handleSubmit = (values: any) => {
        // Storage Type
        if (values.storageType) {
            onSave(STORAGE_TYPE_KEY, values.storageType);
        }

        // Local Storage
        if (values.storagePath) {
            onSave(STORAGE_PATH_KEY, values.storagePath);
        }

        // Azure Storage
        if (values.azureStorageAccount) {
            onSave(AZURE_STORAGE_ACCOUNT_KEY, values.azureStorageAccount);
        }
        if (values.azureStorageKey) {
            onSave(AZURE_STORAGE_KEY_KEY, values.azureStorageKey);
        }
        if (values.azureContainerName) {
            onSave(AZURE_CONTAINER_NAME_KEY, values.azureContainerName);
        }
        if (values.azureBlobName) {
            onSave(AZURE_BLOB_NAME_KEY, values.azureBlobName);
        }

        // AWS Storage
        if (values.awsAccessKeyId) {
            onSave(AWS_ACCESS_KEY_ID_KEY, values.awsAccessKeyId);
        }
        if (values.awsSecretAccessKey) {
            onSave(AWS_SECRET_ACCESS_KEY_KEY, values.awsSecretAccessKey);
        }
        if (values.awsRegion) {
            onSave(AWS_REGION_KEY, values.awsRegion);
        }
        if (values.awsBucketName) {
            onSave(AWS_BUCKET_NAME_KEY, values.awsBucketName);
        }
        if (values.awsBucketKey) {
            onSave(AWS_BUCKET_KEY_KEY, values.awsBucketKey);
        }
    };

    const renderConnectionDetails = () => {
        switch (selectedStorageType) {
            case 'LocalStorage':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Storage Path"
                            name="storagePath"
                            initialValue={getConfigValue(STORAGE_PATH_KEY)}
                            required
                            tooltip="The local path where files will be stored"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="/remotes"
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
                                placeholder="Enter storage account key"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Container Name"
                            name="azureContainerName"
                            initialValue={getConfigValue(AZURE_CONTAINER_NAME_KEY)}
                            required
                            tooltip="The name of your Azure Storage Container"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter container name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Blob Name"
                            name="azureBlobName"
                            initialValue={getConfigValue(AZURE_BLOB_NAME_KEY)}
                            required
                            tooltip="The name of your Azure Storage Blob"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter blob name"
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
                            tooltip="Your AWS Access Key ID"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter AWS Access Key ID"
                            />
                        </Form.Item>

                        <Form.Item
                            label="AWS Secret Access Key"
                            name="awsSecretAccessKey"
                            initialValue={getConfigValue(AWS_SECRET_ACCESS_KEY_KEY)}
                            required
                            tooltip="Your AWS Secret Access Key"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                placeholder="Enter AWS Secret Access Key"
                            />
                        </Form.Item>

                        <Form.Item
                            label="AWS Region"
                            name="awsRegion"
                            initialValue={getConfigValue(AWS_REGION_KEY)}
                            required
                            tooltip="The AWS Region for your S3 Bucket"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter AWS Region"
                            />
                        </Form.Item>

                        <Form.Item
                            label="S3 Bucket Name"
                            name="awsBucketName"
                            initialValue={getConfigValue(AWS_BUCKET_NAME_KEY)}
                            required
                            tooltip="The name of your S3 Bucket"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter S3 Bucket name"
                            />
                        </Form.Item>

                        <Form.Item
                            label="S3 Bucket Key"
                            name="awsBucketKey"
                            initialValue={getConfigValue(AWS_BUCKET_KEY_KEY)}
                            required
                            tooltip="The key (path) within your S3 Bucket"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="Enter S3 Bucket key"
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
            <h2 className="text-lg font-semibold mb-4">Storage Settings</h2>
            <div className="space-y-4">
                <Form.Item
                    label="Storage Type"
                    name="storageType"
                    initialValue={selectedStorageType}
                    required
                    tooltip="Choose your preferred storage type"
                >
                    <Select 
                        style={{ maxWidth: 400 }} 
                        onChange={(value) => setSelectedStorageType(value)}
                    >
                        <Select.Option value="LocalStorage">Local Storage</Select.Option>
                        <Select.Option value="AzureBlobStorage">Azure Blob Storage</Select.Option>
                        <Select.Option value="AwsS3Bucket">AWS S3 Bucket</Select.Option>
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
