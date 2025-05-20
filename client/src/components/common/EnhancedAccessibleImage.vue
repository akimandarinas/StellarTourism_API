<template>
  <div class="enhanced-accessible-image" :class="{ 'is-loading': loading }">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="onImageLoad"
      @error="onImageError"
      :width="width"
      :height="height"
      :loading="lazyLoad ? 'lazy' : 'eager'"
    />
    <div v-if="loading" class="image-loader">
      <span class="sr-only">Cargando imagen...</span>
    </div>
    <div v-if="error" class="image-error">
      <span class="sr-only">Error al cargar la imagen</span>
    </div>
    <span v-if="longDescription" class="sr-only">{{ longDescription }}</span>
  </div>
</template>

<script>
export default {
  name: 'EnhancedAccessibleImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    longDescription: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    lazyLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      error: false
    }
  },
  methods: {
    onImageLoad() {
      this.loading = false
      this.error = false
      this.$emit('load')
    },
    onImageError() {
      this.loading = false
      this.error = true
      this.$emit('error')
    }
  }
}
</script>

<style scoped>
.enhanced-accessible-image {
  position: relative;
  display: inline-block;
}

.image-loader, .image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.image-error {
  background-color: #fff0f0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
