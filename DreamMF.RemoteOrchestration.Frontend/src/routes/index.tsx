import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/components/layout/root-layout';
import HostsPage from '@/pages/hosts';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <HostsPage />
            },
            {
                path: 'users',
                element: <div>Users Page</div>
            },
            {
                path: 'settings',
                element: <div>Settings Page</div>
            }
        ]
    }
]);