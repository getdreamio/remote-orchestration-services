import React from 'react';
import { useVersionCheck } from '../hooks/useVersionCheck';
import { CloseOutlined } from '@ant-design/icons';

export const VersionAlert: React.FC = () => {
  const { versionInfo, isDismissed, needsUpdate, dismissAlert } = useVersionCheck();

  if (!versionInfo || !needsUpdate || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Update Available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Version {versionInfo.version} is now available
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Released on {new Date(versionInfo.date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={dismissAlert}
          className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <CloseOutlined style={{ fontSize: '16px' }} />
        </button>
      </div>
    </div>
  );
};
