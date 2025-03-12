import React, { useState, useEffect } from 'react';
import { Input, Button, Table, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import notify from '../../utils/notifications';
import { useHostVariables, useCreateHostVariable, useUpdateHostVariable, useDeleteHostVariable } from '@/hooks/useHosts';

const { Text } = Typography;

interface ConfigItem {
  key: string;
  value: string;
  id: string | number; // Can be a string for new items or a number for existing items
  isNew?: boolean;
}

interface HostConfigFormProps {
  hostId: number;
  initialConfig?: ConfigItem[];
  onSuccess?: () => void;
}

const HostConfigForm: React.FC<HostConfigFormProps> = ({ 
  hostId, 
  initialConfig = [], 
  onSuccess 
}) => {
  const [configItems, setConfigItems] = useState<ConfigItem[]>(initialConfig);
  const [editingRow, setEditingRow] = useState<string | number | null>(null);
  const [visibleValues, setVisibleValues] = useState<Record<string | number, boolean>>({});
  
  // Fetch host variables
  const { data: hostVariables, isLoading } = useHostVariables(hostId);
  const createVariable = useCreateHostVariable();
  const updateVariable = useUpdateHostVariable();
  const deleteVariable = useDeleteHostVariable();

  // Update configItems when hostVariables are loaded
  useEffect(() => {
    if (hostVariables) {
      const mappedItems: ConfigItem[] = hostVariables.map(variable => ({
        key: variable.key,
        value: variable.value,
        id: variable.id
      }));
      setConfigItems(mappedItems);
    }
  }, [hostVariables]);

  const handleAddRow = () => {
    // Add a new empty row
    const newItem: ConfigItem = {
      key: '',
      value: '',
      id: `new-${Date.now()}`, // Generate a unique ID for new items
      isNew: true
    };

    setConfigItems([...configItems, newItem]);
    setEditingRow(newItem.id);
  };

  const handleSaveRow = async (id: string | number, newKey: string, newValue: string) => {
    // Validate key (no spaces allowed)
    if (newKey.includes(' ')) {
      notify.error('Spaces are not allowed in keys');
      return false;
    }

    // Check if key already exists in other rows
    if (configItems.some(item => item.id !== id && item.key === newKey)) {
      notify.error('This key already exists');
      return false;
    }

    if (!newKey) {
      notify.error('Key is required');
      return false;
    }

    try {
      const isNewItem = typeof id === 'string' && id.startsWith('new-');
      
      if (isNewItem) {
        // Create new variable
        await createVariable.mutateAsync({
          hostId,
          data: { key: newKey, value: newValue }
        });
      } else {
        // Update existing variable
        await updateVariable.mutateAsync({
          hostId,
          variableId: id as number,
          data: { key: newKey, value: newValue }
        });
      }
      
      setEditingRow(null);
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      notify.error('Failed to save configuration');
      return false;
    }
  };

  const handleDeleteConfig = async (id: string | number) => {
    try {
      // Only call the API if it's an existing item (not a new one)
      if (typeof id === 'number') {
        await deleteVariable.mutateAsync({
          hostId,
          variableId: id
        });
      }
      
      setConfigItems(configItems.filter(item => item.id !== id));
      notify.success('Configuration removed');
    } catch (error) {
      notify.error('Failed to delete configuration');
    }
  };

  const toggleValueVisibility = (id: string | number) => {
    setVisibleValues(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: '40%',
      render: (text: string, record: ConfigItem) => {
        const isEditing = editingRow === record.id;
        return isEditing ? (
          <Input 
            defaultValue={text} 
            id={`key-${record.id}`}
            onChange={(e) => {
              if (e.target.value.includes(' ')) {
                notify.error('Spaces are not allowed in keys');
              }
            }}
          />
        ) : (
          <span>{text || <em className="text-gray-400">Empty</em>}</span>
        );
      }
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '40%',
      render: (text: string, record: ConfigItem) => {
        const isEditing = editingRow === record.id;
        const isVisible = visibleValues[record.id];
        
        if (isEditing) {
          return <Input defaultValue={text} id={`value-${record.id}`} />;
        }
        
        return (
          <div className="flex items-center justify-between w-full">
            <div className="truncate flex-1">
              {isVisible ? text : text ? '••••••••••••' : <em className="text-gray-400">Empty</em>}
            </div>
            <div className="flex-shrink-0 ml-2">
              {text && (
                <Button
                  type="text"
                  size="small"
                  icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => toggleValueVisibility(record.id)}
                />
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_: any, record: ConfigItem) => {
        const isEditing = editingRow === record.id;
        return isEditing ? (
          <div className="space-x-2">
            <Button 
              type="primary" 
              size="small"
              icon={<SaveOutlined />}
              onClick={() => {
                const keyInput = document.getElementById(`key-${record.id}`) as HTMLInputElement;
                const valueInput = document.getElementById(`value-${record.id}`) as HTMLInputElement;
                if (keyInput && valueInput) {
                  handleSaveRow(record.id, keyInput.value, valueInput.value);
                }
              }}
            >
              Save
            </Button>
            <Button 
              size="small" 
              icon={<CloseOutlined />}
              onClick={() => {
                // If it's a new row with empty fields, remove it
                if (!record.key && !record.value) {
                  handleDeleteConfig(record.id);
                } else {
                  setEditingRow(null);
                }
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-x-2">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditingRow(record.id)}
            />
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteConfig(record.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <Text className="block text-gray-500 dark:text-gray-400 text-sm">
            Add key/value pairs to configure this host. Keys cannot contain spaces.
          </Text>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={configItems}
        rowKey="id"
        pagination={false}
        loading={isLoading}
        locale={{ emptyText: 'No configuration items yet' }}
      />
    </div>
  );
};

export default HostConfigForm;
