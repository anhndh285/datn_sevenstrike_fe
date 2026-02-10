<template>
  <div class="container-fluid p-0 min-vh-100 bg-light ss-admin-root">
    <!-- ✅ Sidebar tách riêng -->
    <SidebarMenu />

    <!-- Main -->
    <main class="ss-main">
      <Toast position="top-right" />

      <header class="navbar bg-white px-4 sticky-top ss-header" style="height: 64px">
        <div class="container-fluid justify-content-end gap-3">
          <span class="material-icons text-secondary cursor-pointer">dark_mode</span>
          <div class="d-flex align-items-center gap-2 cursor-pointer border-start ps-3">
            <span class="material-icons text-secondary">account_circle</span>
            <span class="material-icons small text-secondary">expand_more</span>
          </div>
        </div>
      </header>

      <div class="p-4">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarMenu from "@/components/layouts/SidebarMenu.vue";
// Toast là component global (đã register trong main.js)
</script>

<style scoped>
/* ✅ chặn tràn ngang toàn layout */
.ss-admin-root {
  overflow-x: hidden;
}

/* ✅ main ăn theo width sidebar mới */
.ss-main {
  margin-left: var(--ss-sidebar-w, 240px);
  width: calc(100% - var(--ss-sidebar-w, 240px));
  overflow-x: hidden;
  min-height: 100vh;
}

.ss-header {
  border-bottom: 1px solid var(--ss-border);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
