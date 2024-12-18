import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Tabs, Table } from 'antd';
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
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="General" key="general">
                        <HostForm onSuccess={handleSuccess} />
                    </TabPane>
                    <TabPane tab="Versions" key="versions">
                        <div className="py-4">
                            <Table
                                columns={columns}
                                dataSource={versions}
                                rowKey="id"
                                onRow={(record: Version) => ({
                                    onClick: () => setSelectedVersion(record.id),
                                    className: selectedVersion === record.id ? 'bg-blue-50' : '',
                                })}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default NewHostPage;
