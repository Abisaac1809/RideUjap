<script setup lang="ts">
import type { Component } from 'vue'

export interface NavItem {
  key: string
  label: string
  icon: Component
}

defineProps<{
  items: NavItem[]
  activeKey: string
}>()

const emit = defineEmits<{
  (e: 'select', key: string): void
  (e: 'update:activeKey', key: string): void
}>()

function onSelect(key: string) {
  emit('select', key)
  emit('update:activeKey', key)
}
</script>

<template>
  <nav class="navbar" aria-label="Navegación principal">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="item"
      :class="{ 'is-active': item.key === activeKey }"
      :aria-current="item.key === activeKey ? 'page' : undefined"
      @click="onSelect(item.key)"
    >
      <span class="icon">
        <component :is="item.icon" :size="22" :stroke-width="2" />
      </span>
      <span class="label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  inset: auto 0 0 0;
  display: flex;
  align-items: stretch;
  background: var(--bg);
  border-top: 1px solid var(--line);
  box-shadow: 0 -1px 12px rgba(14, 15, 18, 0.04);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.item {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s ease;
}

.icon {
  position: relative;
  display: inline-flex;
}

/* Punto indicador del item activo — la firma minimalista */
.item.is-active .icon::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
}

.label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.item.is-active {
  color: var(--accent);
}

.item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  border-radius: var(--radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  .item {
    transition: none;
  }
}
</style>
