<!-- src/pages/product/ProductDetailFormPage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">
        {{ isEdit ? "SỬA CHI TIẾT SẢN PHẨM" : "THÊM CHI TIẾT SẢN PHẨM" }}
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-dark ss-btn" @click="back">Quay lại</button>
        <button class="btn btn-dark ss-btn" :disabled="loading" @click="submit">
          {{ isEdit ? "Lưu" : "Lưu" }}
        </button>
      </div>
    </div>

    <!-- 2 CARD TRÊN -->
    <div class="row g-3">
      <!-- (1) THÔNG TIN SẢN PHẨM -->
      <div class="col-lg-6">
        <div class="ss-card ss-border p-3 h-100">
          <div class="mb-2 ss-card-title">Thông tin sản phẩm</div>

          <div class="mb-3">
            <label class="form-label">Sản phẩm *</label>
            <v-select
              v-model="selectedProduct"
              :options="productOptions"
              label="tenSanPham"
              placeholder="Chọn sản phẩm..."
              :disabled="isEdit"
            >
              <template #option="opt">
                <div class="d-flex justify-content-between">
                  <span>{{ opt.tenSanPham ?? opt.ten }}</span>
                  <small class="text-muted">{{ opt.maSanPham ?? opt.ma }}</small>
                </div>
              </template>

              <template #selected-option="opt">
                <span>
                  {{ opt.tenSanPham ?? opt.ten }}
                  <span class="text-muted">({{ opt.maSanPham ?? opt.ma }})</span>
                </span>
              </template>
            </v-select>
          </div>

          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label">Mã</label>
              <input class="form-control" v-model="form.maSanPham" disabled />
            </div>
            <div class="col-md-6">
              <label class="form-label">Tên</label>
              <input class="form-control" v-model="form.tenSanPham" disabled />
            </div>

            <div class="col-md-6">
              <label class="form-label">Thương hiệu</label>
              <input class="form-control" v-model="form.thuongHieu" disabled />
            </div>
            <div class="col-md-6">
              <label class="form-label">Xuất xứ</label>
              <input class="form-control" v-model="form.xuatXu" disabled />
            </div>

            <div class="col-12">
              <label class="form-label">Mô tả ngắn</label>
              <textarea class="form-control" rows="3" v-model="form.moTaNgan" disabled />
            </div>
          </div>
        </div>
      </div>

      <!-- (2) BIẾN THỂ -->
      <div class="col-lg-6">
        <div class="ss-card ss-border p-3 h-100">
          <div class="mb-2 ss-card-title">Biến thể</div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">Màu sắc *</label>
              <router-link class="small text-decoration-none" to="/admin/mau-sac">Thêm màu sắc</router-link>
            </div>

            <v-select
              v-model="selectedMauSac"
              :options="mauSacOptions"
              label="tenMauSac"
              placeholder="Chọn màu..."
              :multiple="!isEdit"
              :closeOnSelect="isEdit"
            >
              <template #option="opt">
                <div class="d-flex align-items-center justify-content-between" style="gap: 10px">
                  <div class="d-flex align-items-center" style="gap: 10px; min-width: 0">
                    <span
                      class="ss-color-dot"
                      :style="{
                        background: pickColorHex(opt),
                        borderColor: isLight(pickColorHex(opt)) ? '#d1d5db' : 'transparent',
                      }"
                    />
                    <span class="text-truncate">{{ opt.tenMauSac ?? opt.ten }}</span>
                  </div>
                  <small class="text-muted">{{ opt.maMauSac ?? opt.ma }}</small>
                </div>
              </template>

              <template #selected-option="opt">
                <span class="d-inline-flex align-items-center" style="gap: 8px">
                  <span
                    class="ss-color-dot"
                    :style="{
                      background: pickColorHex(opt),
                      borderColor: isLight(pickColorHex(opt)) ? '#d1d5db' : 'transparent',
                    }"
                  />
                  <span>{{ opt.tenMauSac ?? opt.ten }}</span>
                </span>
              </template>
            </v-select>
          </div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">Kích cỡ *</label>
              <router-link class="small text-decoration-none" to="/admin/kich-thuoc">Thêm kích cỡ</router-link>
            </div>

            <v-select
              v-model="selectedKichThuoc"
              :options="kichThuocOptions"
              label="tenKichThuoc"
              placeholder="Chọn kích cỡ..."
              :multiple="!isEdit"
              :closeOnSelect="isEdit"
            />
          </div>

          <div class="text-muted small">
            {{ isEdit ? "Bạn đang sửa 1 biến thể." : "Chọn nhiều màu + nhiều kích cỡ để tự sinh danh sách bên dưới." }}
          </div>
        </div>
      </div>
    </div>

    <!-- (3) PHẦN DƯỚI -->
    <div class="ss-card ss-border p-3 mt-3">
      <div v-if="!hasProduct || !hasVariantsSelected" class="ss-empty">
        Chưa có biến thể nào
      </div>

      <template v-else>
        <div class="d-flex align-items-start justify-content-between gap-3">
          <div class="d-flex gap-3 ss-common">
            <div class="ss-common-item">
              <label class="form-label">Số lượng chung</label>
              <input v-model="common.soLuongChung" type="number" min="0" class="form-control" />
            </div>
            <div class="ss-common-item">
              <label class="form-label">Giá chung</label>
              <input v-model="common.giaChung" type="number" min="0" class="form-control" />
            </div>
          </div>

          <button class="btn btn-success ss-btn ss-add-btn" :disabled="loading" @click="submit">
            {{ isEdit ? "Lưu chi tiết sản phẩm" : "Thêm chi tiết sản phẩm" }}
          </button>
        </div>

        <div class="table-responsive mt-2">
          <table class="table align-middle mb-0 ss-table-grid">
            <colgroup>
              <col style="width: 44px" />
              <col style="width: 70px" />
              <col />
              <col style="width: 140px" />
              <col style="width: 140px" />
              <col style="width: 110px" />
              <col style="width: 280px" />
            </colgroup>

            <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" :disabled="isEdit" />
                </th>
                <th>STT</th>
                <th>Tên Sản Phẩm</th>
                <th>Số Lượng</th>
                <th>Giá</th>
                <th>Hành Động</th>
                <th>Ảnh</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!rows.length">
                <td colspan="7" class="text-center text-muted py-4">Chưa có biến thể nào</td>
              </tr>

              <tr v-else v-for="(r, i) in rows" :key="r.key">
                <td>
                  <input type="checkbox" v-model="r.checked" :disabled="isEdit" />
                </td>

                <td>{{ i + 1 }}</td>

                <td class="ss-name">
                  {{ r.ten }}
                </td>

                <td>
                  <input v-model="r.soLuong" type="number" min="0" class="form-control form-control-sm" />
                </td>

                <td>
                  <input v-model="r.gia" type="number" min="0" class="form-control form-control-sm" />
                </td>

                <td class="text-center">
                  <button
                    class="btn ss-icon-btn"
                    type="button"
                    title="Xóa dòng"
                    @click="removeRow(r)"
                    :disabled="isEdit"
                  >
                    <span class="material-icons-outlined">delete_outline</span>
                  </button>
                </td>

                <td>
                  <input class="d-none" type="file" :id="`file-${r.key}`" @change="(e) => onFileChange(e, r)" />

                  <div class="ss-file">
                    <button
                      class="btn btn-outline-secondary ss-file-btn"
                      type="button"
                      @click="triggerFile(r.key)"
                      :disabled="loading"
                    >
                      Chọn tệp
                    </button>
                    <div class="ss-file-name">
                      {{ r.fileName ? r.fileName : "Không có tệp nào được chọn" }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="small text-muted mt-2">
          <template v-if="isEdit">
            * Khi nhấn “Lưu chi tiết sản phẩm” sẽ cập nhật biến thể này.
          </template>
          <template v-else>
            * Khi nhấn “Thêm chi tiết sản phẩm” sẽ hỏi xác nhận trước khi thêm.
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import { refDataService } from "@/services/refDataService";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params?.id);
const isEdit = computed(() => !!id.value && String(id.value).toLowerCase() !== "new");

const productIdQuery = computed(() => {
  const v = route.query?.productId;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
});

// ====== OPTIONS ======
const loading = ref(false);
const productOptions = ref([]); // san_pham
const mauSacOptions = ref([]); // mau_sac
const kichThuocOptions = ref([]); // kich_thuoc

// ====== FORM: 2 phần trên ======
const form = reactive({
  idSanPham: null,
  maSanPham: "",
  tenSanPham: "",
  thuongHieu: "",
  xuatXu: "",
  moTaNgan: "",
});

// chọn biến thể
const selectedMauSac = ref([]); // multi
const selectedKichThuoc = ref([]); // multi

// ====== PHẦN DƯỚI ======
const common = reactive({
  soLuongChung: "",
  giaChung: "",
});

const rows = ref([]);
// row shape: { key, checked, idSanPham, idMauSac, idKichThuoc, ten, soLuong, gia, fileName, file }
const removedKeys = ref(new Set());

const hasProduct = computed(() => !!form.idSanPham);
const hasVariantsSelected = computed(() => {
  if (isEdit.value) return !!(selectedMauSac.value && selectedKichThuoc.value);
  return (selectedMauSac.value?.length || 0) > 0 && (selectedKichThuoc.value?.length || 0) > 0;
});

const selectAll = computed({
  get() {
    if (!rows.value.length) return false;
    return rows.value.every((r) => r.checked);
  },
  set(v) {
    rows.value = rows.value.map((r) => ({ ...r, checked: !!v }));
  },
});

function normalizeArr(res) {
  return Array.isArray(res) ? res : res?.data ?? [];
}

// ====== COLOR helpers ======
function pickColorHex(m) {
  const raw = m?.maMau || m?.maHex || m?.hex || m?.giaTri || m?.color || m?.maMauSac || "";
  if (typeof raw === "string" && raw.trim().startsWith("#")) return raw.trim();

  const name = (m?.tenMauSac || m?.ten || "").toLowerCase().trim();
  if (name.includes("đỏ") || name.includes("do")) return "#ff4d4f";
  if (name.includes("trắng") || name.includes("trang") || name.includes("white")) return "#ffffff";
  if (name.includes("đen") || name.includes("den") || name.includes("black")) return "#111827";
  if (name.includes("xanh") || name.includes("blue")) return "#2563eb";
  if (name.includes("vàng") || name.includes("vang") || name.includes("yellow")) return "#f59e0b";
  if (name.includes("hồng") || name.includes("hong") || name.includes("pink")) return "#ec4899";
  if (name.includes("xám") || name.includes("xam") || name.includes("gray") || name.includes("grey")) return "#9ca3af";
  return "#e5e7eb";
}

function isLight(hex) {
  try {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 200;
  } catch {
    return false;
  }
}

// ====== Chọn sản phẩm -> fill ======
const selectedProduct = computed({
  get() {
    return productOptions.value.find((x) => x.id === form.idSanPham) || null;
  },
  set(val) {
    form.idSanPham = val?.id ?? null;
  },
});

watch(
  () => form.idSanPham,
  () => {
    const p = selectedProduct.value;

    form.maSanPham = p?.maSanPham ?? p?.ma ?? "";
    form.tenSanPham = p?.tenSanPham ?? p?.ten ?? "";
    form.thuongHieu = p?.tenThuongHieu ?? p?.thuongHieu ?? "";
    form.xuatXu = p?.tenXuatXu ?? p?.xuatXu ?? "";
    form.moTaNgan = p?.moTaNgan ?? p?.moTa ?? "";

    if (!isEdit.value) {
      selectedMauSac.value = [];
      selectedKichThuoc.value = [];
      rows.value = [];
      removedKeys.value = new Set();
      common.soLuongChung = "";
      common.giaChung = "";
    }
  }
);

// ====== Build rows ======
function buildKey(idMauSac, idKichThuoc) {
  return `${idMauSac}-${idKichThuoc}`;
}

function buildRowName(colorObj, sizeObj) {
  const tenSP = form.tenSanPham || "Sản phẩm";
  const tenMau = colorObj?.tenMauSac ?? colorObj?.ten ?? colorObj?.maMauSac ?? colorObj?.ma ?? colorObj?.id;
  const tenKT = sizeObj?.tenKichThuoc ?? sizeObj?.ten ?? sizeObj?.maKichThuoc ?? sizeObj?.ma ?? sizeObj?.id;
  return `${tenSP} [${tenMau} - ${tenKT}]`;
}

function rebuildRows() {
  const idSanPham = form.idSanPham;
  if (!idSanPham) {
    rows.value = [];
    return;
  }

  const colors = isEdit.value ? (selectedMauSac.value ? [selectedMauSac.value] : []) : (selectedMauSac.value || []);
  const sizes = isEdit.value ? (selectedKichThuoc.value ? [selectedKichThuoc.value] : []) : (selectedKichThuoc.value || []);

  if (!colors.length || !sizes.length) {
    rows.value = [];
    return;
  }

  const oldMap = new Map(rows.value.map((r) => [r.key, r]));
  const removed = removedKeys.value;

  const next = [];
  for (const c of colors) {
    for (const s of sizes) {
      const key = buildKey(c.id, s.id);
      if (removed.has(key)) continue;

      const old = oldMap.get(key);

      next.push({
        key,
        checked: old?.checked ?? true,
        idSanPham,
        idMauSac: c.id,
        idKichThuoc: s.id,
        ten: buildRowName(c, s),
        soLuong: old?.soLuong ?? (common.soLuongChung !== "" ? common.soLuongChung : ""),
        gia: old?.gia ?? (common.giaChung !== "" ? common.giaChung : ""),
        file: old?.file ?? null,
        fileName: old?.fileName ?? "",
      });
    }
  }

  rows.value = next;
}

watch([selectedMauSac, selectedKichThuoc], rebuildRows);

// common auto apply
watch(
  () => common.soLuongChung,
  (v) => {
    if (!hasProduct.value || !hasVariantsSelected.value) return;
    rows.value = rows.value.map((r) => (r.checked ? { ...r, soLuong: v } : r));
  }
);

watch(
  () => common.giaChung,
  (v) => {
    if (!hasProduct.value || !hasVariantsSelected.value) return;
    rows.value = rows.value.map((r) => (r.checked ? { ...r, gia: v } : r));
  }
);

function onFileChange(e, row) {
  const f = e.target.files?.[0];
  row.file = f || null;
  row.fileName = f?.name || "";
}

function triggerFile(key) {
  const el = document.getElementById(`file-${key}`);
  el?.click();
}

function removeRow(row) {
  removedKeys.value.add(row.key);
  rows.value = rows.value.filter((r) => r.key !== row.key);
}

function back() {
  // quay về list ctsp theo productId nếu có
  const pid = productIdQuery.value || form.idSanPham;
  if (pid) return router.push(`/admin/chi-tiet-san-pham?productId=${pid}`);
  return router.push("/admin/chi-tiet-san-pham");
}

// ====== LOAD options + (optional) load edit ======
async function loadEditIfNeeded() {
  if (!isEdit.value) return;

  const res = await productDetailService.getOne(id.value);
  const row = res?.data ?? res;

  const idSanPham = row.idSanPham ?? row.sanPhamId ?? row.id_san_pham;
  const idMauSac = row.idMauSac ?? row.mauSacId ?? row.id_mau_sac;
  const idKichThuoc = row.idKichThuoc ?? row.kichThuocId ?? row.id_kich_thuoc;

  form.idSanPham = Number(idSanPham) || null;

  const ms = mauSacOptions.value.find((x) => x.id === Number(idMauSac));
  const kt = kichThuocOptions.value.find((x) => x.id === Number(idKichThuoc));

  selectedMauSac.value = ms || null;
  selectedKichThuoc.value = kt || null;

  common.soLuongChung = String(row.soLuong ?? "");
  common.giaChung = String(row.giaBan ?? row.gia ?? "");

  rebuildRows();
}

onMounted(async () => {
  loading.value = true;
  try {
    const [p, ms, kt] = await Promise.all([
      typeof productService.getAll === "function" ? productService.getAll() : productService.all(),
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
    ]);

    productOptions.value = normalizeArr(p);
    mauSacOptions.value = normalizeArr(ms);
    kichThuocOptions.value = normalizeArr(kt);

    // NEW: auto chọn SP theo query
    if (!isEdit.value && productIdQuery.value) {
      form.idSanPham = productIdQuery.value;
    }

    // EDIT: load ctsp sau khi có options
    await loadEditIfNeeded();
  } catch (e) {
    console.error(e);
    alert("Không tải được dữ liệu tham chiếu.");
  } finally {
    loading.value = false;
  }
});

// SUBMIT
async function submit() {
  if (!form.idSanPham) return alert("Vui lòng chọn sản phẩm.");
  if (!rows.value.length) return alert("Chưa có biến thể nào để thêm.");

  const selectedRows = rows.value.filter((r) => r.checked);
  if (!selectedRows.length) return alert("Bạn chưa tick dòng nào để thêm.");

  // EDIT: chỉ cho 1 dòng
  if (isEdit.value && selectedRows.length !== 1) {
    return alert("Chế độ sửa chỉ áp dụng cho 1 biến thể.");
  }

  const ok = confirm(
    isEdit.value
      ? "Bạn có muốn lưu thay đổi chi tiết sản phẩm này không?"
      : `Bạn có muốn thêm ${selectedRows.length} chi tiết sản phẩm không?`
  );
  if (!ok) return;

  try {
    loading.value = true;

    if (isEdit.value) {
      const r = selectedRows[0];
      const payload = {
        idSanPham: r.idSanPham,
        idMauSac: r.idMauSac,
        idKichThuoc: r.idKichThuoc,
        soLuong: Number(r.soLuong || 0),
        giaBan: Number(r.gia || 0),
      };

      if (typeof productDetailService.update === "function") await productDetailService.update(id.value, payload);
      else throw new Error("productDetailService thiếu update");

      alert("Lưu chi tiết sản phẩm thành công!");
      back();
      return;
    }

    // CREATE (bulk)
    await Promise.all(
      selectedRows.map((r) => {
        const payload = {
          idSanPham: r.idSanPham,
          idMauSac: r.idMauSac,
          idKichThuoc: r.idKichThuoc,
          soLuong: Number(r.soLuong || 0),
          giaBan: Number(r.gia || 0),
        };
        return productDetailService.create(payload);
      })
    );

    alert("Thêm chi tiết sản phẩm thành công!");
    router.push("/admin/chi-tiet-san-pham");
  } catch (e) {
    console.error(e);
    alert(isEdit.value ? "Lưu thất bại. Kiểm tra BE/log hoặc payload." : "Thêm thất bại. Kiểm tra BE/log hoặc payload.");
  } finally {
    loading.value = false;
  }
}
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
.ss-card-title {
  font-weight: 700;
}
.ss-empty {
  padding: 26px 10px;
  text-align: center;
  color: #6b7280;
}

.ss-common {
  align-items: flex-end;
}
.ss-common-item {
  width: 230px;
}
.ss-add-btn {
  border-radius: 12px;
  padding: 12px 18px;
}

/* KHÔNG để ... ở file text */
.ss-file {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ss-file-btn {
  border-radius: 8px;
  padding: 6px 10px;
}
.ss-file-name {
  color: #374151;
  font-size: 13px;
  white-space: normal; /* ✅ hiển thị full */
  overflow: visible; /* ✅ */
  text-overflow: clip; /* ✅ */
}

.ss-name {
  white-space: normal; /* ✅ không ... ở tên */
}

.ss-icon-btn {
  border: 1px solid rgba(255, 77, 79, 0.45);
  color: #ff4d4f;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.ss-icon-btn:hover {
  background: rgba(255, 77, 79, 0.06);
}

.ss-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  flex: 0 0 auto;
}
</style>
