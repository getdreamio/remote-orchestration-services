import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/layout/root-layout';

// Pages
import DashboardPage from './pages/index';
import HostsPage from './pages/hosts';
import EditHostPage from './pages/hosts/edit';
import NewHostPage from './pages/hosts/new';
import RemotesPage from './pages/remotes';
import EditRemotePage from './pages/remotes/edit';
import NewRemotePage from './pages/remotes/new';
import TagsPage from './pages/tags';
import EditTagPage from './pages/tags/edit';
import NewTagPage from './pages/tags/new';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                path: '/',
                element: <DashboardPage />,
            },
            {
                path: '/hosts',
                element: <HostsPage />,
            },
            {
                path: '/hosts/new',
                element: <NewHostPage />,
            },
            {
                path: '/hosts/:id/edit',
                element: <EditHostPage />,
            },
            {
                path: '/remotes',
                element: <RemotesPage />,
            },
            {
                path: '/remotes/new',
                element: <NewRemotePage />,
            },
            {
                path: '/remotes/:id/edit',
                element: <EditRemotePage />,
            },
            {
                path: '/tags',
                element: <TagsPage />,
            },
            {
                path: '/tags/new',
                element: <NewTagPage />,
            },
            {
                path: '/tags/:id/edit',
                element: <EditTagPage />,
            },
        ],
    },
]);
