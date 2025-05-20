<template>
  <div>
    <nav aria-label="Progress">
      <ol role="list" class="flex items-center">
        <li v-for="(step, stepIdx) in steps" :key="step.id" :class="[stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']">
          <div class="absolute inset-0 flex items-center" aria-hidden="true" v-if="stepIdx !== steps.length - 1">
            <div :class="[stepIdx < currentStep ? 'bg-primary-600' : 'bg-gray-200', 'h-0.5 w-full']"></div>
          </div>
          <div :class="[
            getStepStatus(stepIdx) === 'complete' ? 'bg-primary-600 hover:bg-primary-800' : 
            getStepStatus(stepIdx) === 'current' ? 'bg-primary-600' : 'bg-gray-200',
            'relative flex h-8 w-8 items-center justify-center rounded-full'
          ]">
            <svg v-if="getStepStatus(stepIdx) === 'complete'" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
            </svg>
            <span v-else-if="getStepStatus(stepIdx) === 'current'" class="text-white">{{ stepIdx + 1 }}</span>
            <span v-else class="text-gray-500">{{ stepIdx + 1 }}</span>
          </div>
          <div class="mt-2 flex flex-col items-center justify-center">
            <span class="text-sm font-medium" :class="[
              getStepStatus(stepIdx) === 'complete' ? 'text-primary-600' : 
              getStepStatus(stepIdx) === 'current' ? 'text-primary-600' : 'text-gray-500'
            ]">
              {{ step.name }}
            </span>
            <span v-if="step.description" class="text-xs text-gray-500">{{ step.description }}</span>
          </div>
        </li>
      </ol>
    </nav>
    
    <div class="mt-8">
      <slot></slot>
    </div>
    
    <div class="mt-8 flex justify-between">
      <button
        v-if="currentStep > 0"
        @click="goToPreviousStep"
        type="button"
        class="rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Anterior
      </button>
      <div v-else></div>
      
      <button
        v-if="currentStep < steps.length - 1"
        @click="goToNextStep"
        type="button"
        class="rounded-md bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Siguiente
      </button>
      <button
        v-else
        @click="onComplete"
        type="button"
        class="rounded-md bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Finalizar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    validator: (steps) => {
      return steps.every(step => 'id' in step && 'name' in step);
    }
  },
  currentStep: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['previous-step', 'next-step', 'complete']);

const getStepStatus = (index) => {
  if (index < props.currentStep) return 'complete';
  if (index === props.currentStep) return 'current';
  return 'upcoming';
};

const goToPreviousStep = () => {
  emit('previous-step');
};

const goToNextStep = () => {
  emit('next-step');
};

const onComplete = () => {
  emit('complete');
};
</script>
