import { HostCard } from '@/components/hosts/host-card';
import { useHosts } from '@/hooks/useHosts';

const HostsPage = () => {
    const { data: hosts, isLoading, error } = useHosts();

    if (isLoading) {
        return <div>Loading hosts...</div>;
    }

    if (error) {
        return <div>Error loading hosts: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Hosts</h1>
            </div>

            <div className="grid gap-4">
                {hosts?.map((host) => (
                    <HostCard key={host.id} host={host} />
                ))}
            </div>
        </div>
    );
};

export default HostsPage;