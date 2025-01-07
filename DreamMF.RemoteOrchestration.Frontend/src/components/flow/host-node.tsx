import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tag } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const HostNode = ({ data }: { data: any }) => {
    return (
        <div className="px-4 py-2 shadow-lg rounded-md bg-white border-2 border-purple-600 dark:bg-gray-800 dark:border-purple-500">
            <Handle type="source" position={Position.Bottom} className="!bg-purple-600" />
            <div className="flex flex-col items-center gap-2">
                <div className="font-semibold text-purple-600 dark:text-purple-400">{data.label}</div>
                {data.environment && (
                    <Tag color="blue" className="dark:bg-blue-900 dark:text-blue-100">
                        <EnvironmentOutlined /> {data.environment}
                    </Tag>
                )}
            </div>
        </div>
    );
};

export default memo(HostNode);
