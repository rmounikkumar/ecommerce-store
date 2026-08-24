import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api/client';

const AUTH_CHANNEL = 'shopeasy-auth';

function normalizeStorefrontUser(rawUser) {
  return rawUser && rawUser.role !== 'admin' ? rawUser : null;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api('/auth/me');
        if (mounted) {
          setUser(data.user && data.user.role !== 'admin' ? data.user : null);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let channel = null;
    try {
      channel = new BroadcastChannel(AUTH_CHANNEL);
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'logout') {
          setUser(null);
        } else if (msg.type === 'login' || msg.type === 'profile') {
          setUser(normalizeStorefrontUser(msg.user));
        }
      };
    } catch {
      channel = null;
    }
    channelRef.current = channel;

    const onUnauthorized = () => setUser(null);
    window.addEventListener('shopeasy:unauthorized', onUnauthorized);

    return () => {
      window.removeEventListener('shopeasy:unauthorized', onUnauthorized);
      try {
        channel?.close();
      } catch {
        // ignore
      }
      channelRef.current = null;
    };
  }, []);

  const broadcastAuth = useCallback((message) => {
    try {
      channelRef.current?.postMessage(message);
    } catch {
      // ignore
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    setUser(data.user);
    broadcastAuth({ type: 'login', user: data.user });
  }, [broadcastAuth]);

  const login = useCallback(async ({ email, password }) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUser(data.user);
    broadcastAuth({ type: 'login', user: data.user });
    return data;
  }, [broadcastAuth]);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    broadcastAuth({ type: 'logout' });
  }, [broadcastAuth]);

  const requestOtp = useCallback(async (email) => {
    const data = await api('/auth/otp/request', { method: 'POST', body: { email } });
    return data;
  }, []);

  const verifyOtp = useCallback(async (email, code) => {
    const data = await api('/auth/otp/verify', { method: 'POST', body: { email, code } });
    setUser(data.user);
    broadcastAuth({ type: 'login', user: data.user });
    return data;
  }, [broadcastAuth]);

  const updateProfile = useCallback(async (fields) => {
    const data = await api('/users/me', { method: 'PATCH', body: fields });
    setUser(data.user);
    broadcastAuth({ type: 'profile', user: data.user });
  }, [broadcastAuth]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api('/users/me/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        requestOtp,
        verifyOtp,
        updateProfile,
        changePassword,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
