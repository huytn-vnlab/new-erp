<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden login-bg">
    <!-- Decorative X marks -->
    <span class="deco-x" style="top:14%;left:2%">✕</span>
    <span class="deco-x" style="top:10%;right:2%">✕</span>
    <span class="deco-x" style="top:50%;left:2%">✕</span>
    <span class="deco-x" style="bottom:30%;right:2%">✕</span>
    <span class="deco-x" style="bottom:12%;left:36%;font-size:1.2rem">✕</span>

    <!-- White diagonal shape — top left -->
    <div class="absolute -top-20 -left-20 w-72 h-72 bg-white opacity-10 rounded-3xl" style="transform:rotate(45deg)" />
    <!-- White diagonal shape — bottom right -->
    <div class="absolute -bottom-20 -right-10 w-56 h-56 bg-white opacity-10 rounded-3xl" style="transform:rotate(15deg)" />

    <!-- Dot grid — bottom right -->
    <div class="absolute bottom-5 right-5 opacity-25" style="display:grid;grid-template-columns:repeat(10,1fr);gap:5px">
      <div v-for="n in 80" :key="n" class="w-1 h-1 rounded-full bg-white" />
    </div>

    <!-- Card -->
    <div class="w-full max-w-md relative z-10">
      <div class="bg-white rounded-lg shadow-2xl p-8">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-4 left-0 w-full text-center text-white text-xs opacity-70 z-10">
      @2026 MicroERP - All rights reserved
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout — no nav/sidebar, used for login, register, forgot-password
</script>

<style scoped>
.login-bg {
  background: linear-gradient(145deg, #4fc3f7 0%, #1e88e5 40%, #1565c0 100%);
}
.deco-x {
  position: absolute;
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.8rem;
  pointer-events: none;
  user-select: none;
}
</style>
