import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Card, Button } from 'antd';
import {
    Configuration,
    StorageType,
} from '@/hooks/useConfigurations';

import {
    STORAGE_TYPE_KEY,
    STORAGE_PATH_KEY,
    AZURE_STORAGE_CONNECTION_STRING_KEY,
    AZURE_CONTAINER_NAME_KEY,
    AWS_ACCESS_ACCESS_KEY,
    AWS_SECRET_SECRET_ACCESS_KEY,
    AWS_REGION_KEY,
    AWS_BUCKET_NAME_KEY,
} from '@/constants/settings_constants';

interface StorageSettingsFormProps {
    configurations: Configuration[] | undefined;
    onSave: (changes: { key: string, value: string }[]) => void;
}

export const StorageSettingsForm: React.FC<StorageSettingsFormProps> = ({
    configurations,
    onSave,
}) => {
    const [form] = Form.useForm();
    const [selectedStorageType, setSelectedStorageType] = useState<string>(
        configurations?.find(c => c.key === STORAGE_TYPE_KEY)?.value || 'Unknown'
    );

    const getConfigValue = (key: string) => {
        return configurations?.find(c => c.key === key)?.value || '';
    };

    // Update form values when configurations change
    useEffect(() => {
        form.setFieldsValue({
            storageType: getConfigValue(STORAGE_TYPE_KEY),
            storagePath: getConfigValue(STORAGE_PATH_KEY),
            azureStorageConnectionString: getConfigValue(AZURE_STORAGE_CONNECTION_STRING_KEY),
            azureContainerName: getConfigValue(AZURE_CONTAINER_NAME_KEY),
            awsAccessKeyId: getConfigValue(AWS_ACCESS_ACCESS_KEY),
            awsSecretAccessKey: getConfigValue(AWS_SECRET_SECRET_ACCESS_KEY),
            awsRegion: getConfigValue(AWS_REGION_KEY),
            awsBucketName: getConfigValue(AWS_BUCKET_NAME_KEY)
        });
    }, [configurations]);

    const handleSubmit = async (values: any) => {
        console.log('Form values:', values); // Debug log

        // Create a map of field names to their corresponding configuration keys
        const fieldToConfigKey: { [key: string]: string } = {
            storageType: STORAGE_TYPE_KEY,
            storagePath: STORAGE_PATH_KEY,
            azureStorageConnectionString: AZURE_STORAGE_CONNECTION_STRING_KEY,
            azureContainerName: AZURE_CONTAINER_NAME_KEY,
            
            awsAccessKeyId: AWS_ACCESS_ACCESS_KEY,
            awsSecretAccessKey: AWS_SECRET_SECRET_ACCESS_KEY,
            awsRegion: AWS_REGION_KEY,
            awsBucketName: AWS_BUCKET_NAME_KEY
        };

        // Find all changed values
        const changes = Object.entries(values)
            .filter(([field, value]) => {
                const currentValue = getConfigValue(fieldToConfigKey[field]);
                return value !== currentValue && value !== undefined && value !== '';
            })
            .map(([field, value]) => ({
                key: fieldToConfigKey[field],
                value: value as string
            }));

        console.log('###', 'Changes to submit:', changes); // Debug log

        // Send all changes in a single batch
        if (changes.length > 0) {
            onSave(changes);
        }
    };

    const handleStorageTypeChange = (value: string) => {
        setSelectedStorageType(value);
        form.setFieldValue('storageType', value);
    };

    const renderConnectionDetails = () => {
        switch (selectedStorageType) {
            case 'LocalStorage':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Storage Path"
                            name="storagePath"
                            tooltip="The local path where files will be stored"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                disabled
                                placeholder="/remotes"
                            />
                        </Form.Item>
                    </div>
                );

            case 'AzureBlobStorage':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Storage Connection String"
                            name="azureStorageConnectionString"
                            tooltip="Azure Storage Connection String"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                placeholder="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=..."
                            />
                        </Form.Item>
                        <Form.Item
                            label="Container Name"
                            name="azureContainerName"
                            tooltip="Azure Blob Storage Container Name"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="my-container"
                            />
                        </Form.Item>
                    </div>
                );

            case 'AwsS3Bucket':
                return (
                    <div className="space-y-4">
                        <Form.Item
                            label="Access Key ID"
                            name="awsAccessKeyId"
                            tooltip="AWS Access Key ID"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="AKIAXXXXXXXXXXXXXXXX"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Secret Access Key"
                            name="awsSecretAccessKey"
                            tooltip="AWS Secret Access Key"
                        >
                            <Input.Password
                                style={{ maxWidth: 400 }}
                                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Region"
                            name="awsRegion"
                            tooltip="AWS Region"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="us-west-2"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Bucket Name"
                            name="awsBucketName"
                            tooltip="AWS S3 Bucket Name"
                        >
                            <Input
                                style={{ maxWidth: 400 }}
                                placeholder="my-bucket"
                            />
                        </Form.Item>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                storageType: selectedStorageType,
                storagePath: getConfigValue(STORAGE_PATH_KEY),
                azureStorageConnectionString: getConfigValue(AZURE_STORAGE_CONNECTION_STRING_KEY),
                azureContainerName: getConfigValue(AZURE_CONTAINER_NAME_KEY),
                awsAccessKeyId: getConfigValue(AWS_ACCESS_ACCESS_KEY),
                awsSecretAccessKey: getConfigValue(AWS_SECRET_SECRET_ACCESS_KEY),
                awsRegion: getConfigValue(AWS_REGION_KEY),
                awsBucketName: getConfigValue(AWS_BUCKET_NAME_KEY)
            }}
        >
            <h2 className="text-lg font-semibold mb-4">Storage Settings</h2>
            <div className="space-y-4">
                <Form.Item
                    label="Storage Type"
                    name="storageType"
                    tooltip="Select the type of storage to use"
                >
                    <Select
                        style={{ maxWidth: 400 }}
                        onChange={handleStorageTypeChange}
                        options={[
                            { value: 'LocalStorage', label: 'Local Storage' },
                            { value: 'AzureBlobStorage', label: 'Azure Blob Storage' },
                            { value: 'AwsS3Bucket', label: 'AWS S3 Bucket' },
                        ]}
                    />
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
