<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <transition name="fade">
      <div
        v-if="showPopup"
        class="fixed bottom-4 right-4 px-4 py-2 rounded shadow z-50"
        :class="popupType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ popupMessage }}
      </div>
    </transition>

    <!-- Loading State during Auth Initialization -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Main Content (only for admins) -->
    <div v-else-if="isAdmin" class="bg-white rounded-lg shadow p-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Edit Skill Matrix</h1>
      <div class="flex flex-nowrap items-end space-x-4 mb-4 relative">
        <div class="flex flex-col w-96">
          <label class="text-sm font-semibold mb-1">Select Skill</label>
          <Multiselect
            v-model="selectedTags"
            :options="allTags"
            track-by="tags"
            label="tags"
            :custom-label="tagLabel"
            placeholder="Pick or type tags..."
            :multiple="true"
            :close-on-select="true"
            :clear-on-select="true"
            :allowEmpty="true"
            class="my-multiselect w-full border rounded"
            :disabled="!isAdmin"
          />
        </div>
        <div class="flex flex-col w-72">
          <label class="text-sm font-semibold mb-1">Select Designation</label>
          <select
            v-model="selectedDesignation"
            :class="{'text-gray-400': !selectedDesignation, 'text-gray-900': selectedDesignation}"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="!isAdmin"
          >
            <option value="" disabled>Select Designation</option>
            <option v-for="desig in designations" :key="desig" :value="desig">
              {{ desig }}
            </option>
          </select>
        </div>
        <div class="flex flex-col w-72">
          <label class="text-sm font-semibold mb-1">Select Role</label>
          <select
            v-model="selectedRole"
            :class="{'text-gray-400': !selectedRole, 'text-gray-900': selectedRole}"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="!isAdmin"
          >
            <option value="" disabled>Select Role</option>
            <option v-for="r in roles" :key="r" :value="r">
              {{ r }}
            </option>
          </select>
        </div>
        <div class="flex-none">
          <button
            @click="searchSkills"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            :disabled="!isAdmin"
          >
            Search
          </button>
        </div>
      </div>

      <p class="text-sm text-gray-600 mb-6">
        <span class="font-medium">Note:</span>
        You can set the visibility of each skill by using the checkboxes provided in the table.
      </p>

      <div v-if="errorText" class="mb-4 text-red-600">{{ errorText }}</div>

      <!-- Loading State during Search -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">Order</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">Skill</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">Description</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">Level</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">Responsibilities</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200">Examples</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Visible</th>
              </tr>
            </thead>
            <draggable
              v-model="allItems"
              item-key="id"
              tag="tbody"
              @start="onDragStart"
              @end="onDragEnd"
              class="divide-y divide-gray-200"
              :disabled="!isAdmin"
            >
              <template #item="{ element, index }">
                <tr>
                  <template v-if="element.type === 'heading'">
                    <td colspan="7" class="bg-gray-50 font-bold p-2 drag-handle cursor-move">
                      {{ element.groupName }}
                    </td>
                  </template>
                  <template v-else>
                    <td class="px-4 py-2 whitespace-nowrap border-r border-gray-200">
                      <span class="inline-flex items-center cursor-move drag-handle">
                        {{ element.orderNo }}
                        <span class="ml-2 text-gray-400 text-sm">☰</span>
                      </span>
                    </td>
                    <td class="px-4 py-2 border-r border-gray-200">{{ element.name }}</td>
                    <td class="px-4 py-2 border-r border-gray-200">
                      <div v-html="formatMarkdown(bulletify(element.description))"></div>
                    </td>
                    <td class="px-4 py-2 border-r border-gray-200">{{ element.level }}</td>
                    <td class="px-4 py-2 border-r border-gray-200">
                      <div v-html="formatMarkdown(bulletify(element.responsibilities))"></div>
                    </td>
                    <td class="px-4 py-2 border-r border-gray-200">
                      <div v-html="formatMarkdown(bulletify(element.examples))"></div>
                    </td>
                    <td class="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        :checked="element.visible"
                        @change="toggleVisibility(index)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        :disabled="!isAdmin"
                      />
                    </td>
                  </template>
                </tr>
              </template>
            </draggable>
          </table>
        </div>

        <div class="flex justify-end mt-4">
          <button v-if="hasChanges" @click="saveChanges" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" :disabled="!isAdmin">
            Save
          </button>
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
import { ref, onMounted, computed, watch } from 'vue';
import { navigateTo } from '#app';
import draggable from 'vuedraggable';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { marked } from 'marked';
import { useAuthStore } from '~/store/auth';

// Initialize auth store synchronously
const authStore = useAuthStore();

// Declare refs at the top to avoid usage before declaration
const isAdmin = computed(() => authStore.isAdmin);
const isLoading = ref(true); // Loading state for auth initialization
const selectedDesignation = ref<string>('');
const selectedRole = ref<string>('');
const selectedTags = ref<any[]>([]);
const originalItems = ref<any[]>([]); // Store original state to detect changes

onMounted(async () => {
  isLoading.value = true; // Start loading during auth initialization
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlDesignation = urlParams.get('designation');
  const urlRole = urlParams.get('role');
  const urlTags = urlParams.get('tags')?.split(',').map(tag => tag.trim());

  await authStore.initializeAuth();
  isLoading.value = false; // Stop loading once auth is ready

  if (!authStore.isAuthenticated) {
    // Show message for 3 seconds before redirecting
    setTimeout(() => {
      navigateTo('/auth/sign-in');
    }, 3000);
  } else if (!isAdmin.value) {
    // Show message for 3 seconds before redirecting
    setTimeout(() => {
      navigateTo('/');
    }, 3000);
  } else {
    await fetchTags();

    // Set values from URL parameters if present
    if (urlDesignation) selectedDesignation.value = urlDesignation;
    if (urlRole) selectedRole.value = urlRole;
    if (urlTags && urlTags.length > 0 && allTags.value.length > 0) {
      const matchedTags = allTags.value.filter(tag => 
        urlTags.some(urlTag => urlTag.toLowerCase() === tag.tags.toLowerCase())
      );
      if (matchedTags.length > 0) {
        selectedTags.value = matchedTags;
        await searchSkills(); // Automatically search if all parameters are provided
      }
    }
  }
});

// Watch for changes in selections and update URL
watch([selectedDesignation, selectedRole, selectedTags], ([newDes, newRole, newTags]) => {
  const params = new URLSearchParams();
  if (newDes) params.set('designation', newDes);
  if (newRole) params.set('role', newRole);
  if (newTags.length > 0) {
    const tagString = newTags.map((tag: any) => tag.tags).join(',');
    params.set('tags', tagString);
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, document.title, newUrl);
});

// Watch for tag unselection and clear data
watch(selectedTags, (newTags, oldTags) => {
  if (newTags.length < oldTags.length) {
    allItems.value = [];
    originalItems.value = [];
    errorText.value = '';
  }
});

const API_BASE_URL = 'http://localhost:4000';

const designation = ref('');
const role = ref('');
const loading = ref(false); // Loading state for search operation
const hasResults = ref(true);
const allTags = ref<any[]>([]);
const designations = ref(['Junior Developer', 'Senior Developer', 'Developer']);
const roles = ref(['Frontend', 'Backend', 'QA']);
const allItems = ref<any[]>([]);
const errorText = ref('');
const showPopup = ref(false);
const popupMessage = ref('');
const popupType = ref<'success' | 'error'>('success');
let popupTimer: any = null;

// Computed property to detect changes
const hasChanges = computed(() => {
  return !arraysEqual(allItems.value, originalItems.value);
});

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].type === 'skill' && arr2[i].type === 'skill') {
      if (arr1[i].visible !== arr2[i].visible || arr1[i].orderNo !== arr2[i].orderNo) {
        return false;
      }
    }
  }
  return true;
}

function showPopupMessage(message: string, type: 'success' | 'error') {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    showPopup.value = false;
  }, 6000); // Increased from 4000ms to 6000ms
}

function clearError() {
  errorText.value = '';
}

const loadingDelay = 2000;
let oldItems: any[] | null = null;

async function fetchTags() {
  if (!isAdmin.value) return; // Prevent fetch if not admin
  try {
    const token = authStore.access_token;
    console.log("Fetching tags with token:", token);
    if (!token) {
      console.error('No access token found. User may not be authenticated.');
      errorText.value = 'Please sign in to access tags.';
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Session expired.');
      }
      throw new Error('Failed to fetch tags');
    }

    const data = await response.json();
    console.log("Tags fetched successfully:", data);
    allTags.value = data.sort((a: any, b: any) => a.tags.localeCompare(b.tags));
  } catch (err) {
    console.error('Failed to load tags:', err);
    errorText.value = err instanceof Error ? err.message : 'Failed to load tags.';
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
    }
  }
}

async function searchSkills() {
  if (!isAdmin.value) {
    errorText.value = 'You do not have permission to perform this action.';
    return; // Prevent search for non-admin users
  }

  clearError();
  const missing: string[] = [];
  if (!selectedDesignation.value) missing.push('designation');
  if (!selectedRole.value) missing.push('role');
  if (!selectedTags.value.length) missing.push('tag');

  if (missing.length) {
    errorText.value = `Please select ${missing.join(', ')}.`;
    return;
  }

  loading.value = true; // Start loading when search begins
  hasResults.value = false;
  allItems.value = [];
  await new Promise(resolve => setTimeout(resolve, loadingDelay));

  const token = authStore.access_token;
  if (!token) {
    errorText.value = 'Please sign in to search skills.';
    authStore.logout();
    setTimeout(() => {
      navigateTo('/auth/sign-in');
    }, 3000);
    loading.value = false; // Stop loading if authentication fails
    return;
  }

  const finalTags = selectedTags.value.map((t: any) => t.tags).join(', ');
  const roleEncoded = encodeURIComponent(selectedRole.value ? selectedRole.value.trim() : '');
  const designationEncoded = encodeURIComponent((selectedDesignation.value || '').trim());
  const tagsEncoded = encodeURIComponent(finalTags);
  const url = `${API_BASE_URL}/pdf/data/skills/${roleEncoded}/${designationEncoded}/${tagsEncoded}`;
  console.log('Searching skills with URL:', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized: Session expired.');
      }
      if (res.status === 404) {
        errorText.value = `${selectedDesignation.value} - ${selectedRole.value} - ${finalTags} skill data is not available.`;
        loading.value = false; // Stop loading on 404
        return;
      }
      throw new Error('Failed to fetch skills');
    }

    const data = await res.json();
    console.log("Skills fetched successfully:", data);
    const normalItems = Array.isArray(data.skills) ? data.skills : [];
    const grouped = data.groupedCommonSkills || {};

    if (!normalItems.length && !Object.keys(grouped).length) {
      errorText.value = 'No skills data found.';
      loading.value = false; // Stop loading if no data
      return;
    }

    hasResults.value = true;
    const combined: any[] = [];
    loading.value = true; //做法
    for (const dbSkill of normalItems) {
      combined.push({
        id: dbSkill.id,
        type: 'skill',
        orderNo: dbSkill.orderNo,
        visible: dbSkill.isVisible,
        name: dbSkill.skills || dbSkill.name || 'N/A',
        description: Array.isArray(dbSkill.description) ? dbSkill.description : [dbSkill.description || ''],
        level: dbSkill.levels?.level || dbSkill.level || 'N/A',
        responsibilities: Array.isArray(dbSkill.responsibilities) ? dbSkill.responsibilities : [dbSkill.responsibilities || ''],
        examples: Array.isArray(dbSkill.example) ? dbSkill.example : [dbSkill.example || ''],
      });
    }
    for (const [groupName, arr] of Object.entries(grouped)) {
      combined.push({ id: `heading-${groupName}`, type: 'heading', groupName });
      for (const item of arr as any[]) {
        combined.push({
          id: item.id,
          type: 'skill',
          orderNo: item.orderNo,
          visible: item.isVisible,
          name: item.skills || item.name || 'N/A',
          description: Array.isArray(item.description) ? item.description : [item.description || ''],
          level: item.levels?.level || item.level || 'N/A',
          responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [item.responsibilities || ''],
          examples: Array.isArray(item.example) ? item.example : [item.example || ''],
        });
      }
    }
    loading.value = false; // Stop loading after nested loops complete
    allItems.value = combined;
    originalItems.value = JSON.parse(JSON.stringify(combined)); // Store original state
  } catch (err) {
    console.error('Search skills error:', err);
    errorText.value = err instanceof Error ? err.message : 'Failed to load skills.';
    loading.value = false; // Stop loading on error
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
    }
  } finally {
    if (loading.value) loading.value = false; // Ensure loading stops
  }
}

function onDragStart() {
  if (!isAdmin.value) return;
  oldItems = JSON.parse(JSON.stringify(allItems.value));
}

function onDragEnd(evt: any) {
  if (!isAdmin.value) return;
  if (!oldItems) return;
  const oldIndex = evt.oldIndex;
  const newIndex = evt.newIndex;
  if (oldIndex === newIndex) return;
  const itemA = oldItems[oldIndex];
  const itemB = oldItems[newIndex];
  const newArr = allItems.value;
  const newAIndex = newArr.findIndex(x => x.id === itemA.id);
  const newBIndex = newArr.findIndex(x => x.id === itemB.id);
  if (newAIndex !== -1 && newBIndex !== -1) {
    const temp = newArr[newAIndex].orderNo;
    newArr[newAIndex].orderNo = newArr[newBIndex].orderNo;
    newArr[newBIndex].orderNo = temp;
  }
}

function toggleVisibility(index: number) {
  if (!isAdmin.value) return;
  const item = allItems.value[index];
  if (item && item.type === 'skill') {
    item.visible = !item.visible;
  }
}

async function saveChanges() {
  if (!isAdmin.value) {
    showPopupMessage('You do not have permission to save changes.', 'error');
    return;
  }

  try {
    const token = authStore.access_token;
    if (!token) {
      showPopupMessage('Please sign in to save changes.', 'error');
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
      return;
    }

    loading.value = true; // Start loading for save operation
    const skillRows = allItems.value.filter((it) => it.type === 'skill');
    const payload = skillRows.map((s) => ({
      id: s.id,
      orderNo: s.orderNo,
      isVisible: s.visible,
    }));
    console.log('Saving changes with payload:', payload);

    const res = await fetch(`${API_BASE_URL}/skills/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized: Session expired.');
      }
      throw new Error('Failed to update skills');
    }

    console.log("Skills updated successfully");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showPopupMessage('Skills updated successfully!', 'success');
    originalItems.value = JSON.parse(JSON.stringify(allItems.value)); // Update original state after save
  } catch (err) {
    console.error('Save changes error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update skills.';
    showPopupMessage(errorMessage, 'error');
    if (err instanceof Error && err.message.includes('Unauthorized')) {
      authStore.logout();
      setTimeout(() => {
        navigateTo('/auth/sign-in');
      }, 3000);
    }
  } finally {
    loading.value = false; // Stop loading after save completes
  }
}

function formatMarkdown(mdString: string) {
  return marked.parse(mdString);
}

function bulletify(arr: string[]) {
  if (!arr.length) return '';
  return arr.map((item) => `- ${item}`).join('\n');
}

function capitalizeWord(word: string) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function tagLabel(option: any) {
  return option.tags ? capitalizeWord(option.tags) : '';
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.drag-handle {
  cursor: move;
}
.my-multiselect .multiselect__tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  overflow-x: auto;
}
</style>