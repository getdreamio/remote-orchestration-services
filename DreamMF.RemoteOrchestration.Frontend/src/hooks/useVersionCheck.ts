import { useState, useEffect } from 'react';
import { requireUpdate } from '../utils/version-utils';
import pkg from '../../package.json';

interface VersionInfo {
  version: string;
  date: string;
}

const LOCAL_STORAGE_KEY = 'version_alert_dismissed';

export const useVersionCheck = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Use the same base URL as other API calls
        const response = await fetch('https://www.getdream.io/ros_version.json');
        const data: VersionInfo = await response.json();
        const isNewer = requireUpdate(pkg.version, data.version);
        
        setVersionInfo(data);
        setNeedsUpdate(isNewer);

        // Check local storage for dismissed state
        const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
        setIsDismissed(!!dismissed);
      } catch (error) {
        console.error('Failed to check version:', error);
      }
    };

    // Only check version if user is logged in
    const auth = localStorage.getItem('auth_user');
    const isLoggedIn = !!auth;
    
    if (isLoggedIn) {
      checkVersion();
    }
  }, []);

  const dismissAlert = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  return {
    versionInfo,
    isDismissed,
    needsUpdate,
    dismissAlert,
  };
};
