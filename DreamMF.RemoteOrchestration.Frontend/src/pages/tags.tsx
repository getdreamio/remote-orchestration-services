import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import { formatDate } from '@/utils/date-utils';

interface Tag {
  tag_ID: number;
  key: string;
  value: string;
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
        await updateTagMutation.mutateAsync({ id: editingTag.tag_ID, ...values });
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
      dataIndex: 'tag_ID',
      key: 'tag_ID',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
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
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.tag_ID)}
          />
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Tag
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="tag_ID"
        loading={isLoading}
      />

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
          <Form.Item
            name="value"
            label="Value"
            rules={[{ required: true, message: 'Please input tag value!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagsPage;
