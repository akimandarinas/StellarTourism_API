<template>
  <div 
    :id="`panel-${value}`"
    :aria-labelledby="`tab-${value}`"
    role="tabpanel"
    :class="{ 'hidden': !isActive }"
    tabindex="0"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true
  }
});

const tabs = inject('tabs', { activeTab: ref(''), setActiveTab: () => {} });
const isActive = computed(() => tabs.activeTab === props.value);
</script>
