<template>
  <div class="container mx-auto p-4 bg-gray-100 min-h-screen flex justify-center items-center overflow-hidden">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-[400px] md:w-[500px] transform translate-y-10">
      <h6 class="text-lg font-bold mb-6 text-center text-gray-700">Enter CCI ID</h6>

      <form @submit.prevent="checkUserStatus">
        <div class="mb-4">
          <input 
            v-model="cciId"
            type="text" 
            placeholder="Enter CCI ID" 
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-medium transition"
            :class="{ 'border-red-500 focus:ring-red-500': errorMessage, 'border-gray-300 focus:ring-green-500': !errorMessage }"
            required
          />
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm mt-2 text-center">
          {{ errorMessage }}
        </p>

        <button 
          type="submit"
          class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md text-medium mt-4"
          :disabled="loading"
        >
          <span v-if="loading">Checking...</span>
          <span v-else>NEXT</span>
        </button>
      </form>
    </div>

    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-8 rounded-xl shadow-xl w-[450px] text-center relative">
        <button @click="showModal = false" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">
          &times;
        </button>

        <div class="flex justify-center items-center mb-4">
          <div class="bg-green-100 text-green-500 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
            ✅
          </div>
        </div>

        <h3 class="text-xl font-semibold text-gray-800 mb-2">Email Sent Successfully</h3>
        <p class="text-gray-600 mb-6">Please check your email and follow the link to set your password.</p>

        <button 
          @click="showModal = false"
          class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md"
        >
          Okay, got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const cciId = ref("");
const showModal = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const router = useRouter();

const checkUserStatus = async () => {
  if (!cciId.value.trim()) {
    errorMessage.value = "CCI ID is required.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch("http://localhost:4000/auth/reset-password/sending-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cci_id: cciId.value }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.cci_id) {
        localStorage.setItem("cci_id", cciId.value);
        router.push("/auth/login");
      } else if (data.message === "Password reset email sent successfully.") {
        showModal.value = true;
      }
    } else {
      errorMessage.value = data.message || "User with this CCI ID does not exist.";
    }
  } catch (error) {
    errorMessage.value = "Network error. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
body {
  background-color: #f3f4f6;
}
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.min-h-screen {
  min-height: 72vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
</style>
