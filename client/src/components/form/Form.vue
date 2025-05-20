<script>
export const Form = {
  name: 'Form',
  props: {
    onSubmit: {
      type: Function,
      default: () => {}
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : null
  }
}

export const FormField = {
  name: 'FormField',
  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : null
  }
}

export default {
  install(app) {
    app.component('Form', Form)
    app.component('FormField', FormField)
  }
}
</script>
