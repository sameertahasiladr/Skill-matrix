<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRuntimeConfig, navigateTo } from "#app";
import Multiselect from "vue-multiselect";
import { marked } from "marked";
import DOMPurify from "dompurify";

const isLoading = ref(true);
const token = ref<string | null>(null);
const allTags = ref<any[]>([]);
const selectedTags = ref<any[]>([]);
const errorMessage = ref("");
const pdfUrl = ref<string | null>(null);
const isExporting = ref(false);

function parseMarkdown(markdownText: string): string {
  if (!markdownText) return "";
  const dirtyHtml = marked(markdownText, { async: false });
  return DOMPurify.sanitize(dirtyHtml);
}

const downloadFileName = computed(() => {
  const tagNames = selectedTags.value.map((tag: any) => tag.tags).join("-");
  return `skill-matrix-${tagNames}.pdf`.replace(/\s+/g, "");
});

onMounted(async () => {
  isLoading.value = true;
  console.log('PublicSkillMatrix: onMounted started');

  const urlParams = new URLSearchParams(window.location.search);
  token.value = urlParams.get('token');

  console.log('URL Params:', { token: token.value });

  if (!token.value) {
    errorMessage.value = "No token provided in the URL.";
    isLoading.value = false;
    return;
  }

  await fetchTags();
  isLoading.value = false;

  // Set "Common" as default selected tag
  const commonTag = allTags.value.find(tag => tag.tags.toLowerCase() === "common");
  if (commonTag) {
    selectedTags.value = [commonTag];
  }
});

// Clear PDF data when tags change
watch(selectedTags, () => {
  pdfUrl.value = null;
  errorMessage.value = "";
});

async function fetchTags() {
  try {
    isLoading.value = true;
    const config = useRuntimeConfig();
    const res = await $fetch<any[]>(`${config.public.apiBase}/tags`);
    res.sort((a, b) => a.tags.localeCompare(b.tags));
    allTags.value = res.map(t => ({
      ...t,
      tags: t.tags.charAt(0).toUpperCase() + t.tags.slice(1),
    }));
    console.log('Tags Fetched:', allTags.value);
  } catch (err: any) {
    errorMessage.value = "Failed to load tags.";
    console.error('Fetch Tags Error:', err.message);
  } finally {
    isLoading.value = false;
  }
}

async function exportToPDF() {
  try {
    isExporting.value = true;
    errorMessage.value = "";
    pdfUrl.value = null;

    if (selectedTags.value.length === 0) {
      throw new Error("Please select at least one tag.");
    }

    if (!token.value) {
      throw new Error("No valid token available.");
    }

    const config = useRuntimeConfig();
    const tagsParam = selectedTags.value
      .map((obj) => (obj.tags.toLowerCase() === "common" ? "common" : obj.tags))
      .join(",");
    const pdfUrlString = `${config.public.apiBase}/pdf/public/skills?token=${encodeURIComponent(token.value)}&tags=${encodeURIComponent(tagsParam)}`;

    console.log('Exporting PDF from:', pdfUrlString);
    const response = await fetch(pdfUrlString);
    console.log('PDF Response:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        errorMessage.value = "Invalid or expired token. Please request a new link.";
        setTimeout(() => navigateTo('/'), 3000); // Redirect to home if needed
        return;
      }
      if (response.status === 404) {
        throw new Error(`Skill data for ${selectedTags.value.map(t => t.tags).join(", ")} is not available.`);
      }
      throw new Error(`Failed to generate PDF: ${errorText}`);
    }

    const blob = await response.blob();
    pdfUrl.value = URL.createObjectURL(blob);
    console.log('PDF Generated:', pdfUrl.value);
  } catch (err: any) {
    errorMessage.value = err.message || "PDF generation failed.";
    console.error('Export PDF Error:', err.message);
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    <div v-else class="space-y-6">
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
              class="bg-gray-400 text-white px-4 py-2 rounded flex items-center justify-center flex-grow sm:flex-grow-0"
              @click="exportToPDF"
              :disabled="isExporting || selectedTags.length === 0 || !token"
            >
              {{ isExporting ? 'Exporting...' : 'Export Matrix' }}
            </button>
          </div>
        </div>

        <!-- Exporting Message -->
        <div v-if="isExporting" class="text-blue-500 flex items-center">
          <span class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></span>
          Generating PDF. This may take a moment...
        </div>

        <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>

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
  </div>
</template>

<style scoped>
@import "vue-multiselect/dist/vue-multiselect.css";

.multiselect {
  min-height: 42px;
}

.multiselect__tag {
  background: #10b981; /* Green background like in the image */
  color: white;
  border-radius: 9999px; /* Fully rounded tags */
  padding: 2px 8px;
  margin-right: 4px;
  display: flex;
  align-items: center;
}

.multiselect__tag-icon {
  background: white; /* White close button */
  color: #10b981; /* Green close icon */
  border-radius: 50%;
  margin-left: 4px;
}

.multiselect__tag-icon:after {
  content: "×"; /* Cross symbol */
  font-size: 12px;
  line-height: 1;
}

.multiselect__tag-icon:hover {
  background: #d1d5db; /* Gray on hover for close button */
  color: #10b981;
}

.z-50 {
  z-index: 9999;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #9ca3af;
}

@media (max-width: 640px) {
  iframe {
    height: 50vh;
  }
}
</style>