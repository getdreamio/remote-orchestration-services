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

    // Check each version component in order (major, minor, patch)
    if (latestVer.major > currentVer.major) {
        return true;
    }
    if (latestVer.minor > currentVer.minor) {
        return true;
    }
    if (latestVer.patch > currentVer.patch) {
        return true;
    }

    // If none of the components are greater, no update needed
    return false;
}


export default {
    requireUpdate
};
