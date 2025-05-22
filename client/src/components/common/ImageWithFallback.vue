<template>
  <img
    :src="currentSrc"
    :alt="alt"
    :class="imageClass"
    :style="imageStyle"
    @error="handleError"
    @load="$emit('load')"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'ImageWithFallback',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true
    },
    fallbackSrc: {
      type: String,
      default: '/images/placeholder.svg'
    },
    alt: {
      type: String,
      default: 'Imagen'
    },
    imageClass: {
      type: [String, Object, Array],
      default: ''
    },
    imageStyle: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['error', 'load'],
  data() {
    return {
      currentSrc: this.src
    };
  },
  watch: {
    src(newSrc) {
      this.currentSrc = newSrc;
    }
  },
  methods: {
    handleError() {
      console.log('Error al cargar la imagen:', this.currentSrc);
      if (this.currentSrc !== this.fallbackSrc) {
        this.currentSrc = this.fallbackSrc;
        this.$emit('error');
      }
    }
  }
};
</script>
