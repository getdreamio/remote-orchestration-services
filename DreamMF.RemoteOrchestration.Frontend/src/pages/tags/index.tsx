import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTags, useDeleteTag, Tag } from '@/hooks/useTags';
import { Helmet } from 'react-helmet';
import { formatDateShort, formatDateFull } from '@/lib/date-utils';
import notify from '../../utils/notifications';

const TagsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: tags, isLoading } = useTags();
    const deleteTag = useDeleteTag();

    const handleDelete = async (id: number) => {
        try {
            await deleteTag.mutateAsync(id);
            notify.success('Tag deleted successfully');
        } catch (error) {
            notify.error('Error', 'Failed to delete tag');
        }
    };

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            ellipsis: true,
            render: (key: string) => (
                <Tooltip title={key}>
                    <div className="font-medium max-w-[250px]">{key}</div>
                </Tooltip>
            ),
        },
        {
            title: 'Display Name',
            dataIndex: 'display_Name',
            key: 'display_Name',
            ellipsis: true,
            render: (name: string) => (
                <Tooltip title={name}>
                    <div className="max-w-[300px]">{name}</div>
                </Tooltip>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'created_Date',
            key: 'created_Date',
            render: (date: string) => (
                <Tooltip title={formatDateFull(date)}>
                    <div className="max-w-[120px]">{formatDateShort(date)}</div>
                </Tooltip>
            ),
            sorter: (a: Tag, b: Tag) => new Date(a.created_Date).getTime() - new Date(b.created_Date).getTime(),
        },
        {
            title: 'Updated',
            dataIndex: 'updated_Date',
            key: 'updated_Date',
            render: (date: string) => (
                <Tooltip title={formatDateFull(date)}>
                    <div className="max-w-[120px]">{formatDateShort(date)}</div>
                </Tooltip>
            ),
            sorter: (a: Tag, b: Tag) => new Date(a.updated_Date).getTime() - new Date(b.updated_Date).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (tag: Tag) => (
                <div className="flex gap-2 max-w-[120px]">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            className="flex items-center justify-center w-8 h-8"
                            icon={<EditOutlined className="text-lg" />}
                            onClick={() => navigate(`/tags/${tag.tag_ID}`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this tag?"
                        onConfirm={() => handleDelete(tag.tag_ID)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button 
                                type="text" 
                                danger 
                                className="flex items-center justify-center w-8 h-8"
                                icon={<DeleteOutlined className="text-lg" />} 
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Helmet>
                <title>[ROS] | List Tags</title>
                <meta name="description" content={"Dream.mf [ROS] | List Tags Page"} />
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
                scroll={{ x: 'max-content' }}
                className="overflow-auto"
            />
        </div>
    );
};

export default TagsPage;
