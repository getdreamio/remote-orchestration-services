import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/env';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

interface HostRelationship {
    hostId: string;
    name: string;
    environment?: string;
    connectedRemoteIds: string[];
}

interface RemoteRelationship {
    remoteId: string;
    name: string;
    key?: string;
    connectedHostIds: string[];
}

interface RelationshipsData {
    hosts: HostRelationship[];
    remotes: RemoteRelationship[];
}

const fetchRelationships = async (): Promise<RelationshipsData> => {
    const response = await fetchWithAuth(`${config.backendUrl}/api/analytics/relationships`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return {
        hosts: data.hosts.map((host: any) => ({
            hostId: host.hostId,
            name: host.name,
            environment: host.environment,
            connectedRemoteIds: host.connectedRemoteIds
        })),
        remotes: data.remotes.map((remote: any) => ({
            remoteId: remote.remoteId,
            name: remote.name,
            key: remote.key,
            connectedHostIds: remote.connectedHostIds
        }))
    };
};

export const useRelationships = () => {
    return useQuery<RelationshipsData>({
        queryKey: ['relationships'],
        queryFn: fetchRelationships
    });
};
