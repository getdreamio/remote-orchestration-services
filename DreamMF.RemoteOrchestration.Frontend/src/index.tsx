import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { worker } from './mocks/browser';
import { AuthProvider } from './components/auth/auth-provider';


if (process.env.NODE_ENV === 'development') {
    worker.start();
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
    </AuthProvider>
);