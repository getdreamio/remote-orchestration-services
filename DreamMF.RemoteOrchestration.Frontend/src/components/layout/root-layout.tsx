import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Server, Database, Tag, BarChart, Shield, ToggleLeft, ScrollText } from 'lucide-react';
import { ThemeToggle } from '../theme/theme-toggle';
import { UserMenu } from '../user/user-menu';
import { Breadcrumb } from '../navigation/breadcrumb';
import { useTheme } from '../theme/theme-provider';
import ErrorBoundary from '../error/error-boundary';

const RootLayout = () => {
    const { theme } = useTheme();

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">
                <div className="flex">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex h-screen w-[336px] flex-col fixed left-0 top-0 border-r bg-card">
                        <div className="p-6">
                            <div className="flex items-center gap-2">
                                <div className={theme === 'dark' ? 'bg-white rounded-full p-1' : ''}>
                                    <img src="/favicon-32x32.png" alt="Dream.MF Logo" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold leading-tight">Dream.MF</h2>
                                    <p className="text-xs text-muted-foreground">Remote Orchestration Services</p>
                                </div>
                            </div>
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
                                to="/remotes"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                            >
                                <Database className="h-5 w-5" />
                                <span>Remotes</span>
                            </Link>
                            <Link
                                to="/tags"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                            >
                                <Tag className="h-5 w-5" />
                                <span>Tagging</span>
                            </Link>
                            <hr className="my-2 border-border" />
                            <div
                                className="flex items-center space-x-3 p-2 rounded-lg text-muted-foreground cursor-not-allowed"
                                title="Coming in 1.1"
                            >
                                <Shield className="h-5 w-5" />
                                <span>Access Control</span>
                            </div>
                            <div
                                className="flex items-center space-x-3 p-2 rounded-lg text-muted-foreground cursor-not-allowed"
                                title="Coming in 1.1"
                            >
                                <ToggleLeft className="h-5 w-5" />
                                <span>Feature Toggles</span>
                            </div>
                            <div
                                className="flex items-center space-x-3 p-2 rounded-lg text-muted-foreground cursor-not-allowed"
                                title="Coming in 1.1"
                            >
                                <ScrollText className="h-5 w-5" />
                                <span>Logging</span>
                            </div>
                            <hr className="my-2 border-border" />
                            <div
                                className="flex items-center space-x-3 p-2 rounded-lg text-muted-foreground cursor-not-allowed"
                                title="Coming in 1.1"
                            >
                                <BarChart className="h-5 w-5" />
                                <span>Analytics</span>
                            </div>
                            <div
                                className="flex items-center space-x-3 p-2 rounded-lg text-muted-foreground cursor-not-allowed"
                                title="Coming in 1.1"
                            >
                                <Users className="h-5 w-5" />
                                <span>User Management</span>
                            </div>
                            <Link
                                to="/settings"
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent"
                            >
                                <Settings className="h-5 w-5" />
                                <span>Settings</span>
                            </Link>
                        </nav>
                        <div className="p-4 text-xs text-muted-foreground border-t">
                            2025 Dream.MF - All rights reserved.
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 lg:ml-[336px]">
                        {/* Header */}
                        <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                            <Breadcrumb />
                            <div className="flex items-center space-x-4">
                                <UserMenu />
                                <ThemeToggle />
                            </div>
                        </header>
                        {/* Page Content */}
                        <main className="p-6">
                            <ErrorBoundary>
                                <Outlet />
                            </ErrorBoundary>
                        </main>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default RootLayout;