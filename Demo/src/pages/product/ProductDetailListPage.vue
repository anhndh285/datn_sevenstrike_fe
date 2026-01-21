<template>
  <div class="ss-page">
    <!-- Topbar -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">DANH SÁCH CHI TIẾT SẢN PHẨM</div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-dark ss-btn" @click="goBack">Quay lại</button>

        <button class="btn btn-outline-secondary ss-btn" :disabled="loading" @click="fetchAll">
          {{ loading ? "Đang tải..." : "Làm mới" }}
        </button>

        <button class="btn btn-dark ss-btn" @click="goCreate">
          + Thêm chi tiết sản phẩm
        </button>
      </div>
    </div>

    <!-- Search + page size -->
    <div class="ss-card ss-border p-3 mb-3">
      <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div class="ss-search-wrap">
          <span class="material-icons ss-search-icon">search</span>
          <input
            v-model="keyword"
            class="form-control ss-search ss-search-input"
            placeholder="Tìm theo mã / tên..."
          />
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="text-muted">Hiển thị</span>
          <select
            class="form-select form-select-sm"
            style="width: 90px"
            :value="pageSize"
            @change="onChangeSize($event.target.value)"
          >
            <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="ss-card ss-border p-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table ss-table mb-0 align-middle">
          <thead>
            <tr>
              <th class="text-start" style="width: 70px">STT</th>
              <th class="text-start" style="width: 160px">Mã</th>
              <th class="text-start">Tên chi tiết</th>
              <th class="text-start" style="width: 140px">Số lượng</th>
              <th class="text-start" style="width: 160px">Giá</th>
              <th class="text-start" style="width: 120px">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="loading">
            <tr>
              <td colspan="6" class="text-center py-4 text-muted">Đang tải dữ liệu...</td>
            </tr>
          </tbody>

          <tbody v-else-if="!paged.length">
            <tr>
              <td colspan="6" class="text-center py-4 text-muted">Không có dữ liệu</td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="(r, i) in paged" :key="r.id ?? i">
              <td class="text-start text-muted">{{ stt(i) }}</td>
              <td class="text-start fw-semibold">{{ pickMa(r) }}</td>

              <td class="text-start">
                <div class="fw-semibold">{{ pickTen(r) }}</div>
                <div class="text-muted small">
                  {{ subLine(r) }}
                </div>
              </td>

              <td class="text-start">{{ formatNumber(r.soLuong ?? r.tonKho ?? 0) }}</td>
              <td class="text-start">{{ formatMoney(r.giaBan ?? r.gia ?? r.donGia ?? 0) }}</td>

              <td class="text-start">
                <!-- ✅ chỉ icon mắt -->
                <button class="btn btn-sm ss-icon-btn" title="Xem" @click="goView(r)">
                  <span class="material-icons">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- footer -->
      <div class="ss-card-foot d-flex align-items-center justify-content-between">
        <div class="text-muted small">Tổng: {{ filtered.length }} bản ghi</div>

        <div class="d-flex align-items-center gap-2">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page <= 1"
            @click="page--"
          >
            ‹
          </button>
          <div class="small">Trang {{ page }} / {{ totalPages }}</div>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="page >= totalPages"
            @click="page++"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import productDetailService from "@/services/productDetailService";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const items = ref([]);

const keyword = ref("");
const page = ref(1);
const pageSize = ref(10);

watch(keyword, () => (page.value = 1));

const productId = computed(() => {
  const v = route.query?.productId;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
});

function onChangeSize(v) {
  pageSize.value = Number(v || 10);
  page.value = 1;
}

const filtered = computed(() => {
  const kw = (keyword.value || "").trim().toLowerCase();
  if (!kw) return items.value || [];

  return (items.value || []).filter((x) => {
    const ma = String(pickMa(x)).toLowerCase();
    const ten = String(pickTen(x)).toLowerCase();
    return ma.includes(kw) || ten.includes(kw);
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil((filtered.value.length || 0) / (pageSize.value || 10)))
);

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

function stt(i) {
  return (page.value - 1) * pageSize.value + i + 1;
}

function goBack() {
  router.push("/admin/san-pham");
}

function goCreate() {
  // giữ productId nếu đang xem theo sản phẩm
  const q = productId.value ? `?productId=${productId.value}` : "";
  router.push(`/admin/chi-tiet-san-pham/new${q}`);
}

function goView(row) {
  router.push(`/admin/chi-tiet-san-pham/${row.id}`);
}

// ====== helpers map field ======
function pickMa(row) {
  return row?.maChiTietSanPham ?? row?.maChiTiet ?? row?.ma ?? "-";
}
function pickTen(row) {
  return row?.tenChiTietSanPham ?? row?.tenChiTiet ?? row?.ten ?? row?.tenSanPham ?? "-";
}
function subLine(r) {
  const ms = r?.tenMauSac ?? r?.mauSac ?? "";
  const kt = r?.tenKichThuoc ?? r?.kichThuoc ?? "";
  const s = `${ms} ${kt}`.trim();
  return s || " ";
}

function formatNumber(val) {
  const n = Number(val ?? 0);
  return new Intl.NumberFormat("vi-VN").format(Number.isNaN(n) ? 0 : n);
}
function formatMoney(val) {
  const n = Number(val ?? 0);
  const v = Number.isNaN(n) ? 0 : n;
  return new Intl.NumberFormat("vi-VN").format(v);
}

async function fetchAll() {
  loading.value = true;
  try {
    // 1) Nếu có productId: ưu tiên endpoint by-san-pham nếu BE có
    if (productId.value) {
      try {
        const data = await productDetailService.getBySanPham(productId.value);
        items.value = Array.isArray(data) ? data : data?.data ?? [];
      } catch (e) {
        // 2) fallback: getAll rồi tự lọc nếu có field idSanPham
        const dataAll = await productDetailService.getAll();
        const all = Array.isArray(dataAll) ? dataAll : dataAll?.data ?? [];
        items.value = all.filter((x) => Number(x.idSanPham ?? x.sanPhamId ?? x.id_san_pham) === productId.value);
      }
    } else {
      const data = await productDetailService.getAll();
      items.value = Array.isArray(data) ? data : data?.data ?? [];
    }
  } catch (e) {
    console.error(e);
    alert("Không tải được danh sách chi tiết sản phẩm.");
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
  width: 360px;
  max-width: 100%;
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

/* ===== TABLE STYLE: chỉ kẻ dọc ở HEADER ===== */
.ss-table {
  border-collapse: separate;
  border-spacing: 0;
}
.ss-table thead th {
  background: #fafafa;
  font-weight: 800;
  font-size: 13px;
  white-space: nowrap;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-table thead th + th {
  border-left: 1px solid rgba(0, 0, 0, 0.06);
}
/* BODY không kẻ dọc */
.ss-table tbody td {
  border-left: none !important;
  border-right: none !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.ss-card-foot {
  padding: 12px 14px;
}

.ss-icon-btn {
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
}
.ss-icon-btn .material-icons {
  font-size: 18px;
}
</style>
