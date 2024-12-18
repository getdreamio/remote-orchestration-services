import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import HostModal from '@/components/hosts/host-modal';

const { Title } = Typography;

const NewHostPage: React.FC = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/hosts');
    };

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
                <Title level={4} className="!mb-0">New Host</Title>
            </div>
            <Card>
                <HostModal isOpen={true} onClose={handleClose} />
            </Card>
        </div>
    );
};

export default NewHostPage;
