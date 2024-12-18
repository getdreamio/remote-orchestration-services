import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Spin, Tabs, Table } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import HostForm from '@/components/hosts/host-form';
import { useGetHost } from '@/hooks/useHosts';
import { formatDate } from '@/lib/date-utils';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Version {
    id: string;
    version: string;
    createdAt: string;
    isActive: boolean;
}

const EditHostPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: host, isLoading } = useGetHost(Number(id));
    const [activeTab, setActiveTab] = useState('general');
    const [versions] = useState<Version[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" />
            </div>
        );
    }

    if (!host) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <Title level={4}>Host not found</Title>
                    <button
                        onClick={() => navigate('/hosts')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Hosts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Title level={4} className="!mb-0">Edit Host: {host.name}</Title>
            </div>
            <Card className="bg-gray-50 dark:bg-gray-800">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="General" key="general">
                        <HostForm
                            onSuccess={handleSuccess}
                            editingHost={{
                                id: host.id,
                                name: host.name,
                                description: host.description,
                                url: host.url,
                                key: host.key,
                                environment: host.environment,
                                tags: host.tags?.map(tag => ({
                                    key: 'tag',
                                    value: tag
                                }))
                            }}
                        />
                    </TabPane>
                    <TabPane tab="Remotes" key="remotes">
                        <div className="py-4">
                            Coming soon...
                        </div>
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

export default EditHostPage;
