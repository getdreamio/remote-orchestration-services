import { AuthProviderProps } from "react-oidc-context";
import { config } from '@/config/env';

const authConfig: AuthProviderProps = {
  authority: config.authAuthority || "http://localhost:4000",
  client_id: config.authClientId || "dreammf_web",
  redirect_uri: window.location.origin + "/auth/callback",
  scope: "openid profile email api",
  loadUserInfo: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export default authConfig;
