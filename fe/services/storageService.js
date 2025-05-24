export class StorageService {
	/**
	 * Save user data (ID, access token, refresh token) to local storage.
	 * @param {loginReceive} data - User data containing `userId`, `access_token`, and `refreshToken`.
	 */
	static saveUser(data) {
		if (data?.userId && data?.access_token) {
			try {
				console.log("storage service");
				// Ensure data consistency
				const userId =
					typeof data.userId === "object"
						? data.userId.id
						: String(data.userId);
				localStorage.setItem("user", JSON.stringify({ id: userId }));
				localStorage.setItem("accessToken", data.access_token);
				localStorage.setItem("refreshToken", data.refreshToken);
				console.log("User data saved successfully.");
			} catch (error) {
				console.error(
					"Error saving user data to local storage:",
					error
				);
			}
		} else {
			console.error("Invalid user data provided for storage:", data);
		}
	}

	/**
	 * Retrieve the user object from local storage.
	 * @returns {Object|null} - The user object or `null` if not found.
	 */
	static getUser() {
		try {
			const user = localStorage.getItem("user");
			return user ? JSON.parse(user) : null;
		} catch (error) {
			console.error("Error retrieving user from local storage:", error);
			return null;
		}
	}

	/**
	 * Retrieve the user ID from local storage.
	 * @returns {string|null} - The user ID as a string or `null` if not found.
	 */
	static getUserId() {
		try {
			const user = this.getUser();
			return user?.id || null;
		} catch (error) {
			console.error(
				"Error retrieving user ID from local storage:",
				error
			);
			return null;
		}
	}

	/**
	 * Retrieve the access token from local storage.
	 * @returns {string|null} - The access token or `null` if not found.
	 */
	static getAccessToken() {
		try {
			return localStorage.getItem("accessToken") || null;
		} catch (error) {
			console.error(
				"Error retrieving access token from local storage:",
				error
			);
			return null;
		}
	}

	/**
	 * Retrieve the refresh token from local storage.
	 * @returns {string|null} - The refresh token or `null` if not found.
	 */
	static getRefreshToken() {
		try {
			return localStorage.getItem("refreshToken") || null;
		} catch (error) {
			console.error(
				"Error retrieving refresh token from local storage:",
				error
			);
			return null;
		}
	}

	/**
	 * Update the access token in local storage.
	 * @param {string} token - New access token.
	 */
	static setAccessToken(token) {
		if (token) {
			try {
				localStorage.setItem("accessToken", token);
				console.log("Access token updated successfully.");
			} catch (error) {
				console.error(
					"Error updating access token in local storage:",
					error
				);
			}
		} else {
			console.error("Invalid access token provided for update.");
		}
	}

	/**
	 * Update the refresh token in local storage.
	 * @param {string} token - New refresh token.
	 */
	static setRefreshToken(token) {
		if (token) {
			try {
				localStorage.setItem("refreshToken", token);
				console.log("Refresh token updated successfully.");
			} catch (error) {
				console.error(
					"Error updating refresh token in local storage:",
					error
				);
			}
		} else {
			console.error("Invalid refresh token provided for update.");
		}
	}

	/**
	 * Clear all user data from local storage.
	 */
	static clearStorage() {
		try {
			localStorage.removeItem("user");
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			console.log("User data cleared successfully.");
		} catch (error) {
			console.error(
				"Error clearing user data from local storage:",
				error
			);
		}
	}
	static getAccessToken() {
		try {
			return localStorage.getItem("accessToken") || null;
		} catch (error) {
			console.error("Error retrieving access token:", error);
			return null;
		}
	}

	static getUserId() {
		try {
			const user = JSON.parse(localStorage.getItem("user"));
			return user?.id || null;
		} catch (error) {
			console.error("Error retrieving user ID:", error);
			return null;
		}
	}
}
