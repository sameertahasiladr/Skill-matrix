<template>
  <div class="container mx-auto mt-6 w-full max-w-none px-0">
    <!-- Loading State during Auth Initialization -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- No Permission Message for Non-Logged-In or Non-Admin Users -->
    <div v-else-if="!isAuthenticated || !isAdmin" class="text-center py-20">
      <p class="text-gray-600">You do not have permission to access this page. Please contact an admin.</p>
    </div>

    <!-- Main Content (only for admins) -->
    <div v-else>
      <div class="flex justify-center">
        <div class="bg-white shadow-lg rounded-lg p-6 w-full md:w-11/12 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">File Upload</h2>
          <p class="text-gray-700 font-semibold mb-2">
            Upload: <span class="text-green-700">{{ userTypeLabel }}</span>
          </p>
          <div class="border border-gray-300 rounded-md px-4 py-4 w-full flex items-center">
            <div class="flex-grow">
              <label for="file-upload" class="block text-gray-700 font-semibold mb-2">
                Choose File to upload data
              </label>
              <div class="border border-gray-300 rounded-md px-4 py-3 w-full md:w-[70%] flex items-center">
                <input
                  id="file-upload"
                  ref="fileInput"
                  type="file"
                  class="hidden"
                  accept=".xlsx,.xls"
                  @change="handleFileChange"
                  :disabled="!isAdmin"
                />
                <label
                  for="file-upload"
                  class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 transition"
                  :disabled="!isAdmin"
                >
                  Choose File
                </label>
                <span class="ml-4 text-gray-600 truncate w-[50%] flex items-center">
                  {{ fileName || "No file selected" }}
                  <button
                    v-if="fileName"
                    type="button"
                    class="ml-2 text-red-400 hover:text-red-400"
                    @click="clearFile"
                    :disabled="!isAdmin"
                    title="Remove selected file"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
            <button
              type="button"
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition ml-3"
              :disabled="uploading || !isAdmin"
              @click="uploadFile"
            >
              {{ uploading ? "Uploading..." : "Upload" }}
            </button>
          </div>
          <!-- Loading State during Upload -->
          <div v-if="uploading" class="flex justify-center mt-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p v-if="errorMessage" class="mt-4 text-red-600 font-normal">{{ errorMessage }}</p>
          <p v-if="successMessage" class="mt-4 text-green-600 font-semibold">{{ successMessage }}</p>
          <div v-if="jobId" class="mt-4 p-4 border border-green-300 bg-green-50 text-green-700 rounded-md">
            <p class="font-semibold mb-2 text-sm">File uploaded successfully!</p>
            <p class="mb-2 text-sm">
              File processing can be tracked using Job ID: <span class="font-semibold">{{ jobId }}</span>
            </p>
            <button
              type="button"
              class="bg-green-600 text-white px-2 py-1 text-sm rounded-md hover:bg-green-700 transition"
              @click="copyJobId"
              :disabled="!isAdmin"
            >
              Copy Job ID
            </button>
            <div v-if="copySuccess" class="mt-2 text-xs text-green-600">Job ID copied to clipboard!</div>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <div class="bg-white shadow-lg rounded-lg p-6 w-full md:w-11/12">
          <h2 class="text-xl font-bold text-gray-800 mb-4">View file upload job status</h2>
          <div class="border border-gray-300 rounded-md px-4 py-4 w-full flex items-center">
            <div class="flex-grow">
              <input
                type="text"
                v-model="searchId"
                placeholder=" Enter Job ID"
                class="border border-gray-300 rounded-md px-4 py-2 w-full md:w-[70%]"
                :disabled="!isAdmin"
              />
            </div>
            <button
              type="button"
              class="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition ml-3"
              @click="searchJob"
              :disabled="!isAdmin"
            >
              Search
            </button>
          </div>
          <!-- Loading State during Search -->
          <div v-if="searching" class="flex justify-center mt-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p v-if="searchError" class="mt-6 text-red-600 font-normal">{{ searchError }}</p>
          <div v-if="jobDetails" class="mt-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Job Details</h2>
            <table class="min-w-full border-collapse border border-gray-300 text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border border-gray-300 px-4 py-2 text-left">Job Type</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Upload Date</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Upload Summary</th>
                  <th class="border border-gray-300 px-4 py-2 text-left">Download</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 px-4 py-2">{{ jobDetails.jobType || "N/A" }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ jobDetails.status || "N/A" }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ formatDate(jobDetails.uploadDate) }}</td>
                  <td class="border border-gray-300 px-4 py-2 align-top">
                    <div v-if="jobDetails.uploadSummary" class="space-y-1 text-sm">
                      <div class="flex justify-between"><span>Insert count:</span><span class="font-semibold text-blue-600">{{ jobDetails.uploadSummary.insertedRowCount || 0 }}</span></div>
                      <div class="flex justify-between"><span>Update count:</span><span class="font-semibold text-black-600">{{ jobDetails.uploadSummary.updatedRowCount || 0 }}</span></div>
                      <div class="flex justify-between"><span>Fail count:</span><span class="font-semibold text-red-600">{{ jobDetails.uploadSummary.failedCount || 0 }}</span></div>
                      <div class="flex justify-between"><span>Skipped count:</span><span class="font-semibold text-blue-600">{{ jobDetails.uploadSummary.skippedRowCount || 0 }}</span></div>
                      <div class="flex justify-between"><span>Sheets Processed:</span><span class="font-semibold text-blue-600">{{ jobDetails.uploadSummary.sheetsProcessedCount || 0 }}</span></div>
                      <div class="flex justify-between"><span>Sheets Skipped:</span><span class="font-semibold text-blue-600">{{ jobDetails.uploadSummary.sheetsSkippedCount || 0 }}</span></div>
                    </div>
                    <div v-else>No summary available</div>
                  </td>
                  <td class="border border-gray-300 px-4 py-2">
                    <div v-if="jobDetails.download">
                      <a :href="jobDetails.download" target="_blank" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Download</a>
                    </div>
                    <div v-else>N/A</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRuntimeConfig, navigateTo } from "#app";
import { useAuthStore } from "~/store/auth";

const file = ref(null);
const fileName = ref("");
const uploading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const jobId = ref("");
const copySuccess = ref(false);
const searchId = ref("");
const jobDetails = ref(null);
const searchError = ref("");
const searching = ref(false);
const fileInput = ref(null);
const route = useRoute();
const config = useRuntimeConfig();
const userType = ref(route.query.type || "emp");

// URL Protection and Loading Logic
const authStore = useAuthStore();
const isLoading = ref(true); // Loading state for auth initialization
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);

onMounted(async () => {
  isLoading.value = true; // Start loading during auth initialization
  await authStore.initializeAuth();
  isLoading.value = false; // Stop loading once auth is ready

  // Handle redirects for unauthorized users after 4 seconds
  if (!isAuthenticated.value || !isAdmin.value) {
    setTimeout(() => {
      navigateTo(isAuthenticated.value ? '/' : '/auth/sign-in');
    }, 4000);
  }
});

const userTypeLabel = computed(() => (userType.value === "emp" ? "Employee" : "Skill Matrix"));
const uploadEndpoint = computed(() => (userType.value === "emp" ? "/excel/upload/employee" : "/excel/upload/skillmatrix"));

function sanitizeErrorMessage(msg) {
  return msg.replace(/<\/?[^>]+(>|$)/g, "");
}

function handleFileChange(e) {
  if (!isAuthenticated.value || !isAdmin.value) {
    errorMessage.value = "You do not have permission to upload files.";
    return;
  }
  const selected = e.target.files[0];
  if (!selected) return;
  if (!selected.name.match(/\.(xlsx|xls)$/)) {
    errorMessage.value = sanitizeErrorMessage("Invalid file type. Please upload an Excel file.");
    file.value = null;
    fileName.value = "";
    return;
  }
  file.value = selected;
  fileName.value = selected.name;
  errorMessage.value = "";
}

function clearFile() {
  if (!isAuthenticated.value || !isAdmin.value) {
    errorMessage.value = "You do not have permission to clear files.";
    return;
  }
  file.value = null;
  fileName.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

async function uploadFile() {
  if (!isAuthenticated.value || !isAdmin.value) {
    errorMessage.value = "You do not have permission to upload files.";
    return;
  }

  if (!file.value) {
    errorMessage.value = sanitizeErrorMessage("Please select a file first.");
    return;
  }

  const token = authStore.access_token;
  if (!token) {
    errorMessage.value = "Authentication token missing.";
    return;
  }

  uploading.value = true;
  successMessage.value = "";
  errorMessage.value = "";
  jobId.value = "";
  jobDetails.value = null;
  searchError.value = "";

  try {
    const formData = new FormData();
    formData.append("file", file.value);
    const url = `${config.public.apiBase}${uploadEndpoint.value}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await res.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized: Session expired.");
      }
      const msg = (result && result.message) || "Upload failed. Please try again.";
      throw new Error(msg);
    }

    if (typeof result === "string") {
      jobId.value = result;
      successMessage.value = "File uploaded successfully!";
    } else {
      if (result.jobId) jobId.value = result.jobId;
      successMessage.value = result.message || "File uploaded successfully.";
    }

    file.value = null;
    fileName.value = "";
    if (fileInput.value) fileInput.value.value = "";
  } catch (err) {
    console.error("Upload error:", err);
    errorMessage.value = sanitizeErrorMessage(err.message);
  } finally {
    uploading.value = false;
  }
}

async function copyJobId() {
  if (!isAuthenticated.value || !isAdmin.value) {
    errorMessage.value = "You do not have permission to copy Job ID.";
    return;
  }
  if (!jobId.value) return;
  try {
    await navigator.clipboard.writeText(jobId.value);
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 2000);
  } catch {
    errorMessage.value = sanitizeErrorMessage("Failed to copy Job ID. Please copy manually.");
  }
}

async function searchJob() {
  if (!isAuthenticated.value || !isAdmin.value) {
    searchError.value = "You do not have permission to search jobs.";
    return;
  }

  if (!searchId.value) {
    searchError.value = sanitizeErrorMessage("Please enter a Job ID.");
    jobDetails.value = null;
    return;
  }

  const token = authStore.access_token;
  if (!token) {
    searchError.value = "Authentication token missing.";
    return;
  }

  searching.value = true;
  searchError.value = "";
  jobDetails.value = null;
  const url = `${config.public.apiBase}/job/search/${searchId.value}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized: Session expired.");
      }
      const msg = (data && data.message) || "Could not fetch job details.";
      throw new Error(msg);
    }

    jobDetails.value = data;
  } catch (err) {
    console.error("Search job error:", err);
    searchError.value = sanitizeErrorMessage(err.message);
  } finally {
    searching.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString();
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
}
</style>