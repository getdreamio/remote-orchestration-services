import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/globals.css';
import { ThemeProvider } from './components/theme/theme-provider';
import { AntThemeProvider } from './components/theme/ant-theme-provider';

const App = () => {
    return (
        <ThemeProvider defaultTheme="light" storageKey="dream-mf-theme">
            <AntThemeProvider>
                <RouterProvider router={router} />
            </AntThemeProvider>
        </ThemeProvider>
    );
};

export default App;