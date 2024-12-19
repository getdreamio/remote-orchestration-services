import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTags, useDeleteTag } from '@/hooks/useTags';
import { Helmet } from 'react-helmet';

const TagsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: tags, isLoading } = useTags();
    const deleteTag = useDeleteTag();

    const handleDelete = async (id: number) => {
        try {
            await deleteTag.mutateAsync(id);
            message.success('Tag deleted successfully');
        } catch (error) {
            message.error('Failed to delete tag');
        }
    };

    const columns = [
        {
            title: 'Text',
            dataIndex: 'text',
            key: 'text',
        },
        {
            title: 'Created Date',
            dataIndex: 'created_Date',
            key: 'created_Date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <span>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/tags/${record.tag_ID}`)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this tag?"
                        onConfirm={() => handleDelete(record.tag_ID)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    return (
        <div>
            <Helmet>
                <title>[ROS] | List Tags</title>
                <meta name="description" content={`Dream.mf [ROS] | List Tags Page`} />
            </Helmet>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-2xl font-bold">Tags</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/tags/new')}
                >
                    Add Tag
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={tags}
                loading={isLoading}
                rowKey="tag_ID"
            />
        </div>
    );
};

export default TagsPage;
