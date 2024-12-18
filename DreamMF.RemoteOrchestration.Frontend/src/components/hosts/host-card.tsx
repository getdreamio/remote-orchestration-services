import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Server, Key, HardDrive, Tag, Globe, GitBranch, FileText, User } from 'lucide-react';

interface Host {
    id: string;
    name: string;
    status: 'online' | 'offline';
    applicationKey: string;
    remotes: string[];
    storage: string;
    tags: string[];
    url: string;
    repository?: string;
    documentationUrl?: string;
    contactName?: string;
    contactEmail?: string;
}

interface HostCardProps {
    host: Host;
}

export const HostCard = ({ host }: HostCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="w-full bg-gray-50 dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center">
                        <h3 className="text-lg font-medium">{host.name}</h3>
                        <Badge
                            variant={host.status === 'online' ? 'default' : 'destructive'}
                            className="ml-2"
                        >
                            {host.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center space-x-2 ml-auto">
                    <Button variant="outline" size="sm">
                        Attach...
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0 pb-4">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Application Key:</span>
                            <code className="rounded bg-muted px-2.5 py-1.5 font-mono text-sm">
                                {host.applicationKey}
                            </code>
                        </div>
                        <div className="border-t my-4" />
                        <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                                <HardDrive className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">Storage:</span>
                                <span className="text-sm">{host.storage}</span>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <h4 className="text-sm font-medium">Remotes:</h4>
                                <ul className="list-disc space-y-2 pl-6">
                                    {host.remotes.map((remote) => (
                                        <li key={remote} className="text-sm text-muted-foreground">{remote}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <a href={host.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                                        {host.url}
                                    </a>
                                </div>
                                {host.repository && (
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                                        <a href={host.repository} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                                            Repository
                                        </a>
                                    </div>
                                )}
                                {host.documentationUrl && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <a href={host.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                                            Documentation
                                        </a>
                                    </div>
                                )}
                                {(host.contactName || host.contactEmail) && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {host.contactName}
                                            {host.contactEmail && (
                                                <a href={`mailto:${host.contactEmail}`} className="ml-1 hover:underline">
                                                    ({host.contactEmail})
                                                </a>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
