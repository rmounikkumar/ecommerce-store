let refreshing = null;

async function refreshSession() {
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(res => res.json())
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/otp/request',
  '/auth/otp/verify',
  '/auth/refresh'
];

export async function api(path, { method = 'GET', body } = {}) {
  const doFetch = () =>
    fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

  let res = await doFetch();
  if (res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
    await refreshSession();
    res = await doFetch();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong.');
    err.status = res.status;
    if (res.status === 401 && !NO_REFRESH_PATHS.includes(path)) {
      window.dispatchEvent(new CustomEvent('shopeasy:unauthorized'));
    }
    throw err;
  }
  return data;
}
