<template>
  <div class="flex flex-col min-h-screen bg-gray-100" v-if="!isLoading">
    <nav class="bg-[#90EE91] text-black px-4 py-2 relative">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="font-bold text-xl">Skill-Matrix</span>
        </div>

        <ul v-if="isAuthenticated" class="hidden md:flex space-x-4 items-center justify-center flex-1">
          <li>
            <NuxtLink to="/" class="hover:text-gray-700 transition-colors px-2 py-1">Dashboard</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/roadmap" class="hover:text-gray-700 transition-colors px-2 py-1">Roadmap</NuxtLink>
          </li>
          <li class="relative skill-matrix-dropdown">
            <div @click="handleSkillMatrixClick" class="flex items-center space-x-2 cursor-pointer px-3 py-1 rounded-md transition-all duration-300 ease-in-out" role="button" :aria-expanded="openSkillMatrix">
              <span class="font text-base">Skill Matrix</span>
              <svg class="h-5 w-5 text-black transition-transform duration-200" :class="{ 'rotate-180': visitedSkillMatrix && openSkillMatrix }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
            <div v-if="visitedSkillMatrix && openSkillMatrix" class="absolute mt-2 bg-white text-black rounded-lg shadow-2xl py-2 z-50 border border-gray-100 w-56 origin-top-right ring-2 ring-gray-100 ring-opacity-100">
              <ul class="divide-y divide-gray-100">
                <li v-for="(desigItem, dIndex) in designations" :key="dIndex" class="relative">
                  <div @click.stop="toggleDesignation(dIndex)" class="px-3 py-2 flex items-center justify-between cursor-pointer transition-colors duration-200 hover:bg-gray-50 text-base">
                    <span class="font-normal text-black">{{ desigItem.label }}</span>
                    <svg class="h-5 w-5 text-gray-600 transition-transform duration-300" :class="{ 'rotate-90': desigItem.open }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <transition name="submenu">
                    <ul v-if="desigItem.open" class="absolute left-full top-0 bg-white border border-gray-100 rounded-md shadow-lg py-2 mt-[-2px] w-44 ring-1 ring-gray-100">
                      <li v-for="(roleItem, rIndex) in desigItem.roles" :key="rIndex" class="px-3 py-2 cursor-pointer transition-colors duration-200 hover:bg-gray-50 text-base" @click.stop="storeDesignationRole(desigItem.label, roleItem)">
                        {{ roleItem }}
                      </li>
                    </ul>
                  </transition>
                </li>
              </ul>
            </div>
          </li>
          <li v-if="isAdmin" class="relative admin-dropdown">
            <div @click="toggleAdminDropdown" class="flex items-center space-x-2 cursor-pointer px-3 py-1 rounded-md transition-all duration-300 ease-in-out" role="button" :aria-expanded="showDropdown">
              <span class="font- text-base">Admin Tools</span>
              <svg class="h-5 w-5 text-black transition-transform duration-200" :class="{ 'rotate-180': showDropdown }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
            <div v-if="showDropdown" class="absolute left-0 mt-2 w-56 bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-100 z-50 ring-2 ring-gray-100 ring-opacity-100 origin-top-right">
              <div class="divide-y divide-gray-100">
                <div class="relative py-2 transition-colors duration-200">
                  <div @click="toggleUploadOptions" class="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-50 text-base">
                    <span class="font-normal text-black">Upload File</span>
                    <svg class="h-5 w-5 text-gray-600 transition-transform duration-200" :class="{ 'rotate-90': showUploadOptions }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <transition name="submenu">
                    <div v-if="showUploadOptions" class="absolute left-full top-0 ml-2 bg-white shadow-lg border border-gray-100 rounded-md w-44 text-gray-800">
                      <NuxtLink :to="{ path: '/excel-upload', query: { type: 'emp' } }" class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-50 text-base" @click="closeAllDropdowns">Employee</NuxtLink>
                      <NuxtLink :to="{ path: '/excel-upload', query: { type: 'skillmatrix' } }" class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-50 text-base rounded-b-md" @click="closeAllDropdowns">Skill-Matrix</NuxtLink>
                    </div>
                  </transition>
                </div>
                <NuxtLink to="/job-status" class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-50 text-base" @click="closeAllDropdowns">Job Status</NuxtLink>
                <NuxtLink to="/edit-skillmatrix" class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-50 text-base rounded-b-md" @click="closeAllDropdowns">Edit Matrix</NuxtLink>
                <NuxtLink to="/genrate-skill-token" class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-50 text-base rounded-b-md" @click="closeAllDropdowns">Genrate-Skill-Token</NuxtLink>  
              </div>
            </div>
          </li>
        </ul>

        <div class="flex items-center space-x-4">
          <NuxtLink v-if="!isAuthenticated" to="/auth/sign-in" class="hover:text-gray-700 transition-colors px-2 py-1">Login</NuxtLink>
          <div v-else class="relative user-dropdown">
            <div @click="toggleUserDropdown" class="flex items-center space-x-2 cursor-pointer px-2 py-1 hover:text-gray-700 transition-colors" role="button" :aria-expanded="showUserDropdown">
              <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ userFirstName }}</span>
              <svg class="h-4 w-4 text-black transition-transform duration-200" :class="{ 'rotate-180': showUserDropdown }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
            <div v-if="showUserDropdown" class="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-100 z-50 ring-2 ring-gray-100 ring-opacity-50">
              <button @click="logout" class="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main class="flex-grow container mx-auto p-4">
      <NuxtPage :key="route.fullPath" />
    </main>
    <footer class="bg-gray-200 text-center py-3 text-base">
      © 2025 Skills App. All rights reserved.
    </footer>
  </div>
  <div v-else class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "#app"; // Corrected import for Nuxt 3
import { useAuthStore } from "~/store/auth";
import { Nut } from "lucide-vue-next";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const visitedSkillMatrix = ref(false);
const openSkillMatrix = ref(false);
const designations = ref([
  { label: "Junior Developer", open: false, roles: ["Backend", "Frontend", "QA"] },
  { label: "Developer", open: false, roles: ["Backend", "Frontend", "QA"] },
  { label: "Senior Developer", open: false, roles: ["Backend", "Frontend", "QA"] },
]);
const showDropdown = ref(false);
const showUploadOptions = ref(false);
const showUserDropdown = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const userFirstName = computed(() => {
  const user = authStore.user as unknown as { firstName?: string; id?: string };
  if (user?.firstName) return user.firstName;
  return user?.id?.split('.')[0] || "User";
});

onMounted(async () => {
  isLoading.value = true;
  await authStore.initializeAuth();
  isLoading.value = false;
  visitedSkillMatrix.value = localStorage.getItem("visitedSkillMatrix") === "true";
  if (route.path === "/skill-matrix") {
    visitedSkillMatrix.value = true;
    openSkillMatrix.value = true;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});

// Handle Skill Matrix click
function handleSkillMatrixClick() {
  if (route.path !== "/skill-matrix") {
    localStorage.setItem("visitedSkillMatrix", "true");
    router.push("/skill-matrix");
  } else {
    openSkillMatrix.value = !openSkillMatrix.value;
    if (openSkillMatrix.value) {
      showDropdown.value = false;
      showUserDropdown.value = false;
      designations.value.forEach(item => (item.open = false));
    }
  }
}

function toggleDesignation(index: number) {
  designations.value.forEach((item, idx) => {
    if (idx !== index) item.open = false;
  });
  designations.value[index].open = !designations.value[index].open;
}

function storeDesignationRole(designation: string, role: string) {
  localStorage.setItem("chosenDesignation", designation);
  localStorage.setItem("chosenRole", role);
  closeAllDropdowns();
  router.push({ path: "/skill-matrix", query: { designation, role, t: Date.now().toString() } });
}

function toggleAdminDropdown() {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    openSkillMatrix.value = false;
    designations.value.forEach(item => (item.open = false));
    showUserDropdown.value = false;
  }
  showUploadOptions.value = false;
}

function toggleUploadOptions() {
  showUploadOptions.value = !showUploadOptions.value;
}

function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value;
  if (showUserDropdown.value) {
    showDropdown.value = false;
    openSkillMatrix.value = false;
    designations.value.forEach(item => (item.open = false));
  }
}

function closeAllDropdowns() {
  showDropdown.value = false;
  showUploadOptions.value = false;
  openSkillMatrix.value = false;
  showUserDropdown.value = false;
  designations.value.forEach(item => (item.open = false));
}

const logout = async () => {
  await authStore.logout();
  // Clear specific local storage items
  localStorage.removeItem("cci_id");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("role"); // Include role if it exists in your storage
  closeAllDropdowns();
  router.push("/auth/sign-in"); // Redirect to login page after logout
};

let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
watch(openSkillMatrix, (newVal) => {
  if (newVal) {
    autoCloseTimer = setTimeout(() => {
      closeAllDropdowns();
    }, 5000);
  } else if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
});

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const isOutside =
    !target.closest(".skill-matrix-dropdown") &&
    !target.closest(".admin-dropdown") &&
    !target.closest(".user-dropdown");
  if (isOutside) {
    closeAllDropdowns();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeAllDropdowns();
  }
}

watch(() => route.path, () => {
  closeAllDropdowns();
});
</script>

<style scoped>
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease-in-out;
}
.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>