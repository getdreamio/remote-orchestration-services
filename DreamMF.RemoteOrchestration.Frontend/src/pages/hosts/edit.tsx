import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import HostModal from '@/components/hosts/host-modal';
import { useGetHost } from '@/hooks/useHosts';

const { Title } = Typography;

const EditHostPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: host, isLoading } = useGetHost(Number(id));

    const handleClose = () => {
        navigate('/hosts');
    };

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
                        onClick={handleClose}
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
                <button
                    onClick={handleClose}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeftOutlined />
                    Back to Hosts
                </button>
                <Title level={4} className="!mb-0">Edit Host: {host.name}</Title>
            </div>
            <Card>
                <HostModal
                    isOpen={true}
                    onClose={handleClose}
                    editingHost={{
                        host_ID: host.id,
                        name: host.name,
                        description: host.description,
                        url: host.url,
                        key: host.key,
                        environment: host.environment
                    }}
                />
            </Card>
        </div>
    );
};

export default EditHostPage;
