import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tag, Button } from 'antd';
import { KeyOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const RemoteNode = ({ data }: { data: any }) => {
    const navigate = useNavigate();

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent node selection/drag
        navigate(`/remotes/${data.id}/edit`);
    };

    return (
        <div className="px-4 py-2 shadow-lg rounded-md bg-white border-2 border-orange-500 dark:bg-gray-800 dark:border-orange-400">
            <Handle type="target" position={Position.Top} className="!bg-orange-500" />
            <div className="flex flex-col items-center gap-2">
                <div className="font-semibold text-orange-600 dark:text-orange-400">{data.label}</div>
                <div className="flex items-center gap-2">
                    {data.key && (
                        <Tag color="orange" className="dark:bg-orange-900/50 dark:text-orange-100">
                            <KeyOutlined /> {data.key}
                        </Tag>
                    )}
                    <Button 
                        type="text"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                        size="small"
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(RemoteNode);
