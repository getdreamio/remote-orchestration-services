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
import NewUserPage from './pages/users/new';
import EditUserPage from './pages/users/edit';
import SettingsPage from './pages/settings';
import AnalyticsPage from './pages/analytics';
import NotFoundPage from './pages/not-found';
import LoginPage from './pages/auth/login';
import LogoutPage from './pages/auth/logout';
import RegisterPage from './pages/auth/register';
import ForgotPasswordPage from './pages/auth/forgot-password';
import ResetPasswordPage from './pages/auth/reset-password';
import TagsPage from './pages/tags/index';
import ErrorDisplay from './components/error/error-display';
import EditTagPage from './pages/tags/edit';
import NewTagPage from './pages/tags/new';
import SearchPage from './pages/search';
import RelationshipsPage from './pages/relationships';
import { ProtectedRoute } from './components/auth/protected-route';

export const router = createBrowserRouter([
    {
        path: '/auth/login',
        element: <LoginPage />,
        errorElement: <ErrorDisplay message="Error loading login page" />,
    },
    {
        path: '/auth/logout',
        element: <LogoutPage />,
        errorElement: <ErrorDisplay message="Error during logout" />,
    },
    {
        path: '/auth/register',
        element: <RegisterPage />,
        errorElement: <ErrorDisplay message="Error during registration" />,
      },
    //   {
    //     path: '/auth/forgot-password',
    //     element: <ForgotPasswordPage />,
    //     errorElement: <ErrorDisplay message="Error during forgot password" />,
    //   },
    //   {
    //     path: '/auth/reset-password',
    //     element: <ResetPasswordPage />,
    //     errorElement: <ErrorDisplay message="Error during reset password" />,
    //   },
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
                errorElement: <ErrorDisplay message="Error loading users" />,
            },
            {
                path: 'users/new',
                element: <NewUserPage />,
                errorElement: <ErrorDisplay message="Error creating user" />,
            },
            {
                path: 'users/:id/edit',
                element: <EditUserPage />,
                errorElement: <ErrorDisplay message="Error editing user" />,
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
                path: 'search',
                element: (
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'relationships',
                element: (
                    <ProtectedRoute>
                        <RelationshipsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);
