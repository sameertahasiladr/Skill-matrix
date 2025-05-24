<!-- ~/components/Accordion.vue -->
<template>
  <div class="border rounded mb-2">
    <!-- Header row -->
    <div
      class="bg-gray-200 px-4 py-2 cursor-pointer flex justify-between items-center"
      @click="toggle"
    >
      <h2 class="font-semibold text-lg">{{ title }}</h2>
      <span>{{ isOpen ? '▲' : '▼' }}</span>
    </div>

    <!-- Collapsible content -->
    <transition name="fade">
      <div v-if="isOpen" class="p-4">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  title: { type: String, required: true },
});

const isOpen = ref(false);
function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
