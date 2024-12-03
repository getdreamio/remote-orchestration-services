import { http, HttpResponse } from 'msw';
import type { Host } from '@/types/host';

const mockHosts: Host[] = [
    {
        id: '1',
        name: 'Production Server',
        status: 'online',
        applicationKey: 'prod-key-123',
        remotes: ['remote-1', 'remote-2'],
        storage: 'Standard',
        tags: ['production', 'primary']
    },
    {
        id: '2',
        name: 'Staging Server',
        status: 'online',
        applicationKey: 'stage-key-456',
        remotes: ['remote-3'],
        storage: 'Premium',
        tags: ['staging']
    }
];

export const handlers = [
    http.get('/api/hosts', async () => {
        return HttpResponse.json(mockHosts, { status: 200 });
    })
];