<script setup lang="ts">
import { ref } from 'vue'
import { Home, Car, Clock, User } from '@lucide/vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import BottomNavbar from '@/components/BottomNavbar.vue'
import type { NavItem } from '@/components/BottomNavbar.vue'

const destino = ref('')
const activeKey = ref('inicio')

const navItems: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Home },
  { key: 'viajes', label: 'Viajes', icon: Car },
  { key: 'historial', label: 'Historial', icon: Clock },
  { key: 'perfil', label: 'Perfil', icon: User },
]

function buscarViaje() {
  const texto = destino.value.trim()
  if (!texto) return
  // Aquí más adelante se disparará la búsqueda de viajes.
  window.alert(`Buscando viajes hacia: ${texto}`)
}
</script>

<template>
  <div class="page">
    <main class="content">
      <header class="hero">
        <p class="eyebrow">RideUJAP</p>
        <h1 class="title">¿A dónde vas hoy?</h1>
        <p class="subtitle">Comparte el viaje con tu comunidad universitaria.</p>
      </header>

      <section class="search">
        <AppInput
          v-model="destino"
          label="Destino"
          placeholder="Escribe tu destino"
        />
        <AppButton label="Buscar viaje" @click="buscarViaje" />
      </section>
    </main>

    <BottomNavbar
      :items="navItems"
      v-model:active-key="activeKey"
      @select="(key) => (activeKey = key)"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  /* Espacio para el navbar inferior fijo */
  padding-bottom: 88px;
}

.content {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 20px 0;
}

.hero {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

.title {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.subtitle {
  margin: 0;
  color: var(--muted);
}

.search {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
