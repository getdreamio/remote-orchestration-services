import React from 'react';
import { AuthProvider as OidcProvider } from 'react-oidc-context';
import authConfig from '../../config/auth.config';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <OidcProvider {...authConfig}>
      {children}
    </OidcProvider>
  );
};
