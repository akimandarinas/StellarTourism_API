<template>
  <nav aria-label="breadcrumb">
    <ol class="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
      <slot></slot>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'Breadcrumb'
}
</script>
