<template>
  <div class="ss-card ss-border">
    <div class="ss-card-head d-flex align-items-center justify-content-between">
      <div class="fw-bold">Danh sách sản phẩm</div>

      <div class="d-flex align-items-center gap-2">
        <span class="text-muted">Hiển thị</span>
        <select
          class="form-select form-select-sm"
          style="width: 90px"
          :value="pageSize"
          @change="$emit('page-size-change', $event.target.value)"
        >
          <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table ss-table mb-0">
        <thead>
          <tr>
            <th class="text-start th-stt">STT</th>
            <th class="text-start th-ma">Mã</th>
            <th class="text-start">Tên</th>
            <th class="text-start th-gia">Giá</th>
            <th class="text-start th-sl">Số lượng</th>
            <th class="text-start th-tt">Trạng thái</th>
            <th class="text-start th-hd">Hành động</th>
          </tr>
        </thead>

        <tbody v-if="!loading && items?.length">
          <tr v-for="(row, idx) in items" :key="row.id ?? idx">
            <td class="text-start">{{ (page - 1) * pageSize + idx + 1 }}</td>

            <td class="text-start fw-semibold">{{ row.maSanPham ?? row.ma ?? "-" }}</td>

            <td class="text-start">
              <div class="fw-semibold">{{ row.tenSanPham ?? row.ten ?? "-" }}</div>
              <div class="text-muted small">{{ row.moTaNgan ?? row.moTa ?? "" }}</div>
            </td>

            <td class="text-start fw-semibold">
              {{ formatMoney(row.gia ?? row.giaBan ?? row.donGia ?? 0) }}
            </td>

            <td class="text-start">{{ Number(row.soLuong ?? row.tonKho ?? 0) }}</td>

            <td class="text-start">
              <span class="ss-badge" :class="normalizeKinhDoanh(row.trangThai ?? row.kinhDoanh) ? 'ss-badge-on' : 'ss-badge-off'">
                {{ normalizeKinhDoanh(row.trangThai ?? row.kinhDoanh) ? "Kinh doanh" : "Ngừng" }}
              </span>
            </td>

            <td class="text-start">
              <button class="btn btn-sm ss-icon-btn" title="Xem chi tiết" @click="$emit('view', row)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="7" class="text-center py-4">
              <span v-if="loading">Đang tải...</span>
              <span v-else class="text-muted">Không có dữ liệu</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ss-card-foot d-flex align-items-center justify-content-between">
      <div class="text-muted small">Tổng: {{ totalItems }} bản ghi</div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="$emit('page-change', page - 1)">‹</button>
        <div class="small">Trang {{ page }} / {{ totalPages }}</div>
        <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages" @click="$emit('page-change', page + 1)">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 },
});

defineEmits(["page-change", "page-size-change", "view"]);

const totalPages = computed(() => Math.max(1, Math.ceil((props.totalItems || 0) / (props.pageSize || 10))));

function normalizeKinhDoanh(v) {
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  const s = String(v ?? "").toLowerCase();
  if (s.includes("kinh")) return true;
  if (s.includes("ngung")) return false;
  return true;
}

function formatMoney(v) {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  } catch {
    return `${n} đ`;
  }
}
</script>

<style scoped>
.ss-card-head,
.ss-card-foot {
  padding: 12px 14px;
}

/* ✅ CHỈ KẺ DỌC Ở HEADER */
.ss-table {
  border-collapse: separate;
  border-spacing: 0;
}
.ss-table thead th {
  background: #fafafa;
  font-weight: 800;
  font-size: 13px;
  white-space: nowrap;

  /* ✅ khoảng cách cột chỉnh ở đây */
  padding: 14px 18px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-table thead th + th {
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

/* ✅ BODY không kẻ dọc */
.ss-table tbody td {
  padding: 14px 18px; /* ✅ khoảng cách cột */
  border-left: none !important;
  border-right: none !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* (tuỳ chọn) set width để giống YouTube hơn */
.th-stt { width: 70px; }
.th-ma { width: 140px; }
.th-gia { width: 140px; }
.th-sl { width: 140px; }
.th-tt { width: 170px; }
.th-hd { width: 140px; }

.ss-icon-btn {
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
}
.ss-icon-btn .material-icons {
  font-size: 18px;
}

.ss-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(0,0,0,0.08);
}
.ss-badge-on {
  background: rgba(16,185,129,0.08);
  color: #0f766e;
}
.ss-badge-off {
  background: rgba(239,68,68,0.08);
  color: #b91c1c;
}
</style>
