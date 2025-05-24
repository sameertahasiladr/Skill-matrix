<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Card 1: Search Inputs -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Search Roadmap</h2>
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <!-- Role Dropdown -->
        <select v-model="selectedRole" class="border rounded px-3 py-2 w-full sm:w-auto">
          <option disabled value="">Select Role</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
        </select>

        <!-- Tags Multiselect -->
        <div class="w-full sm:w-80">
          <Multiselect
            v-model="selectedTags"
            :options="tags"
            track-by="id"
            label="tags"
            placeholder="Select tag(s)..."
            :multiple="true"
            :close-on-select="true"
          />
        </div>

        <!-- Search Button -->
        <button
          @click="fetchRoadmap"
          :disabled="!selectedRole || selectedTags.length === 0 || isLoading"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400 w-full sm:w-auto"
        >
          {{ isLoading ? 'Loading...' : 'Search' }}
        </button>
      </div>
    </div>

    <!-- Card 2: Roadmap Results -->
    <div v-if="roadmap || errorMessage" class="bg-white shadow-md rounded-lg p-6">
      <!-- Error Message -->
      <div v-if="errorMessage" class="text-red-500 mb-4">
        {{ errorMessage }}
      </div>

      <!-- Roadmap Data -->
      <div v-if="roadmap">
        <h2 class="text-xl font-bold mb-4">
          Roadmap for {{ roadmap.role }} (Tags: {{ roadmap.tags.join(', ') }})
        </h2>

        <!-- Common Tag Visualization -->
        <div v-if="isCommonTag && roadmap.groupedCommonSkills" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Common Skills</h3>
          
          <!-- Common Tag Flowchart -->
          <div class="flowchart-container">
            <div class="flex flex-col items-center">
              <div class="flowchart-node role-node">{{ selectedRole }}</div>
              <div class="flowchart-arrow"></div>
              <div class="flowchart-node common-node">COMMON</div>
              <div class="flowchart-branches">
                <div v-for="[groupName, skills] in Object.entries(roadmap.groupedCommonSkills)" :key="groupName" class="flowchart-branch">
                  <div class="flowchart-arrow"></div>
                  <div class="flowchart-node category-node">{{ groupName }}</div>
                  <div v-for="(skill, index) in skills" :key="`${groupName}-${skill.skills}-${index}`">
                    <div class="flowchart-arrow"></div>
                    <div class="flowchart-node skill-node">{{ skill.skills }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Non-Common Tag Visualization -->
        <div v-else-if="roadmap.skills?.length" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">{{ selectedTags[0]?.tags || '' }} Skills</h3>
          <div class="flowchart-container">
            <!-- Simple flowchart layout for non-common skills -->
            <div class="flex flex-col items-center">
              <div class="flowchart-node role-node">{{ selectedRole.toUpperCase() }}</div>
              <div class="flowchart-arrow"></div>
              <div class="flowchart-node tag-node">{{ selectedTags[0]?.tags?.toUpperCase() || '' }}</div>
              <div class="flowchart-arrow"></div>
              <div class="flowchart-branch">
                <div v-for="(skill, index) in roadmap.skills" :key="`${skill.skills}-${index}`">
                  <div class="flowchart-arrow"></div>
                  <div class="flowchart-node skill-node">{{ skill.skills }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback message -->
      <div v-else-if="!isLoading && !errorMessage" class="text-gray-500">
        No roadmap data available. Please search.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRuntimeConfig } from "#app";
import { useAuthStore } from "~/store/auth";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

const authStore = useAuthStore();
const config = useRuntimeConfig();

// Reactive state variables
const tags = ref([]);
const selectedRole = ref("");
const selectedTags = ref([]);
const roadmap = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");

// Check if the selected tag is "Common"
const isCommonTag = computed(() => {
  return selectedTags.value.some(tag => tag.tags.toLowerCase() === 'common');
});

// Watch for changes in selectedTags to clear roadmap data
watch(selectedTags, (newTags) => {
  if (newTags.length === 0) {
    roadmap.value = null;
    errorMessage.value = "";
  }
});

// Fetch the tags
async function fetchTags() {
  try {
    await authStore.initializeAuth();
    const token = authStore.access_token;
    if (!token) throw new Error("No access token found.");
    const fetchedTags = await $fetch(`${config.public.apiBase}/tags`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    tags.value = fetchedTags.sort((a, b) => a.tags.localeCompare(b.tags));
  } catch (err) {
    console.error("Error fetching tags:", err);
    if (err?.status === 401) {
      errorMessage.value = "Session expired. Please sign in again.";
      authStore.logout();
    } else {
      errorMessage.value = "Failed to load tags.";
    }
  }
}

// Fetch the roadmap
async function fetchRoadmap() {
  if (!selectedRole.value || selectedTags.value.length === 0) {
    errorMessage.value = "Please select a Role and at least one Tag.";
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";
  roadmap.value = null;

  try {
    const token = authStore.access_token;
    if (!token) throw new Error("No access token found.");

    const tagStr = selectedTags.value.map((tag) => tag.tags).join(",");
    const capitalizedRole = selectedRole.value.charAt(0).toUpperCase() + selectedRole.value.slice(1);

    const data = await $fetch(`${config.public.apiBase}/roadmaps/${selectedRole.value}/${tagStr}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Deduplicate and normalize groupedCommonSkills
    if (data.groupedCommonSkills) {
      for (const group in data.groupedCommonSkills) {
        const uniqueSkills = [];
        const seen = new Set();

        data.groupedCommonSkills[group].forEach((item) => {
          const skillName = item.SkillMatrix_skills || item.skills;
          if (!seen.has(skillName)) {
            seen.add(skillName);
            uniqueSkills.push({
              ...item,
              skills: skillName,
            });
          }
        });

        data.groupedCommonSkills[group] = uniqueSkills;
      }
    }

    // Normalize skills for non-common tags
    if (data.skills && Array.isArray(data.skills)) {
      const uniqueSkills = [];
      const seen = new Set();

      data.skills.forEach((item) => {
        const skillName = item.SkillMatrix_skills || item.skills;
        if (!seen.has(skillName)) {
          seen.add(skillName);
          uniqueSkills.push({
            ...item,
            skills: skillName,
          });
        }
      });

      data.skills = uniqueSkills;
    }

    roadmap.value = data;
  } catch (err) {
    console.error("Error fetching roadmap:", err);
    if (err?.status === 401) {
      errorMessage.value = "Session expired. Please sign in again.";
      authStore.logout();
    } else if (err?.status === 404) {
      const capitalizedRole = selectedRole.value.charAt(0).toUpperCase() + selectedRole.value.slice(1);
      const tagStr = selectedTags.value.map((tag) => tag.tags).join(", ");
      errorMessage.value = `Roadmap not found for ${capitalizedRole} for tag ${tagStr}`;
    } else {
      errorMessage.value = "Failed to load roadmap.";
    }
  } finally {
    isLoading.value = false;
  }
}

// On mount
fetchTags();
</script>

<style scoped>
/* Flowchart styling */
.flowchart-container {
  padding: 2rem;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.flowchart-node {
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  margin: 0.25rem;
  min-width: 120px;
  max-width: 400px;
  white-space: normal;
  word-wrap: break-word;
}

.role-node {
  background-color: #e5edff;
  border-color: #93c5fd;
}

.common-node {
  background-color: #e0e7ff;
  border-color: #a5b4fc;
}

.tag-node {
  background-color: #fef3c7;
  border-color: #fbbf24;
}

.category-node {
  background-color: #f5f3ff;
  border-color: #c4b5fd;
}

.skill-node {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  font-size: 0.875rem;
}

.flowchart-arrow {
  width: 2px;
  height: 1rem;
  background-color: #9ca3af;
  margin: 0 auto;
  position: relative;
}

.flowchart-arrow::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #9ca3af;
}

.flowchart-branches {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  width: 100%;
}

.flowchart-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
  max-width: 300px;
  flex: 1;
}

/* Card styling */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.rounded-lg {
  border-radius: 0.5rem;
}
</style>