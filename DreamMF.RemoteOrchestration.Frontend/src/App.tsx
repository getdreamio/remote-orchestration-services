import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/globals.css';
import { ThemeProvider } from './components/theme/theme-provider';
import { AntThemeProvider } from './components/theme/ant-theme-provider';

const App = () => {
    return (
        <ThemeProvider>
            <AntThemeProvider>
                <RouterProvider router={router} />
            </AntThemeProvider>
        </ThemeProvider>
    );
};

export default App;