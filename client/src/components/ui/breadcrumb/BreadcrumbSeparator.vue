<template>
  <li role="presentation" aria-hidden="true" class="[&>svg]:w-3.5 [&>svg]:h-3.5">
    <slot>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="h-4 w-4"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </slot>
  </li>
</template>

<script>
export default {
  name: 'BreadcrumbSeparator'
}
</script>
