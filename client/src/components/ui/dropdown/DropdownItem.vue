<template>
  <div
    :class="[
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
      'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
      disabled ? 'pointer-events-none opacity-50' : '',
      active ? 'bg-accent text-accent-foreground' : '',
      className
    ]"
    :data-disabled="disabled"
    :data-active="active"
    @click="!disabled && onClick"
    role="menuitem"
    :tabindex="disabled ? -1 : 0"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  onClick: {
    type: Function,
    default: () => {}
  }
});
</script>
