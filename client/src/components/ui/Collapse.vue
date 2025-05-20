<template>
  <div class="collapse" :class="{ 'collapse-open': isOpen }">
    <div class="collapse-trigger" @click="toggle" :aria-expanded="isOpen" :aria-controls="contentId">
      <slot name="trigger"></slot>
      <div class="collapse-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    <transition
      name="collapse"
      @enter="startTransition"
      @after-enter="endTransition"
      @before-leave="startTransition"
      @after-leave="endTransition"
    >
      <div v-show="isOpen" class="collapse-content" :id="contentId">
        <div class="collapse-content-inner">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

const isOpen = ref(props.open);
const contentId = `collapse-content-${Math.random().toString(36).substring(2, 9)}`;

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const startTransition = (el) => {
  el.style.height = el.scrollHeight + 'px';
};

const endTransition = (el) => {
  el.style.height = '';
};

onMounted(() => {
  isOpen.value = props.open;
});
</script>

<style scoped>
.collapse {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.375rem;
  overflow: hidden;
}

.collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  background-color: var(--color-background, #ffffff);
  transition: background-color 0.2s;
}

.collapse-trigger:hover {
  background-color: var(--color-background-secondary, #f3f4f6);
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.collapse-open .collapse-icon {
  transform: rotate(180deg);
}

.collapse-content {
  overflow: hidden;
  height: 0;
  transition: height 0.3s ease;
}

.collapse-content-inner {
  padding: 1rem;
  background-color: var(--color-background, #ffffff);
  border-top: 1px solid var(--color-border, #e5e7eb);
}

/* Tema oscuro */
:root.dark .collapse {
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .collapse-trigger {
  background-color: var(--color-background-secondary, #1f2937);
}

:root.dark .collapse-trigger:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

:root.dark .collapse-content-inner {
  background-color: var(--color-background-secondary, #1f2937);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
