import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, // User object with id (cci_id), role, and firstName
    access_token: null, // JWT access token
    refreshToken: null, // JWT refresh token
  }),

  getters: {
    isAuthenticated: (state) => !!state.access_token,
    getUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    setUserAndTokens(cci_id, access_token, refreshToken, role, firstName) {
      if (!cci_id || !access_token) {
        console.error("Invalid user data provided for authentication.");
        return;
      }

      try {
        console.log("Setting user and tokens in auth store...");
        this.user = { 
          id: cci_id, // Use cci_id as the id
          role: role || "user", 
          firstName: firstName || "User"
        };
        this.access_token = access_token;
        this.refreshToken = refreshToken;

        if (process.client) {
          localStorage.setItem("user", JSON.stringify(this.user));
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("refreshToken", refreshToken || "");
          localStorage.setItem("role", role || "user");
          localStorage.setItem("cci_id", cci_id); // Store cci_id separately for consistency
        }

        console.log("User and tokens successfully set:", {
          cci_id,
          access_token,
          refreshToken,
          role,
          firstName,
        });
      } catch (error) {
        console.error("Error setting user and tokens:", error);
      }
    },

    logout() {
      try {
        console.log("Logging out user...");
        this.user = null;
        this.access_token = null;
        this.refreshToken = null;

        if (process.client) {
          console.log("Clearing localStorage...");
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("cci_id");
          console.log("localStorage after clearing:", localStorage);

          const nuxtApp = useNuxtApp();
          if (nuxtApp.$router) {
            console.log("Redirecting to /auth/sign-in using Nuxt router...");
            nuxtApp.$router.push("/auth/sign-in");
          } else {
            console.warn("Nuxt router not available, falling back to window.location...");
            window.location.href = "/auth/sign-in";
          }
        }

        console.log("User successfully logged out and redirected to /auth/sign-in.");
      } catch (error) {
        console.error("Error during logout:", error);
        if (process.client) {
          window.location.href = "/auth/sign-in";
        }
      }
    },

    async initializeAuth() {
      try {
        if (process.client) {
          const storedUser = localStorage.getItem("user");
          const storedAccessToken = localStorage.getItem("accessToken");
          const storedRefreshToken = localStorage.getItem("refreshToken");
          const storedRole = localStorage.getItem("role");
          const storedCciId = localStorage.getItem("cci_id");

          if (storedUser && storedAccessToken && storedCciId) {
            this.user = JSON.parse(storedUser);
            this.access_token = storedAccessToken;
            this.refreshToken = storedRefreshToken || null;

            // Ensure consistency with stored cci_id
            if (this.user.id !== storedCciId) {
              this.user.id = storedCciId; // Override id with cci_id if mismatched
            }

            if (storedRole && !this.user.role) {
              this.user.role = storedRole;
            }

            if (!this.user.firstName) {
              this.user.firstName = "User";
            }

            console.log("Auth data initialized from localStorage:", {
              user: this.user,
              accessToken: this.access_token,
              refreshToken: this.refreshToken,
            });
          } else {
            console.warn("No valid auth data found in localStorage.");
          }
        }
      } catch (error) {
        console.error("Error initializing auth data:", error);
      }
    },
  },
});