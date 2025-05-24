<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    <div v-else-if="isAdmin" class="space-y-6">
      <h1 class="text-2xl font-bold mb-6">Job List</h1>
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Search Jobs</h2>
        <form @submit.prevent="onSubmit" class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="text-sm text-gray-600 mb-1">Select Job Type</div>
            <div class="relative">
              <select
                v-model="selectedJobType"
                class="w-full h-10 px-3 py-2 border border-gray-300 rounded-md appearance-none"
                :disabled="!isAdmin"
                @change="onJobTypeChange"
              >
                <option value="">All</option>
                <option v-for="(typeObj, idx) in jobTypes" :key="idx" :value="typeObj.jobType">
                  {{ typeObj.jobType }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path d="M7 7l3 3 3-3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <label class="text-sm text-gray-600 mb-1 block" for="searchTerm">Search Job ID</label>
            <input
              id="searchTerm"
              v-model="searchTerm"
              placeholder="Enter Job ID"
              class="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
              :disabled="!isAdmin"
            />
          </div>
          <button
            type="submit"
            class="bg-gray-200 text-gray-800 hover:bg-gray-300 h-10 px-4 py-2 rounded-md self-end"
            :disabled="!isAdmin || loading"
          >
            Search by ID
          </button>
        </form>
        <div v-if="errorText" class="mt-4 text-red-600 text-sm">
          {{ errorText }}
        </div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Job Data</h2>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr class="bg-gray-50">
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">Job ID</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">Job Type</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">Status</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">Upload Date</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">Upload Summary</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">Download</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="jobs && jobs.length > 0">
                  <tr v-for="(item, idx) in jobs" :key="idx">
                    <td class="border border-gray-200 px-4 py-2 text-sm">{{ item.jobId || item.id }}</td>
                    <td class="border border-gray-200 px-4 py-2 text-sm">{{ item.jobType }}</td>
                    <td class="border border-gray-200 px-4 py-2 text-sm">{{ item.status }}</td>
                    <td class="border border-gray-200 px-4 py-2 text-sm">{{ formatDate(item.uploadDate) }}</td>
                    <td class="border border-gray-200 px-4 py-2 text-sm">
                      <div v-if="item.uploadSummary" class="space-y-1">
                        <div>
                          <span class="text-gray-600">Insert count:</span>
                          <span class="text-blue-500">{{ item.uploadSummary.insertedRowCount || 0 }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">Update count:</span>
                          <span class="text-gray-600">{{ item.uploadSummary.updatedRowCount || 0 }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">Fail count:</span>
                          <span class="text-red-500">{{ item.uploadSummary.failedCount || 0 }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">Skipped count:</span>
                          <span class="text-blue-500">{{ item.uploadSummary.skippedRowCount || 0 }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">Sheets Processed:</span>
                          <span class="text-blue-500">{{ item.uploadSummary.sheetsProcessedCount || 0 }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">Sheets Skipped:</span>
                          <span class="text-blue-500">{{ item.uploadSummary.sheetsSkippedCount || 0 }}</span>
                        </div>
                      </div>
                      <div v-else>--</div>
                    </td>
                    <td class="border border-gray-200 px-4 py-2 text-sm">
                      <a
                        v-if="item.download"
                        :href="item.download"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      >
                        Download
                      </a>
                      <div v-else>--</div>
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="6" class="border border-gray-200 px-4 py-4 text-center text-gray-500">No jobs found.</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- No Permission Message -->
    <div v-else class="text-center py-20">
      <p class="text-gray-600">You do not have permission to access this page. Please contact an admin.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRuntimeConfig, useRouter, useRoute } from '#app'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const isLoading = ref(true)
const loading = ref(false)
const errorText = ref('')
const jobTypes = ref([])
const jobs = ref([])
const searchTerm = ref('')
const selectedJobType = ref('')

const isAdmin = computed(() => authStore.isAdmin)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(async () => {
  isLoading.value = true
  await authStore.initializeAuth()
  isLoading.value = false

  if (!authStore.isAuthenticated) {
    // Delay redirect to show message
    setTimeout(() => {
      router.push('/auth/sign-in')
    }, 3000)
  } else if (!isAdmin.value) {
    // Delay redirect to show message
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } else {
    await fetchJobTypes()

    const jobTypeFromQuery = route.query.jobType
    if (jobTypeFromQuery && typeof jobTypeFromQuery === 'string') {
      selectedJobType.value = jobTypeFromQuery
    }

    await fetchJobs()
  }
})

watch(() => route.query.jobType, (newJobType) => {
  if (newJobType !== selectedJobType.value) {
    selectedJobType.value = newJobType || ''
    if (!loading.value) fetchJobs()
  }
})

watch(searchTerm, (newValue, oldValue) => {
  if (newValue === '' && oldValue !== '' && !loading.value) {
    fetchJobs()
  }
})

async function fetchJobTypes() {
  try {
    errorText.value = ''
    const token = authStore.access_token
    if (!token) {
      errorText.value = 'No auth token found.'
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
      return
    }
    const url = `${config.public.apiBase}/job/job-type`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized: Session expired.')
      }
      throw new Error('Failed to fetch job types.')
    }
    jobTypes.value = await res.json()
  } catch (err) {
    console.error('Error fetching job types:', err)
    errorText.value = err.message || 'Failed to fetch job types.'
    if (err.message.includes('Unauthorized')) {
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
    }
  }
}

async function fetchJobs() {
  try {
    loading.value = true
    errorText.value = ''
    jobs.value = []
    const token = authStore.access_token
    if (!token) {
      errorText.value = 'No auth token found.'
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
      return
    }
    let url = `${config.public.apiBase}/job/job-list`
    if (selectedJobType.value) url += `?jobType=${encodeURIComponent(selectedJobType.value)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized: Session expired.')
      }
      throw new Error('Failed to fetch jobs.')
    }
    const result = await res.json()
    jobs.value = Array.isArray(result) ? result : [result]
    await delay(2000)
    if (jobs.value.length === 0 && selectedJobType.value) {
      errorText.value = `Job ID ${searchTerm.value || 'N/A'} for job type ${selectedJobType.value} details not found`
    }
  } catch (err) {
    console.error('Error fetching jobs:', err)
    jobs.value = []
    await delay(2000)
    errorText.value = `Job ID ${searchTerm.value || 'N/A'} for job type ${selectedJobType.value || 'N/A'} details not found`
    if (err.message.includes('Unauthorized')) {
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
    }
  } finally {
    loading.value = false
  }
}

async function fetchJobById() {
  if (!searchTerm.value.trim()) {
    errorText.value = 'Please enter a Job ID.'
    return
  }
  try {
    loading.value = true
    errorText.value = ''
    jobs.value = []
    const token = authStore.access_token
    if (!token) {
      errorText.value = 'No auth token found.'
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
      return
    }
    const url = `${config.public.apiBase}/job/search/${searchTerm.value.trim()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized: Session expired.')
      }
      throw new Error('Failed to fetch the job by ID.')
    }
    const result = await res.json()
    jobs.value = [result]
    await delay(2000)
    if (selectedJobType.value && result.jobType !== selectedJobType.value) {
      jobs.value = []
      errorText.value = `Job ID ${searchTerm.value} for job type ${selectedJobType.value} details not found`
    }
  } catch (err) {
    console.error('Error fetching job by ID:', err)
    jobs.value = []
    await delay(2000)
    errorText.value = `Job ID ${searchTerm.value} for job type ${selectedJobType.value || 'N/A'} details not found`
    if (err.message.includes('Unauthorized')) {
      authStore.logout()
      setTimeout(() => {
        router.push('/auth/sign-in')
      }, 3000)
    }
  } finally {
    loading.value = false
  }
}

function onSubmit(event) {
  event.preventDefault()
  if (!loading.value) fetchJobById()
}

function onJobTypeChange() {
  searchTerm.value = ''
  router.push({
    query: {
      ...route.query,
      jobType: selectedJobType.value || undefined
    }
  })
  if (!loading.value) fetchJobs()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>