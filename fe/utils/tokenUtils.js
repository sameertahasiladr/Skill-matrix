export const saveTokens = (access_token, refreshToken, userId) => {
	if (typeof window !== "undefined") {
		localStorage.setItem("accessToken", access_token);
		localStorage.setItem("refreshToken", refreshToken);
		localStorage.setItem("userId", userId);
	}
};

export const clearTokens = () => {
	if (typeof window !== "undefined") {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("userId");
	}
};

export const getAccessToken = () => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("accessToken");
	}
	return null;
};
