<template>
  <span class="badge" :class="[`badge-${variant}`, { 'badge-pill': pill }]">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'Badge',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => {
        return ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline', 'default'].includes(value)
      }
    },
    pill: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.badge-pill {
  padding-right: 0.6em;
  padding-left: 0.6em;
  border-radius: 10rem;
}

.badge-primary {
  color: #fff;
  background-color: var(--color-primary, #4A90E2);
}

.badge-secondary {
  color: #fff;
  background-color: var(--color-secondary, #6c757d);
}

.badge-success {
  color: #fff;
  background-color: var(--color-success, #28a745);
}

.badge-danger {
  color: #fff;
  background-color: var(--color-danger, #dc3545);
}

.badge-warning {
  color: #212529;
  background-color: var(--color-warning, #ffc107);
}

.badge-info {
  color: #fff;
  background-color: var(--color-info, #17a2b8);
}

.badge-light {
  color: #212529;
  background-color: var(--color-light, #f8f9fa);
}

.badge-dark {
  color: #fff;
  background-color: var(--color-dark, #343a40);
}

.badge-outline {
  color: var(--color-primary, #4A90E2);
  background-color: transparent;
  border: 1px solid var(--color-primary, #4A90E2);
}

.badge-default {
  color: #212529;
  background-color: #e9ecef;
}
</style>
