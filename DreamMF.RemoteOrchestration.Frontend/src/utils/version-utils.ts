interface Version {
    major: number;
    minor: number;
    patch: number;
}

export const requireUpdate = (current: string, latest: string): boolean => {
    const parseVersion = (versionString: string): Version => {
        // Split version string into major, minor, patch components
        const parts = versionString.split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    };

    // Parse both versions
    const currentVer = parseVersion(current);
    const latestVer = parseVersion(latest);

    // Check if the latest version is greater than the current version
    if (latestVer.major > currentVer.major || 
        (latestVer.major === currentVer.major && latestVer.minor > currentVer.minor) || 
        (latestVer.major === currentVer.major && latestVer.minor === currentVer.minor && latestVer.patch > currentVer.patch)) {
        return true;
    }

    // If none of the components are greater, no update needed
    return false;
}


export default {
    requireUpdate
};
