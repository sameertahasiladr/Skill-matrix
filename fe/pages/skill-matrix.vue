<template>
  <div class="space-y-6">
    <!-- Loading State during Auth Initialization -->
    <div v-if="isLoading && !isAuthenticated" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    <!-- Main Content -->
    <div v-else-if="isAuthenticated" class="space-y-6">
      <!-- CARD 1: Heading & General Description -->
      <div class="bg-white rounded shadow p-8 space-y-6">
        <h1 class="text-2xl font-bold">
          Skill Matrix
          <span v-if="designation && role" class="ml-3 text-xl font-bold text-gray-600">
            {{ designation }} - {{ role }}
          </span>
        </h1>
        <p v-if="generalDescription" class="text-gray-700 leading-relaxed mb-6">
          {{ generalDescription }}
        </p>
      </div>

      <!-- CARD 2: Tags, Buttons, Collapsible Sections, PDF Preview -->
      <div class="bg-white rounded shadow p-6 space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <label class="font-semibold text-gray-600 whitespace-nowrap">Select Tags:</label>
            <div class="relative w-80 flex-shrink-0">
              <Multiselect
                v-model="selectedTags"
                :options="allTags"
                track-by="tags"
                label="tags"
                placeholder="Pick tags..."
                :multiple="true"
                :close-on-select="true"
                :clear-on-select="true"
                open-direction="below"
                menu-class="z-50"
                class="w-full"
                :tag-limit="3"
              />
            </div>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700 flex-grow sm:flex-grow-0"
              @click="loadSkills"
              :disabled="isLoading || isExporting"
            >
              {{ isLoading ? 'Loading...' : 'Load Matrix' }}
            </button>
            <button
              class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700 flex-grow sm:flex-grow-0"
              @click="exportToPDF"
              :disabled="isLoading || isExporting"
            >
              {{ isExporting ? 'Exporting...' : 'Export PDF' }}
            </button>
          </div>
        </div>

        <!-- Consolidated Loading Indicators -->
        <div class="space-y-2">
          <div v-if="isLoading" class="text-blue-600 flex items-center gap-2">
            <svg
              class="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading skill matrix. This may take a moment...</span>
          </div>
          <div v-if="isExporting" class="text-blue-600 flex items-center gap-2">
            <svg
              class="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Generating PDF. This may take a moment...</span>
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>

        <!-- Skill Matrix Tables -->
        <div v-if="!isLoading && (singleGroupSkills.length || Object.keys(commonSkillSections).length)" class="space-y-4">
          <div v-if="singleGroupSkills.length" class="bg-gray-50 rounded">
            <Accordion :title="singleGroupHeading" class="mb-2">
              <div class="accordion-content">
                <p class="text-gray-700 mb-2 font-semibold p-2">
                  {{ singleGroupDescription || 'No description available.' }}
                </p>
                <div class="overflow-x-auto max-w-[calc(100vw-50px)]">
                  <table class="min-w-[800px] table-auto border-collapse">
                    <thead class="bg-gray-100 border-b">
                      <tr>
                        <th v-for="header in headers" :key="header" class="px-4 py-2 font-semibold text-left">
                          {{ header }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(skill, sIndex) in singleGroupSkills" :key="sIndex" class="border-b hover:bg-gray-50">
                        <td class="px-4 py-2 align-top">{{ skill.name }}</td>
                        <td class="px-4 py-2 align-top" v-html="parseMarkdown(skill.description)"></td>
                        <td class="px-4 py-2 align-top">{{ skill.level }}</td>
                        <td class="px-4 py-2 align-top" v-html="parseMarkdown(skill.responsibilities)"></td>
                        <td class="px-4 py-2 align-top" v-html="parseMarkdown(skill.examples)"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Accordion>
          </div>

          <div v-if="Object.keys(commonSkillSections).length" class="bg-gray-50 rounded">
            <Accordion v-for="(commonArr, mainSkillName) in commonSkillSections" :key="mainSkillName" :title="mainSkillName" class="mb-2">
              <div class="accordion-content">
                <p class="text-gray-700 mb-2 font-semibold p-2">
                  {{ commonDescriptions[mainSkillName] || "No description available." }}
                </p>
                <div class="overflow-x-auto max-w-[calc(100vw-50px)]">
                  <table class="min-w-[800px] table-auto border-collapse">
                    <thead class="bg-gray-100 border-b">
                      <tr>
                        <th v-for="header in headers" :key="header" class="px-4 py-2 font-semibold text-left">
                          {{ header }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(skill, sIndex) in commonArr" :key="sIndex" class="border-b hover:bg-gray-50">
                        <td class="px-4 py-2 align-top">{{ skill.name }}</td>
                        <td class="px-4 py-2 align-top" v-html="parseMarkdown(skill.description)"></td>
                        <td class="px-4 py-2 align-top">{{ skill.level }}</td>
                        <td class="px-4 py-2 align-top" v-html="parseMarkdown(skill.responsibilities)"></td>
                        <td class="px-4 py-2 align-top" v-html="parseMarkdown(skill.examples)"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

        <!-- PDF Preview -->
        <div v-if="pdfUrl" class="border p-2">
          <h3 class="text-lg font-semibold mb-2">PDF Preview</h3>
          <iframe :src="pdfUrl" class="w-full h-96" frameborder="0"></iframe>
          <div class="mt-2">
            <a :href="pdfUrl" :download="downloadFileName" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Download PDF
            </a>
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

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRuntimeConfig, navigateTo } from "#app";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import Accordion from "~/components/Accordion.vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();
const headers = ["Skill", "Description", "Level", "Responsibilities", "Examples"];

const isLoading = ref(true); // Loading state for auth initialization or skill loading
const isAuthenticated = computed(() => authStore.isAuthenticated);
const designation = ref("");
const role = ref("");
const allTags = ref<any[]>([]);
const selectedTags = ref<any[]>([]);
const singleGroupSkills = ref<any[]>([]);
const singleGroupDescription = ref<string>("");
const singleGroupHeading = ref<string>("All Selected Tags");
const commonSkillSections = ref<Record<string, any[]>>({});
const commonDescriptions = ref<Record<string, string>>({});
const generalDescription = ref<string>("");
const errorMessage = ref("");
const pdfUrl = ref<string | null>(null);
const isExporting = ref(false);

function parseMarkdown(markdownText: string): string {
  if (!markdownText) return "";
  const dirtyHtml: string = marked(markdownText, { async: false });
  return DOMPurify.sanitize(dirtyHtml);
}

const downloadFileName = computed(() => {
  const tagNames = selectedTags.value.map((tag: any) => tag.tags).join("-");
  return `${designation.value}-${role.value}-${tagNames}.pdf`.replace(/\s+/g, "");
});

onMounted(async () => {
  console.log("SkillMatrix: Mounting component...");
  isLoading.value = true;

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlDesignation = urlParams.get('designation');
  const urlRole = urlParams.get('role');
  const urlTags = urlParams.get('tags')?.split(',').map(tag => tag.trim());

  // Set initial values from URL params or localStorage
  designation.value = urlDesignation || localStorage.getItem("chosenDesignation") || "";
  role.value = urlRole || localStorage.getItem("chosenRole") || "";

  await authStore.initializeAuth();
  isLoading.value = false;

  if (!authStore.isAuthenticated) {
    setTimeout(() => {
      navigateTo('/auth/sign-in');
    }, 3000);
    return;
  }

  await fetchTags();

  if (urlTags && urlTags.length > 0 && allTags.value.length > 0) {
    const matchedTags = allTags.value.filter(tag => 
      urlTags.some(urlTag => urlTag.toLowerCase() === tag.tags.toLowerCase())
    );
    if (matchedTags.length > 0) {
      selectedTags.value = matchedTags;
      await loadSkills();
    } else {
      console.log("No matching tags found for URL parameters:", urlTags);
      const commonObj = allTags.value.find(t => t.tags.toLowerCase() === "common");
      if (commonObj) {
        selectedTags.value = [commonObj];
        await loadSkills();
      }
    }
  } else if (allTags.value.length > 0 && selectedTags.value.length === 0) {
    const commonObj = allTags.value.find(t => t.tags.toLowerCase() === "common");
    if (commonObj) {
      selectedTags.value = [commonObj];
      await loadSkills();
    }
  }
});

watch(selectedTags, (newTags, oldTags) => {
  if (newTags.length < oldTags.length) {
    resetMatrixData();
  }
});

watch([designation, role, selectedTags], ([newDes, newRole, newTags]) => {
  const params = new URLSearchParams();
  if (newDes) params.set('designation', newDes);
  if (newRole) params.set('role', newRole);
  if (newTags.length > 0) {
    const tagString = newTags.map(tag => tag.tags).join(',');
    params.set('tags', tagString);
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, document.title, newUrl);
});

async function fetchTags() {
  try {
    const token = authStore.access_token;
    console.log("Fetching tags with token:", token);
    if (!token) {
      console.error("No access token found. User may not be authenticated.");
      errorMessage.value = "Please sign in to access tags.";
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
      return;
    }

    const config = useRuntimeConfig();
    const res = await $fetch<any[]>(`${config.public.apiBase}/tags`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    console.log("Tags fetched successfully:", res);

    res.sort((a, b) => a.tags.localeCompare(b.tags));
    allTags.value = res.map(t => ({
      ...t,
      tags: t.tags.charAt(0).toUpperCase() + t.tags.slice(1),
    }));
  } catch (err) {
    console.error("Failed to fetch tags:", err);
    if ((err as any)?.status === 401) {
      errorMessage.value = "Session expired. Please sign in again.";
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
    } else {
      errorMessage.value = "Failed to load tags.";
    }
  }
}

async function loadSkills() {
  try {
    isLoading.value = true;
    errorMessage.value = "";
    resetMatrixData();
    console.log("Loading skills with designation:", designation.value, "role:", role.value, "tags:", selectedTags.value);

    if (!designation.value || !role.value) {
      throw new Error("Please select designation & role first");
    }
    if (selectedTags.value.length === 0) {
      throw new Error("Please select at least one tag!");
    }

    const token = authStore.access_token;
    if (!token) {
      console.error("No token available for loading skills.");
      errorMessage.value = "Please sign in to load skills.";
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
      return;
    }

    const config = useRuntimeConfig();
    const tagsParam = selectedTags.value
      .map((obj) => (obj.tags.toLowerCase() === "common" ? "common" : obj.tags))
      .join(",");
    const url = `${config.public.apiBase}/pdf/data/load-matrix/${encodeURIComponent(role.value)}/${encodeURIComponent(designation.value)}/${encodeURIComponent(tagsParam)}`;
    console.log("Fetching skills from URL:", url);

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
    const fetchData = $fetch<any>(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const [res] = await Promise.all([fetchData, minLoadingTime]);
    console.log("Skills data fetched:", res);
    processSkillsData(res);
  } catch (err: any) {
    console.error("Error loading skills:", err);
    if (err?.status === 401) {
      errorMessage.value = "Session expired. Please sign in again.";
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
    } else if (err?.status === 404) {
      const typedTags = selectedTags.value.map(t => t.tags).join(", ");
      errorMessage.value = `${designation.value} - ${role.value} - ${typedTags} skill data is not available.`;
    } else {
      handleError(err, "Failed to load skills");
    }
  } finally {
    isLoading.value = false;
  }
}

async function exportToPDF() {
  try {
    isExporting.value = true;
    errorMessage.value = "";
    pdfUrl.value = null;
    console.log("Exporting PDF with designation:", designation.value, "role:", role.value, "tags:", selectedTags.value);

    if (!designation.value || !role.value) {
      throw new Error("Select designation & role first!");
    }
    if (selectedTags.value.length === 0) {
      throw new Error("Please select at least one tag!");
    }

    const token = authStore.access_token;
    if (!token) {
      console.error("No token available for exporting PDF.");
      errorMessage.value = "Please sign in to export PDF.";
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
      return;
    }

    const config = useRuntimeConfig();
    const tagsParam = selectedTags.value
      .map((obj) => (obj.tags.toLowerCase() === "common" ? "common" : obj.tags))
      .join(",");
    const pdfUrlString = `${config.public.apiBase}/pdf/skills/${encodeURIComponent(role.value)}/${encodeURIComponent(designation.value)}/${encodeURIComponent(tagsParam)}`;
    console.log("Fetching PDF from URL:", pdfUrlString);

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
    const fetchPDF = fetch(pdfUrlString, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const [response] = await Promise.all([fetchPDF, minLoadingTime]);
    if (!response.ok) {
      if (response.status === 404) {
        const typedTags = selectedTags.value.map(t => t.tags).join(", ");
        throw new Error(`${designation.value} - ${role.value} - ${typedTags} skill data is not available.`);
      }
      if (response.status === 401) {
        errorMessage.value = "Session expired. Please sign in again.";
        authStore.logout();
        setTimeout(() => {
          navigateTo('/auth/sign-in');
        }, 3000);
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    pdfUrl.value = URL.createObjectURL(blob);
    console.log("PDF generated successfully:", pdfUrl.value);
  } catch (err: any) {
    console.error("Error exporting PDF:", err);
    errorMessage.value = err.message || "PDF generation failed";
  } finally {
    isExporting.value = false;
  }
}

function resetMatrixData() {
  pdfUrl.value = null;
  singleGroupSkills.value = [];
  singleGroupDescription.value = "";
  singleGroupHeading.value = "All Selected Tags";
  commonSkillSections.value = {};
  commonDescriptions.value = {};
  generalDescription.value = "";
  errorMessage.value = "";
}

function processSkillsData(res: any) {
  if (!res || (Array.isArray(res.skills) && res.skills.length === 0 && !res.groupedCommonSkills)) {
    const typedTags = selectedTags.value.map(t => t.tags).join(", ");
    errorMessage.value = `${designation.value} - ${role.value} - ${typedTags} skill data is not available.`;
    return;
  }

  if (res.generalDescription) {
    generalDescription.value = res.generalDescription;
  }
  const seen = new Set<string>();
  const singleArr: any[] = [];
  if (Array.isArray(res.skills)) {
    res.skills.forEach((skill: any) => {
      if (!seen.has(skill.id)) {
        seen.add(skill.id);
        singleArr.push(mapSkill(skill));
      }
    });
  }
  singleGroupSkills.value = singleArr;
  if (res.mainSkillDescription) {
    singleGroupDescription.value = res.mainSkillDescription;
  }
  const uniqueNames = new Set<string>();
  singleArr.forEach((s) => {
    if (s.mainSkillName) uniqueNames.add(s.mainSkillName);
  });
  if (uniqueNames.size === 1) {
    singleGroupHeading.value = uniqueNames.values().next().value || "";
  } else if (uniqueNames.size > 1) {
    singleGroupHeading.value = `Multiple MainSkills: ${[...uniqueNames].join(", ")}`;
  }

  if (res.groupedCommonSkills) {
    Object.entries(res.groupedCommonSkills).forEach(([msName, arr]) => {
      commonSkillSections.value[msName] = (arr as any[]).map(mapSkill);
    });
  }
  if (res.commonSkillDescriptions) {
    Object.entries(res.commonSkillDescriptions).forEach(([msName, desc]) => {
      commonDescriptions.value[msName] = Array.isArray(desc) ? desc.join(", ") : desc as string;
    });
  }

  if (!singleArr.length && Object.keys(commonSkillSections.value).length === 0) {
    const typedTags = selectedTags.value.map(t => t.tags).join(", ");
    errorMessage.value = `${designation.value} - ${role.value} - ${typedTags} skill data is not available.`;
  }
}

function mapSkill(skill: any) {
  return {
    id: skill.id,
    name: skill.skills || skill.name || "N/A",
    description: skill.description || "N/A",
    level: skill.levels?.level || skill.level || "N/A",
    responsibilities: skill.responsibilities || "N/A",
    examples: skill.example || "N/A",
    mainSkillName: skill.mainSkill?.mainSkill ?? null,
  };
}

function handleError(err: any, context: string) {
  errorMessage.value = err.message || err.data?.message || "Something went wrong";
  console.error(`${context}:`, err);
}
</script>

<style scoped>
@import "vue-multiselect/dist/vue-multiselect.css";
.accordion-content {
  max-height: 70vh;
  overflow-y: auto;
}

th,
td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  word-break: break-word;
  min-width: 120px;
}

.multiselect {
  min-height: 42px;
}

.z-50 {
  z-index: 9999;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #9ca3af;
}

@media (max-width: 640px) {
  .max-w-\[calc\(100vw-50px\)\] { max-width: calc(100vw - 50px); }
  .min-w-\[800px\] { min-width: 800px; }
}
</style>