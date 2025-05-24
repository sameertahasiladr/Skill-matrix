<template>
    <div class="flowchart-container">
      <!-- Role node at the top -->
      <div class="flex flex-col items-center">
        <div class="flowchart-node role-node">{{ role }}</div>
        <div class="flowchart-line h-6"></div>
        
        <!-- Common node -->
        <div class="flowchart-node common-node">COMMON</div>
        
        <!-- Categories -->
        <div class="flowchart-branches">
          <!-- Generate category branches dynamically -->
          <div 
            v-for="(category, index) in categories" 
            :key="index"
            class="flowchart-branch"
          >
            <div class="flowchart-line h-6"></div>
            <div class="flowchart-node category-node">{{ category.toUpperCase() }}</div>
            
            <!-- Skills under this category -->
            <div class="flowchart-skills">
              <div 
                v-for="(skillGroup, skillName) in categorizedSkills[category]" 
                :key="skillName"
                class="flowchart-skill-group"
              >
                <div class="flowchart-line h-6"></div>
                <div class="flowchart-node skill-node">{{ skillName }}</div>
                
                <!-- Sub-skills if any -->
                <div 
                  v-if="skillGroup.subSkills && skillGroup.subSkills.length"
                  class="flowchart-sub-skills"
                >
                  <div 
                    v-for="(subSkill, idx) in skillGroup.subSkills" 
                    :key="idx"
                    class="flowchart-sub-skill"
                  >
                    <div class="flowchart-line h-6"></div>
                    <div class="flowchart-node sub-skill-node">{{ subSkill }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    role: {
      type: String,
      required: true
    },
    groupedSkills: {
      type: Object,
      required: true
    }
  });
  
  // Predefined categories based on your image
  const categories = computed(() => {
    // Either use predefined categories or extract from the data
    return ['core', 'db', 'code/versioning', 'unittesting'];
  });
  
  // Organize skills by categories
  const categorizedSkills = computed(() => {
    const result = {};
    
    // Initialize categories
    categories.value.forEach(category => {
      result[category] = {};
    });
    
    // Organize the skills into the categories
    for (const mainSkill in props.groupedSkills) {
      // Determine which category this skill belongs to
      let category = 'core'; // Default category
      
      // Simple classification logic (customize based on your needs)
      if (mainSkill.toLowerCase().includes('db') || 
          mainSkill.toLowerCase().includes('data') || 
          mainSkill.toLowerCase().includes('sql')) {
        category = 'db';
      } else if (mainSkill.toLowerCase().includes('git') || 
                 mainSkill.toLowerCase().includes('version') || 
                 mainSkill.toLowerCase().includes('code')) {
        category = 'code/versioning';
      } else if (mainSkill.toLowerCase().includes('test') || 
                 mainSkill.toLowerCase().includes('unit')) {
        category = 'unittesting';
      } else if (mainSkill.toLowerCase().includes('html') || 
                 mainSkill.toLowerCase().includes('css') || 
                 mainSkill.toLowerCase().includes('framework')) {
        category = 'core';
      }
      
      // Add the skill group to the appropriate category
      result[category][mainSkill] = {
        items: props.groupedSkills[mainSkill],
        // Extract sub-skills if needed
        subSkills: props.groupedSkills[mainSkill].map(item => item.skills)
      };
    }
    
    return result;
  });
  </script>
  
  <style scoped>
  .flowchart-container {
    padding: 2rem;
    overflow-x: auto;
  }
  
  .flowchart-node {
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #f9fafb;
    display: inline-block;
    text-align: center;
    min-width: 120px;
  }
  
  .role-node {
    background-color: #e5edff;
    border-color: #93c5fd;
  }
  
  .common-node {
    background-color: #e0e7ff;
    border-color: #a5b4fc;
  }
  
  .category-node {
    background-color: #f5f3ff;
    border-color: #c4b5fd;
  }
  
  .skill-node {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .sub-skill-node {
    background-color: #f9fafb;
    border-color: #d1d5db;
    font-size: 0.875rem;
  }
  
  .flowchart-line {
    width: 2px;
    background-color: #9ca3af;
    margin: 0 auto;
  }
  
  .flowchart-branches {
    display: flex;
    justify-content: space-around;
    min-width: 800px;
    margin-top: 1rem;
  }
  
  .flowchart-branch {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
  }
  
  .flowchart-skills {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
  }
  
  .flowchart-skill-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0.5rem;
  }
  
  .flowchart-sub-skills {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0.5rem;
  }
  
  .flowchart-sub-skill {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0.5rem;
  }
  </style>