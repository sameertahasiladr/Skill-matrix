// middleware/auth.global.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Define public routes
  const publicRoutes = ['/auth/sign-in', '/auth/forgot-password', '/auth/set-password', '/auth/login'];
  if (publicRoutes.includes(to.path)) {
    return; // Allow access to public routes
  }

  // Initialize auth state
  await authStore.initializeAuth();

  // Get tokens
  const refreshToken = authStore.refreshToken || localStorage.getItem('refreshToken');
  const accessToken = authStore.access_token || localStorage.getItem('accessToken');

  if (!refreshToken || !accessToken) {
    console.log('No tokens found. Redirecting to sign-in.');
    return navigateTo('/auth/sign-in');
  }

  try {
    const isValidToken = await validateRefreshToken(refreshToken);
    if (!isValidToken) {
      console.log('Invalid refresh token. Logging out and redirecting to sign-in.');
      authStore.logout();
      return navigateTo('/auth/sign-in');
    }

    const userRole = authStore.user?.role || localStorage.getItem('role');
    const routePermissions = {
      'user': ['/', '/skill-matrix'],
      'admin': ['/', '/skill-matrix', '/excel-upload', '/edit-skillmatrix', '/job-status']
    };

    for (const [role, allowedPaths] of Object.entries(routePermissions)) {
      if (userRole === role) {
        if (!allowedPaths.includes(to.path)) {
          console.log(`User with role ${role} attempted to access unauthorized path: ${to.path}. Redirecting to dashboard.`);
          return navigateTo('/');
        }
        console.log(`Access granted to ${to.path} for role ${role}`);
        return; // Allow access if path is permitted
      }
    }

    console.log('Unrecognized role. Logging out and redirecting to sign-in.');
    authStore.logout();
    return navigateTo('/auth/sign-in');
  } catch (error) {
    console.error('Token validation error:', error);
    authStore.logout();
    return navigateTo('/auth/sign-in');
  }
});

async function validateRefreshToken(token) {
  try {
    const response = await $fetch('http://localhost:4000/auth/validate-token', {
      method: 'POST',
      body: { refreshToken: token },
      headers: { 'Content-Type': 'application/json' },
    });
    return response.valid;
  } catch (error) {
    console.error('Refresh token validation failed:', error);
    return false;
  }
}