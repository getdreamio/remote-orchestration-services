import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Tabs, Table, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import HostForm from '@/components/hosts/host-form';
import { TagInput, TagItem } from '@/components/tags/tag-input';
import { useTags } from '@/hooks/useTags';
import { formatDate } from '@/lib/date-utils';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Version {
    id: string;
    version: string;
    createdAt: string;
    isActive: boolean;
}

const NewHostPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [tags, setTags] = useState<TagItem[]>([]);
    const [versions] = useState<Version[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const { data: existingTags = [] } = useTags();

    const formattedExistingTags = existingTags.map(tag => ({
        key: 'tag',
        value: tag.text
    }));

    const handleSuccess = () => {
        navigate('/hosts');
    };

    const columns = [
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => {
                try {
                    return date ? formatDate(date) : '-';
                } catch (error) {
                    return '-';
                }
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, record: Version) => (
                <span className={record.isActive ? 'text-green-500' : 'text-gray-500'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">New Host</Title>
            </div>
            <Card className="bg-gray-50 dark:bg-gray-800">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="General" key="general">
                        <HostForm 
                            onSuccess={handleSuccess} 
                            mode="general"
                            renderFooter={(isSubmitting) => (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                        Create Host
                                    </Button>
                                </div>
                            )}
                        />
                    </TabPane>
                    <TabPane tab="Information" key="information">
                        <HostForm 
                            onSuccess={handleSuccess} 
                            mode="information"
                            renderFooter={(isSubmitting) => (
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                        Create Host
                                    </Button>
                                </div>
                            )}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default NewHostPage;
