<template>
    <div class="flowchart-container">
      <!-- Role node at the top -->
      <div class="flex flex-col items-center">
        <div class="flowchart-node role-node">{{ role }}</div>
        <div class="flowchart-line h-6"></div>
        
        <!-- Tag node (instead of COMMON) -->
        <div class="flowchart-node tag-node">{{ tag.toUpperCase() }}</div>
        
        <!-- Main skill categories -->
        <div class="flowchart-branches">
          <div 
            v-for="(category, index) in skillCategories" 
            :key="index"
            class="flowchart-branch"
          >
            <div class="flowchart-line h-6"></div>
            <div class="flowchart-node category-node">{{ category.name.toUpperCase() }}</div>
            
            <!-- Skills under this category -->
            <div class="flowchart-skills">
              <div 
                v-for="(skill, skillIdx) in category.skills" 
                :key="skillIdx"
                class="flowchart-skill-group"
              >
                <div class="flowchart-line h-6"></div>
                <div class="flowchart-node skill-node">{{ skill.name }}</div>
                
                <!-- Sub-skills if any -->
                <div 
                  v-if="skill.subSkills && skill.subSkills.length"
                  class="flowchart-sub-skills"
                >
                  <div 
                    v-for="(subSkill, idx) in skill.subSkills" 
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
    tag: {
      type: String,
      required: true
    },
    skills: {
      type: Array,
      required: true
    }
  });
  
  // Organize skills into categories
  const skillCategories = computed(() => {
    // Define default categories based on your domain needs
    // This is a simplified example - you may need to adjust the logic based on your actual data
    const categories = {
      'frameworks': { name: 'Frameworks', skills: [] },
      'languages': { name: 'Languages', skills: [] },
      'tools': { name: 'Tools', skills: [] },
      'concepts': { name: 'Concepts', skills: [] }
    };
    
    // Group skills by main category
    props.skills.forEach(skill => {
      const skillText = skill.skills || skill.SkillMatrix_skills;
      
      // Determine category based on skill content
      let categoryKey = 'concepts'; // Default category
      
      if (skillText.toLowerCase().includes('framework') || 
          skillText.toLowerCase().includes('react') || 
          skillText.toLowerCase().includes('vue') ||
          skillText.toLowerCase().includes('angular')) {
        categoryKey = 'frameworks';
      } else if (skillText.toLowerCase().includes('javascript') || 
                 skillText.toLowerCase().includes('typescript') || 
                 skillText.toLowerCase().includes('python') ||
                 skillText.toLowerCase().includes('java') ||
                 skillText.toLowerCase().includes('language')) {
        categoryKey = 'languages';
      } else if (skillText.toLowerCase().includes('tool') || 
                 skillText.toLowerCase().includes('compiler') || 
                 skillText.toLowerCase().includes('editor') ||
                 skillText.toLowerCase().includes('ide') ||
                 skillText.toLowerCase().includes('webpack') ||
                 skillText.toLowerCase().includes('babel')) {
        categoryKey = 'tools';
      }
      
      // Add skill to appropriate category
      categories[categoryKey].skills.push({
        name: skillText,
        orderNo: skill.orderNo,
        // Extract any sub-skills if needed
        subSkills: []
      });
    });
    
    // Convert to array and filter out empty categories
    return Object.values(categories).filter(category => category.skills.length > 0);
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
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