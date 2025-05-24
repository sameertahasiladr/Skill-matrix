<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/store/auth'

const role = ref('')
const designation = ref('')
const email = ref('')
const error = ref('')
const showSuccessPopup = ref(false)
const isGenerating = ref(false)

const router = useRouter()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const isLoading = ref(true)
const isAdmin = computed(() => authStore.isAdmin)

onMounted(async () => {
  isLoading.value = true
  await authStore.initializeAuth()
  isLoading.value = false

  if (!authStore.isAuthenticated) {
    setTimeout(() => router.push('/auth/sign-in'), 3000)
  } else if (!isAdmin.value) {
    setTimeout(() => router.push('/'), 3000)
  }
})

async function generateToken() {
  try {
    error.value = ''
    showSuccessPopup.value = false
    isGenerating.value = true

    const accessToken = authStore.access_token
    if (!accessToken) throw new Error('No access token found.')

    const apiUrl = `${config.public.apiBase}/pdf/generate-token/${role.value}/${designation.value}?email=${encodeURIComponent(email.value)}`

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized: Please login again.')
      throw new Error('Failed to generate token.')
    }

    await res.json() // Consume the response to ensure the request completes
    showSuccessPopup.value = true
    // Reset form fields after success
    role.value = ''
    designation.value = ''
    email.value = ''
    setTimeout(() => (showSuccessPopup.value = false), 3000) // Hide popup after 3 seconds
  } catch (err) {
    error.value = err.message || 'Something went wrong.'
    if (err.message.includes('Unauthorized')) {
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
    }
  } finally {
    isGenerating.value = false
  }
}

// Watch for popup changes to control body overflow
watch([showSuccessPopup, error], ([newShowSuccess, newError]) => {
  if (newShowSuccess || newError) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10 px-4">
    <div class="max-w-3xl mx-auto">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>

      <div v-else-if="isAdmin" class="space-y-6">
        <!-- Header Card -->
        <div class="bg-white shadow-lg rounded-lg p-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Generate Skill Token </h1>
          <p class="text-gray-600"></p>
        </div>

        <!-- Form Card -->
        <div class="bg-white shadow-lg rounded-lg p-6">
          <form @submit.prevent="generateToken" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select v-model="role" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option disabled value="">Select a role</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Designation</label>
                <select v-model="designation" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option disabled value="">Select a designation</option>
                  <option>Junior Developer</option>
                  <option>Developer</option>
                  <option>Senior Developer</option>
                </select>
              </div>

              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="email" type="email" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter user email" />
              </div>
            </div>

            <button type="submit" class="w-full md:w-auto bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-300 shadow-md flex items-center justify-center" :disabled="isGenerating">
              <span v-if="isGenerating" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              {{ isGenerating ? 'Sending...' : 'Generate Token' }}
            </button>
          </form>
        </div>

        <!-- Success/Error Notification -->
        <div v-if="showSuccessPopup || error" class="fixed inset-0 flex items-center justify-center z-50">
          <div v-if="showSuccessPopup" class="bg-green-50 text-green-700 p-6 rounded-lg shadow-lg text-center animate-fade-in max-w-md">
            Token generated and email sent!
          </div>
          <div v-if="error" class="bg-red-50 text-red-700 p-6 rounded-lg shadow-lg text-center max-w-md">
            {{ error }}
          </div>
        </div>
      </div>

      <div v-else class="text-center h-64 flex items-center justify-center bg-white shadow-lg rounded-lg">
        <p class="text-gray-600 text-lg">You do not have permission to access this page. Please contact an admin.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}

select:focus, input:focus {
  outline: none;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  button {
    width: 100%;
  }

  .fixed .max-w-md {
    width: 90%;
  }
}
</style>