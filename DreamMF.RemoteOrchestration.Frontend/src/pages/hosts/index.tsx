import { Suspense } from 'react';
import { HostCard } from '@/components/hosts/host-card';
import { HostSkeleton } from '@/components/hosts/host-skeleton';
import { useHosts } from '@/hooks/useHosts';

const HostsList = () => {
    const { data: hosts } = useHosts();

    return (
        <div className="grid gap-4">
            {hosts.map((host) => (
                <HostCard key={host.id} host={host} />
            ))}
        </div>
    );
};

const HostsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Hosts</h1>
            </div>

            <Suspense fallback={<HostSkeleton />}>
                <HostsList />
            </Suspense>
        </div>
    );
};

export default HostsPage;