<template>
  <a 
    class="transition-colors hover:text-foreground"
    :href="href"
    :class="{ 'font-normal text-foreground': current }"
    :aria-current="current ? 'page' : undefined"
  >
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: 'BreadcrumbLink',
  props: {
    href: {
      type: String,
      default: '#'
    },
    current: {
      type: Boolean,
      default: false
    }
  }
}
</script>
