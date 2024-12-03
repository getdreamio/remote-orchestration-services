export interface Host {
    id: string;
    name: string;
    status: 'online' | 'offline';
    applicationKey: string;
    remotes: string[];
    storage: string;
    tags: string[];
}
