<template>
  <div class="p-8 max-w-7xl mx-auto bg-white min-h-screen overflow-hidden relative rounded-2xl">
    <!-- Decorative Gradient Overlay -->
    <!-- User Name Card (only for role 'user') -->
    <div v-if="isAuthenticated && (authStore.getUser as User)?.role === 'user'" class="relative z-10 mb-6 p-4 rounded-2xl shadow-lg bg-white flex items-center space-x-4">
      <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <div>
        <p class="text-lg font-semibold text-gray-800">Welcome, {{ userFirstName }}!</p>
        <p class="text-sm text-gray-600">Build Your Skills</p>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-if="isAuthenticated && (authStore.getUser as User)?.role === 'admin'" class="relative z-10">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-24">
        <div class="relative">
          <div class="animate-pulse rounded-full h-24 w-24 border-t-4 border-b-4 border-gradient-to-r from-[#90EE91] to-[#90EE91] bg-gray-300"></div>
          <div class="absolute inset-0 flex items-center justify-center text-[#90EE91] font-semibold text-lg">Loading...</div>
        </div>
      </div>

      <!-- Admin Dashboard Content -->
      <div v-else class="space-y-12 bg-white">
        <!-- Header -->
        <div class="py-6 bg-gradient-to-r from-[#90EE91]/50 to-[#90EE91]/20 rounded-xl shadow-lg border border-gray-400 transform transition-all duration-300 hover:scale-105">
          <h1 class="text-4xl md:text-2xl text-black text-left pl-6">Welcome, {{ userFirstName }}!</h1>
        </div>

        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Total Users Card -->
          <div class="p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl border-l-4 border-[#90EE91]">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2 text-[#90EE91]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Total Users
            </h2>
            <p class="text-2xl font-extrabold text-[#90EE91] animate-fade">{{ totalUsers }}</p>
          </div>

          <!-- Total Main Skills Card -->
          <div class="p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl border-l-4 border-[#90EE91]">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2 text-[#90EE91]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Total Main Skills
            </h2>
            <p class="text-2xl font-extrabold text-[#90EE91] animate-fade">{{ totalMainSkills }}</p>
          </div>

          <!-- Users Per Main Skill Card -->
          <div class="p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl border-l-4 border-[#90EE91] col-span-1 md:col-span-3">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-6 h-6 mr-2 text-[#90EE91]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Users Per Main Skill
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-[#90EE91]/10">
                    <th class="p-3 font-semibold text-gray-800">Main Skill</th>
                    <th class="p-3 font-semibold text-gray-800">User Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(skill, index) in skillUserCounts" :key="index" class="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-300">
                    <td class="p-3 text-gray-800">{{ skill.mainSkill }}</td>
                    <td class="p-3 text-[#90EE91] font-medium">{{ skill.user_count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User View -->
    <div v-else-if="isAuthenticated && (authStore.getUser as User)?.role === 'user'" class="relative z-10">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-24">
        <div class="relative">
          <div class="animate-pulse rounded-full h-24 w-24 border-t-4 border-b-4 border-gradient-to-r from-[#90EE91] to-[#90EE91] bg-gray-300"></div>
          <div class="absolute inset-0 flex items-center justify-center text-[#90EE91] font-semibold text-lg">Loading...</div>
        </div>
      </div>

      <!-- No Permission or No Skills -->
      <div v-else-if="skills.length === 0" class="text-center py-32">
        <button @click="showAddModal = true" class="mt-8 px-10 py-4 bg-gradient-to-r from-[#90EE91] to-[#90EE91] text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 transform-gpu">
          Start building skills
        </button>
      </div>

      <!-- Skills Dashboard -->
      <div v-else class="space-y-10">
        <!-- Add Skill Button -->
        <button @click="showAddModal = true" class="fixed bottom-10 right-10 px-4 py-2 bg-gradient-to-r from-[#90EE91] to-[#90EE91] text-white font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span class="text-sm">Add Skill Rating</span>
        </button>

        <!-- Skill Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="skill in skills"
            :key="(skill as any).cci_id"
            class="p-4 rounded-2xl shadow-lg transform hover:-translate-y-3 transition-all duration-500 cursor-pointer group"
            style="background-color: white;"
            @click="openUpdateModal(skill as any)"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-800 group-hover:text-[#90EE91] transition-colors duration-300">{{ (skill as any).main_skill }}</h3>
              <span class="px-3 py-1 bg-gradient-to-r from-[#90EE91] to-[#90EE91] text-white text-sm font-semibold rounded-full shadow-inner">level</span>
            </div>
            <div class="text-gray-600 font-medium text-base mb-3">{{ (skill as any).level }} <span class="text-sm text-gray-500">({{ getProgressPercentage((skill as any).level) }}%)</span></div>
            <div class="w-full bg-gray-200/60 rounded-full h-4 mt-3 overflow-hidden">
              <div
                class="bg-gradient-to-r from-[#90EE91] to-[#90EE91] h-4 rounded-full transition-all duration-700 ease-out"
                :style="{ width: getProgressPercentage((skill as any).level) + '%' }"
              ></div>
            </div>
            <div class="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
              <span class="text-[#90EE91] text-sm font-medium underline">Click to Update</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Skill Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50">
        <div class="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 hover:scale-103 w-full max-w-md">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">Add a New Skill</h3>
          <div class="relative mb-4">
            <div class="w-full p-3 border border-[#90EE91] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#90EE91] text-gray-700 text-base bg-white cursor-pointer" @click="isSkillDropdownOpen = !isSkillDropdownOpen" :class="{ 'ring-2 ring-[#90EE91]': isSkillDropdownOpen }">
              {{ newSkill.main_skill || 'Select a Skill' }}
              <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div v-if="isSkillDropdownOpen" class="absolute w-full mt-1 bg-white border border-[#90EE91] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50" @click="isSkillDropdownOpen = false">
              <div v-for="skill in availableSkills" :key="skill.id" @click="selectSkill(skill.mainSkill)" class="p-2 hover:bg-[#90EE91]/20 cursor-pointer">
                {{ skill.mainSkill }}
              </div>
            </div>
          </div>
          <select v-model="newSkill.level" class="w-full p-3 mb-4 border border-[#90EE91] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#90EE91] text-gray-700 text-base">
            <option value="" disabled selected>Select a Level</option>
            <option value="Expert">Expert</option>
            <option value="Proficient">Proficient</option>
            <option value="Advanced">Advanced</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
            <option value="Understanding">Understanding</option>
          </select>
            <div class="flex justify-end space-x-4">
            <button @click="showAddModal = false" class="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg text-base">Cancel</button>
            <button @click="handleAddSkill" class="px-6 py-2 bg-gradient-to-r from-[#90EE91] to-[#90EE91] text-white font-semibold rounded-lg text-base" :disabled="isLoadingSkills">
              Add Skill
            </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Skill Modal -->
      <div v-if="showUpdateModal" class="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50">
        <div class="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 hover:scale-103 w-full max-w-md">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">Update Skill</h3>
          <input v-model="updateSkill.main_skill" placeholder="Skill Name" class="w-full p-3 mb-4 border border-[#90EE91] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#90EE91] placeholder-gray-400 text-base" disabled />
          <select v-model="updateSkill.level" class="w-full p-3 mb-4 border border-[#90EE91] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#90EE91] text-gray-700 text-base">
            <option value="Expert">Expert</option>
            <option value="Proficient">Proficient</option>
            <option value="Advanced">Advanced</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
            <option value="Understanding">Understanding</option>
          </select>
            <div class="flex justify-end space-x-4">
            <button @click="showUpdateModal = false" class="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all duration-300 text-base">Cancel</button>
            <button @click="handleUpdateSkill" class="px-6 py-2 bg-gradient-to-r from-[#90EE91] to-[#90EE91] text-white font-semibold rounded-lg hover:shadow-3xl transition-all duration-300 text-base">Update Skill</button>
            </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="toastMessage" class="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#90EE91] text-white px-6 py-3 rounded-lg shadow-lg animate-toast z-50">
        {{ toastMessage }}
      </div>
    </div>

    <!-- No Permission -->
      <div v-if="isAuthenticated">
        <!-- Your authenticated content here -->
      </div>
      <div v-else class="text-center py-32 relative z-10">
        <p class="text-xl md:text-2xl text-gray-700">Access denied. Please contact your administrator.</p>
      </div>     
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import { useAuthStore } from '~/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
type User = { id: string; role: string } | null;
const router = useRouter();

const isLoading = ref(true);
const isLoadingSkills = ref(false);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const skills = ref([]);
const availableSkills = ref<{ id: string; mainSkill: string }[]>([]);
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const newSkill = ref({ cci_id: '', main_skill: '', level: '' });
const updateSkill = ref({ cci_id: '', main_skill: '', level: '' });
const toastMessage = ref(''); // State for toast message
const isSkillDropdownOpen = ref(false); // State for custom dropdown

const totalUsers = ref(0);
const totalMainSkills = ref(0);
const skillUserCounts = ref<{ mainSkill: string; user_count: string }[]>([]);

const userFirstName = computed(() => {
  const user = authStore.user as unknown as { firstName?: string; id?: string };
  if (user?.firstName) return user.firstName;
  return user?.id?.split('.')[0] || "Admin";
});

onMounted(async () => {
  isLoading.value = true;
  await authStore.initializeAuth();
  console.log('User Role:', (authStore.getUser as User)?.role);
  console.log('Access Token:', authStore.access_token);
  if (isAuthenticated.value) {
    if ((authStore.getUser as User)?.role === 'admin') {
      if (!authStore.access_token) {
        toastMessage.value = 'No valid token found. Please log in again.';
        await nextTick();
        setTimeout(() => { toastMessage.value = ''; router.push('/auth/sign-in'); }, 3000);
        return;
      }
      await fetchAdminData();
    } else if ((authStore.getUser as User)?.role === 'user') {
      await fetchSkills();
      await fetchAvailableSkills();
    }
  } else {
    setTimeout(() => router.push('/auth/sign-in'), 4000);
  }
  isLoading.value = false;
});

const fetchAdminData = async () => {
  try {
    console.log('Fetching admin data with token:', authStore.access_token);
    // Fetch total users
    const usersResponse = await axios.get('http://localhost:4000/user/total', {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    totalUsers.value = usersResponse.data.total;

    // Fetch total main skills
    const mainSkillsResponse = await axios.get('http://localhost:4000/mainskill/total', {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    totalMainSkills.value = mainSkillsResponse.data.total;

    // Fetch users per main skill
    const skillCountResponse = await axios.get('http://localhost:4000/user-skill-rating/skill-user-count', {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    skillUserCounts.value = skillCountResponse.data;
  } catch (error) {
    const err = error as any;
    console.error('Error fetching admin data:', err.response ? err.response.data : err.message);
    if (err.response?.status === 401) {
      toastMessage.value = 'Unauthorized: Please log in as an admin or refresh your token. Redirecting to login...';
      await nextTick();
      setTimeout(() => { toastMessage.value = ''; router.push('/auth/sign-in'); }, 3000);
    } else {
      toastMessage.value = 'Error fetching admin data';
      await nextTick();
      setTimeout(() => { toastMessage.value = ''; }, 3000);
    }
  }
};

const fetchSkills = async () => {
  try {
    const cci_id = (authStore.getUser as User)?.id || '';
    if (!cci_id) {
      console.error('No cci_id found in auth store');
      return;
    }
    const response = await axios.get(`http://localhost:4000/user-skill-rating/fetch-user-skills/${cci_id}`, {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    skills.value = response.data.map((skill: any) => ({
      cci_id: skill.cci_id,
      main_skill: skill.main_skill,
      level: skill.level,
    }));
  } catch (error) {
    const err = error as any;
    console.error('Error fetching skills:', err.response ? err.response.data : err.message);
    toastMessage.value = err.response?.status === 404 ? `No skill ratings found for CCI ID: ${(authStore.getUser as User)?.id}` : 'Error fetching skills';
    await nextTick();
    setTimeout(() => { toastMessage.value = ''; }, 3000);
  }
};

const fetchAvailableSkills = async () => {
  try {
    isLoadingSkills.value = true;
    const response = await axios.get(`http://localhost:4000/mainskill`, {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    availableSkills.value = response.data.map((skill: any) => ({
      id: skill.id,
      mainSkill: skill.mainSkill,
    }));
  } catch (error) {
    console.error('Error fetching available skills:', error);
    availableSkills.value = [];
  } finally {
    isLoadingSkills.value = false;
  }
};

const selectSkill = (mainSkill: string) => {
  newSkill.value.main_skill = mainSkill;
};

const handleAddSkill = async () => {
  try {
    if (!newSkill.value.main_skill || !newSkill.value.level) {
      toastMessage.value = 'Please select both a skill and a level';
      await nextTick();
      setTimeout(() => { toastMessage.value = ''; }, 3000);
      return;
    }
    newSkill.value.cci_id = (authStore.getUser as User)?.id || '';
    await axios.post('http://localhost:4000/user-skill-rating', newSkill.value, {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    showAddModal.value = false;
    const skillName = newSkill.value.main_skill;
    newSkill.value = { cci_id: '', main_skill: '', level: '' };
    isSkillDropdownOpen.value = false;
    await fetchSkills();
    toastMessage.value = `${skillName} skill added successfully`;
    await nextTick();
    setTimeout(() => { toastMessage.value = ''; }, 3000);
  } catch (error) {
    const err = error as any;
    console.error('Error adding skill:', err.response ? err.response.data : err.message);
    toastMessage.value = err.response?.status === 409 ? `${newSkill.value.main_skill} already exists on your dashboard` :
                        err.response?.status === 404 ? 'User or skill not found' :
                        err.response?.status === 500 ? 'Failed to save the record' : 'Error adding skill';
    await nextTick();
    setTimeout(() => { toastMessage.value = ''; }, 3000);
  }
};

const openUpdateModal = (skill: { cci_id: string; main_skill: string; level: string }) => {
  updateSkill.value = { ...skill, cci_id: (authStore.getUser as User)?.id || '' };
  showUpdateModal.value = true;
};

const handleUpdateSkill = async () => {
  try {
    if (!updateSkill.value.level) {
      toastMessage.value = 'Please select a level';
      await nextTick();
      setTimeout(() => { toastMessage.value = ''; }, 3000);
      return;
    }
    updateSkill.value.cci_id = (authStore.getUser as User)?.id || '';
    await axios.patch('http://localhost:4000/user-skill-rating', updateSkill.value, {
      headers: { Authorization: `Bearer ${authStore.access_token}` },
    });
    const skillName = updateSkill.value.main_skill;
    showUpdateModal.value = false;
    updateSkill.value = { cci_id: '', main_skill: '', level: '' };
    await fetchSkills();
    toastMessage.value = `${skillName} skill rating updated successfully`;
    await nextTick();
    setTimeout(() => { toastMessage.value = ''; }, 3000);
  } catch (error) {
    const err = error as any;
    console.error('Error updating skill:', err.response ? err.response.data : err.message);
    toastMessage.value = err.response?.status === 404 ? 'Record not found, please create a new one' :
                        err.response?.status === 500 ? 'Failed to update the record' : 'Error updating skill';
    await nextTick();
    setTimeout(() => { toastMessage.value = ''; }, 3000);
  }
};

const getProgressPercentage = (level: string) => {
  const levelMap: { [key: string]: number } = {
    'Expert': 100 ,
    'Proficient': 80,
    'Advanced': 60,
    'Intermediate': 40,
    'Basic': 30,
    'Understanding': 15,
  };
  return levelMap[level] || 0;
};
</script>

<style scoped>
/* Custom glassmorphism effect removed from cards, kept for modals */
.glass-card {
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}

/* Fade animation for numbers (no movement) */
@keyframes fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.animate-fade {
  animation: fade 3s infinite;
}

/* Fade-in animation for accordion content */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Toast animation */
@keyframes slideIn {
  from { transform: translate(-50%, 100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translate(-50%, 0); opacity: 1; }
  to { transform: translate(-50%, 100%); opacity: 0; }
}
.animate-toast {
  animation: slideIn 0.3s ease-out forwards, slideOut 0.3s ease-in forwards 3s;
}

/* Ensure modal is above other content */
.z-50 {
  z-index: 50;
}

/* Custom dropdown styling */
div[role="listbox"] {
  top: 100%; /* Ensure it opens below */
  left: 0;
  right: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .fixed.bottom-10.right-10 {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem 1.5rem;
  }
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
  .text-4xl {
    font-size: 2rem;
  }
  .text-2xl {
    font-size: 1.5rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .px-10.py-4 {
    padding: 0.75rem 1.5rem;
  }
  .text-left.pl-6 {
    padding-left: 1rem; /* Reduced padding for smaller screens */
  }
}
</style>

