<template>
  <div class="flex min-h-screen items-center justify-center overflow-hidden">
    <div class="bg-white p-8 rounded-2xl w-[400px] md:w-[500px] transform translate-y-10">
      <h2 class="text-lg font-bold text-gray-900 text-center mb-4">Reset Password</h2>

      <form @submit.prevent="handleSetPassword" class="space-y-6">
        <!-- CCI ID (always disabled) -->
        <div>
          <input
            v-model="cciId"
            type="text"
            placeholder="CCI ID"
            class="w-full text-medium px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            disabled
          />
          <p v-if="errorCciId" class="text-red-500 text-sm mt-1 min-h-[20px]">{{ errorCciId }}</p>
        </div>

        <!-- New Password -->
        <div class="relative">
          <input
            v-model="password"
            :disabled="isLoading"
            :type="showPassword ? 'text' : 'password'"
            placeholder="New Password"
            class="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 text-medium transition"
            :class="[
              errorPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500',
              isLoading ? 'bg-gray-200 cursor-not-allowed opacity-70' : 'bg-white'
            ]"
            @input="clearPasswordError"
            required
          />
          <span @click.prevent="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 flex items-center cursor-pointer select-none">
            <Eye v-if="showPassword" class="h-4 w-4 text-gray-500 hover:text-gray-700 transition" />
            <EyeOff v-else class="h-4 w-4 text-gray-500 hover:text-gray-700 transition" />
          </span>
        </div>
        <p v-if="errorPassword" class="text-red-500 text-sm mt-1">{{ errorPassword }}</p>

        <!-- Confirm Password -->
        <div class="relative">
          <input
            v-model="confirmPassword"
            :disabled="isLoading"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm Password"
            class="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 text-medium transition"
            :class="[
              errorConfirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500',
              isLoading ? 'bg-gray-200 cursor-not-allowed opacity-70' : 'bg-white'
            ]"
            @input="clearConfirmPasswordError"
            required
          />
          <span @click.prevent="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-3 flex items-center cursor-pointer select-none">
            <Eye v-if="showConfirmPassword" class="h-4 w-4 text-gray-500 hover:text-gray-700 transition" />
            <EyeOff v-else class="h-4 w-4 text-gray-500 hover:text-gray-700 transition" />
          </span>
        </div>
        <p v-if="errorConfirmPassword" class="text-red-500 text-sm mt-1">{{ errorConfirmPassword }}</p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 font-semibold rounded-lg transition"
          :class="isLoading
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-70'
            : 'bg-green-500 text-white hover:bg-green-600'"
        >
          <span v-if="isLoading">Resetting Password...</span>
          <span v-else>RESET PASSWORD</span>
        </button>
      </form>
    </div>

    <!-- Toast popup -->
    <transition name="fade">
      <div
        v-if="showPopup"
        class="fixed top-24 right-6 px-6 py-4 rounded-lg shadow-lg max-w-xs text-black z-50 flex items-center space-x-3"
        :class="{ 'bg-green-300': popupType === 'success' }"
      >
        <CheckCircle class="h-6 w-6 text-black" />
        <span class="font-medium">{{ popupMessage }}</span>
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

const cciId = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("success");

const errorCciId = ref("");
const errorPassword = ref("");
const errorConfirmPassword = ref("");

onMounted(() => {
  const storedCciId = localStorage.getItem("cci_id");
  if (storedCciId) {
    cciId.value = storedCciId;
  } else {
    errorCciId.value = "CCI ID not found! Redirecting...";
    setTimeout(() => router.push("/auth/login"), 1500);
  }
});

async function handleSetPassword() {
  // validation
  errorCciId.value = "";
  if (!password.value) {
    errorPassword.value = "Password cannot be empty.";
    return;
  }
  if (password.value.length < 6) {
    errorPassword.value = "Password is not strong enough.";
    return;
  }
  if (!confirmPassword.value) {
    errorConfirmPassword.value = "Confirm Password cannot be empty.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorConfirmPassword.value = "Passwords do not match!";
    return;
  }
  errorPassword.value = "";
  errorConfirmPassword.value = "";

  // start loading
  isLoading.value = true;
  const start = Date.now();

  try {
    const response = await fetch("http://localhost:4000/auth/set-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cci_id: cciId.value,
        password: password.value,
        confirm_password: confirmPassword.value,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to reset password.");

    popupMessage.value = "Password Reset Successful!";
    popupType.value = "success";
    showPopup.value = true;
    setTimeout(() => {
      showPopup.value = false;
      router.push("/auth/Login");
    }, 2000);
  } catch (err) {
    const msg = err.message.toLowerCase();
    if (msg.includes("strong")) {
      errorPassword.value = "Password is not strong enough.";
    } else {
      errorPassword.value = err.message;
    }
  } finally {
    // enforce minimum 500ms loading
    const elapsed = Date.now() - start;
    if (elapsed < 500) {
      await new Promise(r => setTimeout(r, 500 - elapsed));
    }
    // isLoading.value = false;
    setTimeout(() => {
      isLoading.value = false; // reset value after the login process is fully complete
      router.push("/auth/Login"); 
    }, 900);
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
  overflow: hidden;
}

/* Hide default browser password eye icon */
input[type="password"]::-ms-reveal,
input[type="password"]::-webkit-contacts-auto-fill-button,
input[type="password"]::-webkit-textfield-decoration-container {
  display: none !important;
}
</style>
