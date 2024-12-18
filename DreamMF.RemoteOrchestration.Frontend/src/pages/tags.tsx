import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import { formatDate } from '@/utils/date-utils';

interface Tag {
  id: number;
  key: string;
  created_Date?: string;
  updated_Date?: string;
}

const TagsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();

  const { data: tags, isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    form.setFieldsValue(tag);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTagMutation.mutateAsync(id);
      message.success('Tag deleted successfully');
    } catch (error) {
      message.error('Failed to delete tag');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingTag) {
        await updateTagMutation.mutateAsync({ id: editingTag.id, ...values });
        message.success('Tag updated successfully');
      } else {
        await createTagMutation.mutateAsync(values);
        message.success('Tag created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save tag');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Created Date',
      dataIndex: 'created_Date',
      key: 'created_Date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Updated Date',
      dataIndex: 'updated_Date',
      key: 'updated_Date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tag) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Tags"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Tag
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingTag ? 'Edit Tag' : 'Add Tag'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createTagMutation.isPending || updateTagMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="key"
            label="Key"
            rules={[{ required: true, message: 'Please input tag key!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagsPage;
