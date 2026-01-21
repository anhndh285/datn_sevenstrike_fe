<template>
  <div class="ss-page">
    <!-- Topbar -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">QUẢN LÝ SẢN PHẨM</div>

      <div class="d-flex gap-2">
        <button class="btn btn-dark ss-btn" @click="goCreateProduct">+ Thêm sản phẩm</button>
        <button class="btn btn-outline-dark ss-btn" @click="goCreateDetail">+ Thêm chi tiết sản phẩm</button>
      </div>
    </div>

    <!-- Search only -->
    <div class="ss-card ss-border p-3 mb-3">
      <div class="ss-search-wrap">
        <span class="material-icons ss-search-icon">search</span>
        <input
          v-model="keyword"
          class="form-control ss-search ss-search-input"
          placeholder="Tìm theo mã / tên..."
        />
      </div>
    </div>

    <!-- Table -->
    <ProductTable
      :items="pagedItems"
      :loading="loading"
      :page="page"
      :pageSize="pageSize"
      :totalItems="filteredItems.length"
      @page-change="page = $event"
      @page-size-change="onChangeSize"
      @view="goDetail"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import ProductTable from "@/components/product/ProductTable.vue";
import productService from "@/services/productService";

const router = useRouter();

const loading = ref(false);
const items = ref([]);

const keyword = ref("");
const page = ref(1);
const pageSize = ref(10);

watch(keyword, () => (page.value = 1));

const filteredItems = computed(() => {
  const kw = (keyword.value || "").trim().toLowerCase();
  if (!kw) return items.value || [];
  return (items.value || []).filter((x) => {
    const ma = String(x.maSanPham ?? x.ma ?? "").toLowerCase();
    const ten = String(x.tenSanPham ?? x.ten ?? "").toLowerCase();
    return ma.includes(kw) || ten.includes(kw);
  });
});

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

function onChangeSize(v) {
  pageSize.value = Number(v || 10);
  page.value = 1;
}

function goCreateProduct() {
  router.push("/admin/san-pham/new");
}

function goCreateDetail() {
  router.push("/admin/chi-tiet-san-pham/new");
}

function goDetail(row) {
  // ✅ click icon mắt -> list CTSP theo sản phẩm, có productId
  router.push(`/admin/chi-tiet-san-pham?productId=${row.id}&from=san-pham`);
}

async function fetchAll() {
  loading.value = true;
  try {
    const data = await productService.getAll();
    items.value = Array.isArray(data) ? data : data?.data ?? [];
  } catch (e) {
    console.error(e);
    alert("Không tải được danh sách sản phẩm.");
  } finally {
    loading.value = false;
  }
}

onMounted(fetchAll);
</script>

<style scoped>
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
}
.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
}

/* search nhỏ + icon */
.ss-search-wrap {
  position: relative;
  width: 320px;
}
.ss-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #9ca3af;
  pointer-events: none;
}
.ss-search-input {
  padding-left: 38px !important;
  height: 40px;
  border-radius: 999px !important;
}
</style>
