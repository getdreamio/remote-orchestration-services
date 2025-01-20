import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from './theme-provider';

export function AntThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme: appTheme } = useTheme();
    
    return (
        <ConfigProvider
            theme={{
                algorithm: appTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#0284c7', // sky-600
                    borderRadius: 6,
                    colorBgContainer: appTheme === 'dark' ? '#1e293b' : '#ffffff', // slate-800 : white
                    colorBgElevated: appTheme === 'dark' ? '#334155' : '#ffffff', // slate-700 : white
                    colorBorder: appTheme === 'dark' ? '#475569' : '#e2e8f0', // slate-600 : slate-200
                    colorText: appTheme === 'dark' ? '#e2e8f0' : '#1e293b', // slate-200 : slate-800
                    colorTextSecondary: appTheme === 'dark' ? '#94a3b8' : '#64748b', // slate-400 : slate-500
                },
                components: {
                    Table: {
                        colorBgContainer: appTheme === 'dark' ? '#1e293b' : '#ffffff',
                        headerBg: appTheme === 'dark' ? '#334155' : '#f8fafc',
                        rowHoverBg: appTheme === 'dark' ? '#334155' : '#f1f5f9',
                        headerSplitColor: appTheme === 'dark' ? '#475569' : '#e2e8f0',
                    },
                    Card: {
                        colorBgContainer: appTheme === 'dark' ? '#1e293b' : '#ffffff',
                    },
                    Select: {
                        colorBgContainer: appTheme === 'dark' ? '#1e293b' : '#ffffff',
                        colorBgElevated: appTheme === 'dark' ? '#334155' : '#ffffff',
                        controlItemBgHover: appTheme === 'dark' ? '#475569' : '#f1f5f9',
                    },
                    Input: {
                        colorBgContainer: appTheme === 'dark' ? '#1e293b' : '#ffffff',
                        colorBorder: appTheme === 'dark' ? '#475569' : '#e2e8f0',
                    }
                }
            }}
        >
            {children}
        </ConfigProvider>
    );
}
