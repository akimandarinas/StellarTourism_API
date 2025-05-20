<template>
  <div class="aspect-ratio-container" :style="containerStyle">
    <div class="aspect-ratio-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AspectRatio',
  props: {
    ratio: {
      type: Number,
      default: 1 // 1:1 by default
    }
  },
  computed: {
    containerStyle() {
      return {
        position: 'relative',
        width: '100%',
        paddingBottom: `${(1 / this.ratio) * 100}%`
      }
    }
  }
}
</script>

<style scoped>
.aspect-ratio-container {
  position: relative;
  width: 100%;
}

.aspect-ratio-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
