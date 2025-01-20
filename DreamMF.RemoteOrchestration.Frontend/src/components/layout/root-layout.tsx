import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, Server, Database, Tag, BarChart, Shield, ToggleLeft, ScrollText, Network, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../theme/theme-toggle';
import { UserMenu } from '../user/user-menu';
import { Breadcrumb } from '../navigation/breadcrumb';
import { useTheme } from '../theme/theme-provider';
import ErrorBoundary from '../error/error-boundary';
import { useState } from 'react';

const RootLayout = () => {
    const { theme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">
                <div className="flex">
                    {/* Sidebar */}
                    <aside 
                        className={`hidden lg:flex h-screen flex-col fixed left-0 top-0 border-r transition-all duration-300 ${isCollapsed ? 'w-[80px]' : 'w-[336px]'} overflow-hidden bg-[#fbfbfb] dark:bg-card`}
                    >
                        {/* Header - Fixed */}
                        <div className="flex-none p-6 border-b relative">
                            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                                <div className={`${theme === 'dark' ? 'bg-white rounded-full p-1' : ''} flex-shrink-0`}>
                                    <img src="/favicon-32x32.png" alt="Dream.MF Logo" className="w-6 h-6" />
                                </div>
                                <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                    <h2 className="text-lg leading-tight whitespace-nowrap">Dream.MF [ROS]</h2>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">Remote Orchestration Services</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted/50"
                            >
                                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </button>
                        </div>
                        {/* Navigation - Scrollable */}
                        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
                            <Link
                                to="/"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <LayoutDashboard className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Dashboard</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Summary of organization</span>
                                </div>
                            </Link>
                            <Link
                                to="/hosts"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Server className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Hosts</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Your web applications</span>
                                </div>
                            </Link>
                            <Link
                                to="/remotes"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Database className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Remotes</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Remote module configuration</span>
                                </div>
                            </Link>
                            <Link
                                to="/tags"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Tag className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Tagging</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Metadata about hosts and remotes</span>
                                </div>
                            </Link>
                            <Link
                                to="/search"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Search className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Search</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Find hosts and remotes by text</span>
                                </div>
                            </Link>
                            <Link
                                to="/relationships"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Network className="h-5 w-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Relationships</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">How all hosts and remotes are related</span>
                                </div>
                            </Link>
                            <hr className="my-2 border-border" />
                            <div
                                className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Shield className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Access Control</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Permissions for using remotes</span>
                                </div>
                            </div>
                            <div
                                className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <ToggleLeft className="h-5 w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Feature Toggles</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Enable/Disable remote features</span>
                                </div>
                            </div>
                            <div
                                className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-not-allowed opacity-50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <ScrollText className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Logging</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">See info and errors within your modules</span>
                                </div>
                            </div>
                            <hr className="my-2 border-border" />
                            <Link
                                to="/analytics"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <BarChart className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Usage & Analytics</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Usage and activity for hosts and remotes</span>
                                </div>
                            </Link>
                            <Link
                                to="/users"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Users className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>User Management</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">User access and permissions within ROS</span>
                                </div>
                            </Link>
                            <Link
                                to="/settings"
                                className={`group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 relative ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute left-full ml-2 bg-popover px-3 py-2 rounded-md shadow-md invisible group-hover:visible whitespace-nowrap' : 'opacity-100'}`}>
                                    <span>Configuration</span>
                                    <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">Storage and database settings</span>
                                </div>
                            </Link>
                        </nav>
                        {/* Footer - Fixed */}
                        <div className={`flex-none p-4 text-xs text-muted-foreground border-t transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            2025 Dream.MF - All rights reserved.
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[336px]'}`}>
                        {/* Header */}
                        <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                                <Breadcrumb />
                                <div className="flex items-center space-x-4">
                                    <UserMenu />
                                    <Link
                                        to="/search"
                                        className="p-2 hover:bg-muted rounded-md transition-colors"
                                        title="Search"
                                    >
                                        <Search className="h-5 w-5 text-muted-foreground" />
                                    </Link>
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