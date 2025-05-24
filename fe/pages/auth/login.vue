<template>
  <div class="flex min-h-screen items-center justify-center overflow-hidden">
    <div class="bg-white p-8 rounded-2xl w-[350px] md:w-[400px] transform translate-y-10">
      <h2 class="text-lg font-bold text-gray-900 text-center mb-6">Login to Your Account</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- CCI ID (always disabled) -->
        <div>
          <input
            v-model="cciId"
            type="text"
            placeholder="CCI ID"
            class="w-full text-medium px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-100"
            disabled
          />
        </div>

        <!-- Password field -->
        <div class="relative">
          <input
            v-model="password"
            :disabled="isLoading"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter Password"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-medium transition pr-12"
            :class="[
              errorMessage
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-green-500',
              isLoading
                ? 'bg-gray-200 cursor-not-allowed opacity-70'
                : 'bg-white'
            ]"
            required
          />
          <span
            @click.prevent="showPassword = !showPassword"
            class="absolute inset-y-0 right-3 flex items-center cursor-pointer select-none"
          >
            <Eye v-if="showPassword" class="h-4 w-4 text-gray-500 hover:text-gray-700 transition" />
            <EyeOff v-else class="h-4 w-4 text-gray-500 hover:text-gray-700 transition" />
          </span>
        </div>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>

        <!-- Forgot password link -->
        <div class="text-right">
          <a href="/auth/forgot-password" class="text-purple-600 hover:underline text-sm">
            Forgot password?
          </a>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2 font-semibold rounded-lg transition"
          :class="isLoading
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-70'
            : 'bg-green-500 text-white hover:bg-green-600'"
        >
          <span v-if="isLoading">Logging in...</span>
          <span v-else>LOGIN</span>
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
        <CheckCircle v-if="popupType === 'success'" class="h-6 w-6 text-black" />
        <span class="font-medium">{{ popupMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/store/auth";
import { Eye, EyeOff, CheckCircle } from "lucide-vue-next";

const authStore = useAuthStore();
const cciId = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const isLoading = ref(false);
const router = useRouter();
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("success");

onMounted(() => {
  const storedCciId = localStorage.getItem("cci_id");
  if (storedCciId) cciId.value = storedCciId;
  authStore.initializeAuth();
});

async function handleLogin() {
  errorMessage.value = "";
  isLoading.value = true;

  // record start time to enforce minimum load duration
  const start = Date.now();

  try {
    if (!cciId.value || !password.value) {
      throw new Error("CCI ID and Password are required.");
    }

    const response = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cci_id: cciId.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let customError = "Login failed. Please try again.";

      if (errorData.message) {
        if (errorData.message.toLowerCase().includes("invalid credentials")) {
          customError = "Wrong credentials!";
        } else {
          customError = errorData.message;
        }
      }

      throw new Error(customError);
    }

    const data = await response.json();
    authStore.setUserAndTokens(
      data.cci_id,
      data.access_token,
      null,
      data.role,
      data.firstName
    );

    showToast("Login Successful!", "success");
    setTimeout(() => router.push("/"), 1000);
  } catch (err) {
    errorMessage.value = err.message;
    setTimeout(() => {
      errorMessage.value = "";
    }, 2000);
  } finally {
    // ensure at least 500ms has passed before clearing loading state
    const elapsed = Date.now() - start;
    const minDuration = 500;
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
    }
    
     setTimeout(() => {
      isLoading.value = false; // reset value after the login process is fully complete 
    }, 1000);
  
  }
}

function showToast(message, type = "success") {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  setTimeout(() => {
    showPopup.value = false;
  }, 2000);
}
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out, transform 0.3s ease-in-out;
}

.fade-enter {
  opacity: 0;
  transform: translateX(50px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(50px);
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
