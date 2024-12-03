import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Server } from 'lucide-react';

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold">Dashboard</h2>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <Link
                            to="/"
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/hosts"
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                        >
                            <Server className="h-5 w-5" />
                            <span>Hosts</span>
                        </Link>
                        <Link
                            to="/users"
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                        >
                            <Users className="h-5 w-5" />
                            <span>Users</span>
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                        >
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 lg:ml-64">
                    {/* Header */}
                    <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                        <h1 className="text-lg font-semibold">Welcome Back</h1>
                    </header>

                    {/* Page Content */}
                    <main className="p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default RootLayout;