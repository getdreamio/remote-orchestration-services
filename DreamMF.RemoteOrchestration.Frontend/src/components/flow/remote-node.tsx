import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tag } from 'antd';
import { KeyOutlined } from '@ant-design/icons';

const RemoteNode = ({ data }: { data: any }) => {
    return (
        <div className="px-4 py-2 shadow-lg rounded-md bg-white border-2 border-orange-500 dark:bg-gray-800 dark:border-orange-400">
            <Handle type="target" position={Position.Top} className="!bg-orange-500" />
            <div className="flex flex-col items-center gap-2">
                <div className="font-semibold text-orange-600 dark:text-orange-400">{data.label}</div>
                {data.key && (
                    <Tag color="orange" className="dark:bg-orange-900/50 dark:text-orange-100">
                        <KeyOutlined /> {data.key}
                    </Tag>
                )}
            </div>
        </div>
    );
};

export default memo(RemoteNode);
