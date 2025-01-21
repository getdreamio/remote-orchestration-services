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
// import ForgotPasswordPage from './pages/auth/forgot-password';
// import ResetPasswordPage from './pages/auth/reset-password';
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
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
                errorElement: <ErrorDisplay message="Error loading dashboard" />,
            },
            {
                path: 'remotes',
                element: <ProtectedRoute><RemotesPage /></ProtectedRoute>,
            },
            {
                path: 'remotes/new',
                element: <ProtectedRoute><NewRemotePage /></ProtectedRoute>,
            },
            {
                path: 'remotes/:id',
                element: <ProtectedRoute><EditRemotePage /></ProtectedRoute>,
            },
            {
                path: 'hosts',
                element: <ProtectedRoute><HostsPage /></ProtectedRoute>,
            },
            {
                path: 'hosts/new',
                element: <ProtectedRoute><NewHostPage /></ProtectedRoute>,
            },
            {
                path: 'hosts/:id',
                element: <ProtectedRoute><EditHostPage /></ProtectedRoute>,
            },
            {
                path: 'tags',
                element: <ProtectedRoute><TagsPage /></ProtectedRoute>,
                errorElement: <ErrorDisplay message="Error loading tags" />,
            },
            {
                path: 'tags/new',
                element: <ProtectedRoute><NewTagPage /></ProtectedRoute>,
            },
            {
                path: 'tags/:id',
                element: <ProtectedRoute><EditTagPage /></ProtectedRoute>,
            },
            {
                path: 'users',
                element: <ProtectedRoute><UsersPage /></ProtectedRoute>,
                errorElement: <ErrorDisplay message="Error loading users" />,
            },
            {
                path: 'users/new',
                element: <ProtectedRoute><NewUserPage /></ProtectedRoute>,
                errorElement: <ErrorDisplay message="Error creating user" />,
            },
            {
                path: 'users/:id',
                element: <ProtectedRoute><EditUserPage /></ProtectedRoute>,
                errorElement: <ErrorDisplay message="Error editing user" />,
            },
            {
                path: 'settings',
                element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
            },
            {
                path: 'analytics',
                element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>,
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
