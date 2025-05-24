<template>
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="bg-white p-8 rounded-2xl w-[350px] md:w-[400px] transform translate-y-10"
		>
			<h2 class="text-lg font-bold text-gray-900 text-center mb-4">
				Set Password
			</h2>

			<div
				v-if="invalidToken"
				class="mb-4"
			>
				<div class="bg-red-50 text-red-600 p-3 rounded-md text-center">
					Expired or invalid token
				</div>
			</div>
			<p
				v-else-if="errorMessage"
				class="text-red-500 text-center mb-4"
			>
				{{ errorMessage }}
			</p>

			<form
				@submit.prevent="handleSetPassword"
				class="space-y-6"
			>
				<div>
					<input
						v-model="cciId"
						type="text"
						placeholder="CCI ID"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
						disabled
					/>
				</div>

				<div class="relative">
					<input
						v-model="password"
						:disabled="isLoading || invalidToken"
						:type="showPassword ? 'text' : 'password'"
						placeholder="New Password"
						class="w-full p-3 pr-10 text-medium border rounded-lg focus:outline-none focus:ring-2 transition"
						:class="[
							errorPassword
								? 'border-red-500 focus:ring-red-500'
								: 'border-gray-300 focus:ring-green-500',
							isLoading
								? 'bg-gray-200 cursor-not-allowed opacity-70'
								: 'bg-white',
						]"
						@input="clearPasswordError"
						required
					/>
					<span
						@click.prevent="showPassword = !showPassword"
						:class="{ 'cursor-not-allowed': invalidToken }"
						class="absolute inset-y-0 right-3 flex items-center cursor-pointer select-none"
					>
						<Eye
							v-if="showPassword"
							class="h-4 w-4 text-gray-500 hover:text-gray-700 transition"
						/>
						<EyeOff
							v-else
							class="h-4 w-4 text-gray-500 hover:text-gray-700 transition"
						/>
					</span>
				</div>

				<p
					v-if="errorPassword"
					class="text-red-500 text-sm mt-1 pl-1"
				>
					{{ errorPassword }}
				</p>

				<div class="relative">
					<input
						v-model="confirmPassword"
						:disabled="isLoading || invalidToken"
						:type="showConfirmPassword ? 'text' : 'password'"
						placeholder="Confirm Password"
						class="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 text-medium transition"
						:class="[
							errorConfirmPassword
								? 'border-red-500 focus:ring-red-500'
								: 'border-gray-300 focus:ring-green-500',
							isLoading
								? 'bg-gray-200 cursor-not-allowed opacity-70'
								: 'bg-white',
						]"
						@input="clearConfirmPasswordError"
						required
					/>
					<span
						@click.prevent="
							showConfirmPassword = !showConfirmPassword
						"
						:class="{ 'cursor-not-allowed': invalidToken }"
						class="absolute inset-y-0 right-3 flex items-center cursor-pointer select-none"
					>
						<Eye
							v-if="showConfirmPassword"
							class="h-4 w-4 text-gray-500 hover:text-gray-700 transition"
						/>
						<EyeOff
							v-else
							class="h-4 w-4 text-gray-500 hover:text-gray-700 transition"
						/>
					</span>
				</div>
				<p
					v-if="errorConfirmPassword"
					class="text-red-500 text-sm mt-1 pl-1"
				>
					{{ errorConfirmPassword }}
				</p>

				<button
					type="submit"
					:disabled="invalidToken || isLoading"
					class="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
					:class="
						isLoading
							? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-70'
							: 'bg-green-500 text-white hover:bg-green-600'
					"
				>
					<span v-if="isLoading">Setting Password...</span>
					<span v-else>RESET PASSWORD</span>
				</button>
			</form>
		</div>

		<transition name="fade">
			<div
				v-if="showSuccessPopup"
				class="fixed top-24 right-6 px-6 py-4 rounded-lg shadow-lg max-w-xs text-black z-50 flex items-center space-x-3 bg-green-300"
			>
				<CheckCircle class="h-6 w-6 text-black" />
				<span class="font-medium">{{ successMessage }}</span>
			</div>
		</transition>
	</div>
</template>

<script setup>
	import { ref, onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { Eye, EyeOff, CheckCircle } from "lucide-vue-next";

	const route = useRoute();
	const router = useRouter();
	const token = ref(null);
	const cciId = ref("");
	const password = ref("");
	const confirmPassword = ref("");
	const showPassword = ref(false);
	const showConfirmPassword = ref(false);
	const errorMessage = ref("");
	const errorPassword = ref("");
	const errorConfirmPassword = ref("");
	const invalidToken = ref(false);
	const isLoading = ref(false);

	const showSuccessPopup = ref(false);
	const successMessage = ref("");
	let popupTimeout = null;

	onMounted(async () => {
		token.value = route.query.token || null;

		if (!token.value) {
			errorMessage.value = "Expired or invalid token";
			invalidToken.value = true;
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:4000/auth/validate-reset-token?token=${token.value}`,
				{
					method: "GET",
					headers: { "Content-Type": "application/json" },
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Invalid or expired token.");
			}

			cciId.value = data.cci_id;
		} catch (error) {
			errorMessage.value = "Expired or invalid token";
			invalidToken.value = true;
		}
	});

	function showSuccessToast(message) {
		if (popupTimeout) {
			clearTimeout(popupTimeout);
		}
		successMessage.value = message;
		showSuccessPopup.value = true;
		popupTimeout = setTimeout(() => {
			showSuccessPopup.value = false;
			popupTimeout = null;
		}, 2000);
	}

	async function handleSetPassword() {
		if (invalidToken.value) return;

		errorMessage.value = "";

		if (!password.value) {
			errorPassword.value = "Password cannot be empty.";
			errorConfirmPassword.value = "";
		} else if (password.value.length < 6) {
			errorPassword.value =
				"Please use at least one uppercase letter, number, and special character.";
			errorConfirmPassword.value = "";
		} else {
			errorPassword.value = "";

			if (!confirmPassword.value) {
				errorConfirmPassword.value =
					"Confirm Password cannot be empty.";
			} else if (password.value !== confirmPassword.value) {
				errorConfirmPassword.value = "Passwords do not match!";
			} else {
				errorConfirmPassword.value = "";
			}
		}

		if (errorPassword.value || errorConfirmPassword.value) return;
		// start loading
		isLoading.value = true;
		try {
			const response = await fetch(
				"http://localhost:4000/auth/set-password",
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						cci_id: cciId.value,
						password: password.value,
						confirm_password: confirmPassword.value,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to set password.");
			}

			localStorage.setItem("cci_id", cciId.value);
			showSuccessToast("Password set successfully!");
			setTimeout(() => {
				router.push("/auth/login");
			}, 1500);
		} catch (error) {
			errorPassword.value = "Password is not strong enough";
			errorConfirmPassword.value = "";
		} finally {
			setTimeout(() => {
				isLoading.value = false; // reset value after the login process is fully complete
			}, 1000);
		}
	}

	function clearPasswordError() {
		errorPassword.value = "";
	}

	function clearConfirmPasswordError() {
		errorConfirmPassword.value = "";
	}
</script>

<style scoped>
	button:focus {
		outline: none;
	}

	html,
	body {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
	}

	input:focus {
		outline: none !important;
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.5s ease-in-out, transform 0.3s ease-in-out;
	}

	.fade-enter {
		opacity: 0;
		transform: translateY(-50px);
	}

	.fade-leave-to {
		opacity: 0;
		transform: translateY(-50px);
	}

	.min-h-screen {
		min-height: 72vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Hide default browser password eye icon */
	input[type="password"]::-ms-reveal,
	input[type="password"]::-webkit-contacts-auto-fill-button,
	input[type="password"]::-webkit-textfield-decoration-container {
		display: none !important;
	}
</style>
