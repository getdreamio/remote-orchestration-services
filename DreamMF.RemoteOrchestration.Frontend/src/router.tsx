import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/layout/root-layout';
import DashboardPage from './pages/index';
import RemotesPage from './pages/remotes/index';
import NewRemotePage from './pages/remotes/new';
import EditRemotePage from './pages/remotes/edit';
import HostsPage from './pages/hosts/index';
import NewHostPage from './pages/hosts/new';
import EditHostPage from './pages/hosts/edit';
import UsersPage from './pages/users/index';
import SettingsPage from './pages/settings';
import AnalyticsPage from './pages/analytics';
import NotFoundPage from './pages/not-found';
import LoginPage from './pages/auth/login';
import LogoutPage from './pages/auth/logout';
import TagsPage from './pages/tags/index';
import ErrorDisplay from './components/error/error-display';
import EditTagPage from './pages/tags/edit';
import NewTagPage from './pages/tags/new';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
        errorElement: <ErrorDisplay message="Error loading login page" />,
    },
    {
        path: '/logout',
        element: <LogoutPage />,
        errorElement: <ErrorDisplay message="Error during logout" />,
    },
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorDisplay message="An unexpected error occurred" />,
        children: [
            {
                path: '/',
                element: <DashboardPage />,
                errorElement: <ErrorDisplay message="Error loading dashboard" />,
            },
            {
                path: 'remotes',
                element: <RemotesPage />,
            },
            {
                path: 'remotes/new',
                element: <NewRemotePage />,
            },
            {
                path: 'remotes/:id',
                element: <EditRemotePage />,
            },
            {
                path: 'hosts',
                element: <HostsPage />,
            },
            {
                path: 'hosts/new',
                element: <NewHostPage />,
            },
            {
                path: 'hosts/:id',
                element: <EditHostPage />,
            },
            {
                path: 'tags',
                element: <TagsPage />,
                errorElement: <ErrorDisplay message="Error loading tags" />,
            },
            {
                path: 'tags/new',
                element: <NewTagPage />,
            },
            {
                path: 'tags/:id',
                element: <EditTagPage />,
            },
            {
                path: 'users',
                element: <UsersPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
            {
                path: 'analytics',
                element: <AnalyticsPage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);
