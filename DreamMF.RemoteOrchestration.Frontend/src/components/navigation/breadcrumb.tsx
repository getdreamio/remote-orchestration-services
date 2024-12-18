import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
    '': 'Dashboard',
    'hosts': 'Hosts',
    'remotes': 'Remotes',
    'tags': 'Tags',
    'users': 'Users',
    'settings': 'Settings',
    'analytics': 'Analytics',
};

export function Breadcrumb() {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center space-x-2">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
            </Link>
            {pathSegments.length > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const isLast = index === pathSegments.length - 1;
                const label = routeLabels[segment] || segment;

                return (
                    <div key={path} className="flex items-center">
                        <Link
                            to={path}
                            className={`${
                                isLast
                                    ? 'font-semibold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {label}
                        </Link>
                        {!isLast && (
                            <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
