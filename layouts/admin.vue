<template>
  <SidebarProvider class="h-svh overflow-hidden">
    <AppSidebar />
    <SidebarInset class="min-w-0">
      <AppTopbar />
      <div class="flex flex-1 flex-col min-h-0 p-6 overflow-y-auto scrollbar-thin">
        <slot />
      </div>
      <AppToast />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
</script>
