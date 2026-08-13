<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    variant?: 'primary' | 'ghost'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    label: '',
    variant: 'primary',
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function onClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="`btn--${variant}`"
    :disabled="disabled"
    @click="onClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.btn--primary {
  background: var(--accent);
  color: var(--accent-ink);
}

.btn--primary:hover:not(:disabled) {
  background: #0fa373;
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
  border-color: var(--line);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--surface);
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
  .btn:active:not(:disabled) {
    transform: none;
  }
}
</style>
