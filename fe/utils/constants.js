export const API_ENDPOINTS = {
	SIGN_IN: "/auth/sign-in",
	SIGN_UP: "/auth/sign-up",
	RESET_PASSWORD_SEND: "/auth/reset-password/sending-email",
	RESET_PASSWORD_VALIDATE: "/auth/validate-reset-token",
	RESET_PASSWORD_SET: "/auth/set-password",
};


export const MESSAGES = {
	

	// Authentication Messages
	USER_NOT_FOUND: "User ID not found. Please log in.",
	SIGN_IN_SUCCESS: "Sign-in successful!",
	SIGN_IN_FAILED: "Sign-in failed.",
	INVALID_CREDENTIALS: "Invalid email or password.",
	SIGN_UP_SUCCESS: "Sign-up successful! Redirecting to Sign-In page...",
	SIGN_UP_FAILED: "Sign-up failed. Please try again.",
	AUTH_REQUIRED: "Please log in to view this page.",

};
export const ERROR_MESSAGES = {
	USER_NOT_FOUND: "User ID not found. Please log in.",
	
};
