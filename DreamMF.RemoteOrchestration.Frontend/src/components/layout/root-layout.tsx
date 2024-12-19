import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Server, Database, Tag, BarChart, Shield, ToggleLeft, ScrollText, Network } from 'lucide-react';
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
                        {/* Header - Fixed */}
                        <div className="flex-none p-6 border-b">
                            <div className="flex items-center gap-2">
                                <div className={theme === 'dark' ? 'bg-white rounded-full p-1' : ''}>
                                    <img src="/favicon-32x32.png" alt="Dream.MF Logo" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg leading-tight">Dream.MF [ROS]</h2>
                                    <p className="text-xs text-muted-foreground">Remote Orchestration Services</p>
                                </div>
                            </div>
                        </div>
                        {/* Navigation - Scrollable */}
                        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                            <Link
                                to="/"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                            >
                                <LayoutDashboard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div className="flex flex-col">
                                    <span>Dashboard</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Summary of organization</span>
                                </div>
                            </Link>
                            <Link
                                to="/hosts"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                            >
                                <Server className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                <div className="flex flex-col">
                                    <span>Hosts</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Your web applications</span>
                                </div>
                            </Link>
                            <Link
                                to="/remotes"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                            >
                                <Database className="h-5 w-5 text-green-500 dark:text-green-400" />
                                <div className="flex flex-col">
                                    <span>Remotes</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Your federated modules</span>
                                </div>
                            </Link>
                            <Link
                                to="/tags"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                            >
                                <Tag className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                <div className="flex flex-col">
                                    <span>Tagging</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Metadata about hosts and remotes</span>
                                </div>
                            </Link>
                            <div
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50"
                            >
                                <Network className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                                <div className="flex flex-col">
                                    <span>Relationships</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">How all hosts and remotes are related</span>
                                </div>
                            </div>
                            <hr className="my-2 border-border" />
                            <div
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50"
                            >
                                <Shield className="h-5 w-5 text-red-500 dark:text-red-400" />
                                <div className="flex flex-col">
                                    <span>Access Control</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Permissions for using remotes</span>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50"
                            >
                                <ToggleLeft className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                <div className="flex flex-col">
                                    <span>Feature Toggles</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Enable/Disable remote features</span>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50"
                            >
                                <ScrollText className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                <div className="flex flex-col">
                                    <span>Logging</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">See info and errors within your modules</span>
                                </div>
                            </div>
                            <hr className="my-2 border-border" />
                            <div
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50"
                            >
                                <BarChart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                <div className="flex flex-col">
                                    <span>Usage & Analytics</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Usage and activity for hosts and remotes</span>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50"
                            >
                                <Users className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                                <div className="flex flex-col">
                                    <span>User Management</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">User access and permissions within ROS</span>
                                </div>
                            </div>
                            <Link
                                to="/settings"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                            >
                                <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div className="flex flex-col">
                                    <span>Configuration</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Storage and database settings</span>
                                </div>
                            </Link>
                        </nav>
                        {/* Footer - Fixed */}
                        <div className="flex-none p-4 text-xs text-muted-foreground border-t">
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