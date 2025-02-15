import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from './components/theme/theme-provider';
import { AntThemeProvider } from './components/theme/ant-theme-provider';
import { loadDreamConfig } from './utils/api';
import { VersionAlert } from './components/VersionAlert';

import './styles/globals.css';
import './styles/notifications.css';

const App = () => {
    useEffect(() => {
        loadDreamConfig();
    }, []);
    return (
        <ThemeProvider>
            <AntThemeProvider>
                <RouterProvider router={router} />
                <VersionAlert />
            </AntThemeProvider>
        </ThemeProvider>
    );
};

export default App;