<!-- File: src/pages/khuyen_mai/dot_giam_gia/AddDiscountPage.vue -->
<template>
  <div class="discount-page">
    <div class="header-section">
      <h2 class="page-title">THÊM ĐỢT GIẢM GIÁ</h2>
      <button class="btn-back" @click="router.push('/admin/giam-gia/dot')">
        <i class="fa-solid fa-arrow-left"></i> Quay lại
      </button>
    </div>

    <div class="content-wrapper">
      <!-- Cột trái: Form thông tin -->
      <div class="left-column">
        <div class="card info-card">
          <h4 class="card-title">Thông tin đợt giảm giá</h4>

          <div class="form-group">
            <label class="label">Mã đợt (Tự động sinh):</label>
            <input
              type="text"
              class="form-control"
              disabled
              placeholder="Mã tự sinh (DGG-...)"
              style="background-color: #f1f5f9"
            />
          </div>

          <div class="form-group">
            <label class="label"
              >Tên đợt giảm giá: <span class="text-red">*</span></label
            >
            <input
              v-model="formData.tenDotGiamGia"
              type="text"
              class="form-control"
              placeholder="Nhập tên đợt..."
              :disabled="isLoading"
            />
          </div>

          <div class="form-group row-group">
            <label class="label" style="min-width: 120px">Loại giảm giá:</label>
            <div class="radio-group">
              <div class="d-flex align-items-center gap-2">
                <input
                  type="radio"
                  :value="false"
                  v-model="formData.loaiGiamGia"
                  disabled
                />
                <span class="font-weight-normal">% Phần trăm</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="label"
              >Giá trị giảm (%): <span class="text-red">*</span></label
            >
            <input
              v-model.number="formData.giaTriGiamGia"
              type="number"
              class="form-control"
              placeholder="Vui lòng nhập giá trị giảm"
              min="1"
              max="100"
              :disabled="isLoading"
            />
            <div class="hint" v-if="formData.giaTriGiamGia !== null && (formData.giaTriGiamGia < 1 || formData.giaTriGiamGia > 100)">
              Giá trị giảm phải nằm trong khoảng 1 - 100 (%).
            </div>
          </div>

          <div class="form-group">
            <label class="label"
              >Ngày bắt đầu: <span class="text-red">*</span></label
            >
            <input
              v-model="formData.ngayBatDau"
              type="date"
              class="form-control"
              @click="$event.target.showPicker()"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label class="label"
              >Ngày kết thúc: <span class="text-red">*</span></label
            >
            <input
              v-model="formData.ngayKetThuc"
              type="date"
              class="form-control"
              @click="$event.target.showPicker()"
              :disabled="isLoading"
            />
            <div class="hint" v-if="dateError">
              {{ dateError }}
            </div>
          </div>

          <div class="action-buttons mt-4">
            <button
              class="btn-update"
              @click="submitCreate"
              :disabled="isLoading || !canSubmit"
              :title="!canSubmit ? 'Vui lòng nhập đúng dữ liệu bắt buộc' : ''"
            >
              <i class="fa-solid fa-plus me-1"></i>
              {{ isLoading ? "Đang xử lý..." : "Tạo đợt giảm giá" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cột phải: Chọn sản phẩm -->
      <div class="right-column">
        <div class="card product-select-card">
          <h4 class="card-title">Chọn sản phẩm áp dụng</h4>

          <div class="search-bar mb-3">
            <div class="input-wrapper">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Source Filters -->
          <div class="filter-grid mb-3">
            <select v-model="sourceFilters.brand" class="form-select-sm bg-white" :disabled="isLoading">
              <option value="">-- Thương hiệu --</option>
              <option v-for="opt in sourceFilterOptions.brands" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>

            <select v-model="sourceFilters.origin" class="form-select-sm bg-white" :disabled="isLoading">
              <option value="">-- Xuất xứ --</option>
              <option v-for="opt in sourceFilterOptions.origins" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>

            <button
              class="btn-clear-filter bg-white"
              type="button"
              @click="clearSourceFilters"
              title="Xóa bộ lọc"
              :disabled="isLoading"
            >
              <i class="fa-solid fa-filter-circle-xmark"></i>
            </button>
          </div>

          <div class="table-wrapper-mini">
            <table class="custom-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 50px" />
                <col style="width: 60px" />
                <col style="width: 150px" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th class="text-center">#</th>
                  <th class="text-center">Ảnh</th>
                  <th class="text-center">Mã SP</th>
                  <th class="text-center">Tên sản phẩm</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredParentProducts.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">
                    Không tìm thấy dữ liệu
                  </td>
                </tr>

                <template v-for="group in paginatedParentProducts" :key="group.idSanPham">
                  <tr class="parent-row">
                    <td class="text-center">
                      <button class="btn-expand" @click="toggleExpand(group.idSanPham)" type="button">
                        <i
                          class="fa-solid"
                          :class="expandedGroupIds.includes(group.idSanPham) ? 'fa-minus' : 'fa-plus'"
                        ></i>
                      </button>
                    </td>

                    <td class="text-center" @click.stop>
                      <input
                        type="checkbox"
                        class="custom-checkbox"
                        :checked="isGroupSelected(group.idSanPham)"
                        @change="handleParentCheck(group.idSanPham, $event.target.checked)"
                      />
                    </td>

                    <td class="text-center td-click" @click="toggleExpand(group.idSanPham)">
                      <img :src="getGroupThumb(group)" class="product-thumb" @error="onImgError" alt="thumb" />
                    </td>

                    <td class="text-center td-click" @click="toggleExpand(group.idSanPham)">
                      {{ group.maSanPham }}
                    </td>

                    <td class="text-center td-click" @click="toggleExpand(group.idSanPham)">
                      {{ group.tenSanPham }}
                    </td>
                  </tr>

                  <tr
                    v-if="expandedGroupIds.includes(group.idSanPham)"
                    v-for="v in group.variants"
                    :key="v.id"
                    class="child-row"
                    @click="fillSourceFilters(v)"
                    style="cursor: pointer"
                    title="Click để điền bộ lọc"
                  >
                    <td></td>

                    <td class="text-center" @click.stop>
                      <input
                        type="checkbox"
                        class="custom-checkbox"
                        :value="v.id"
                        v-model="selectedVariantIds"
                        @change="onSourceCheckboxChange"
                      />
                    </td>

                    <td class="text-center">
                      <img :src="getVariantThumb(v)" class="product-thumb-sm" @error="onImgError" alt="thumb" />
                    </td>

                    <td class="text-center text-muted small">{{ v.maChiTietSanPham }}</td>
                    <td class="small">{{ v.tenMauSac }} - {{ v.tenKichThuoc }} - {{ v.tenLoaiSan }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div class="pagination" v-if="totalPages > 0">
            <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="page-btn active">{{ currentPage }}</button>
            <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Danh sách chi tiết đã chọn -->
    <div class="bottom-section">
      <div class="card detail-card">
        <div class="detail-header">
          <h3 class="section-title">
            Danh sách chi tiết sản phẩm được chọn
            <span v-if="selectedVariantIds.length" class="count-tag">({{ selectedVariantIds.length }})</span>
          </h3>
          <button class="btn-danger-outline" @click="removeAll" v-if="selectedVariantIds.length > 0">
            <i class="fa-solid fa-trash"></i> Xóa tất cả
          </button>
        </div>

        <div class="filter-grid mb-3" v-if="selectedVariantIds.length > 0">
          <select v-model="detailFilters.brand" class="form-select-sm bg-white">
            <option value="">-- Thương hiệu --</option>
            <option v-for="opt in filterOptions.brands" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.material" class="form-select-sm bg-white">
            <option value="">-- Chất liệu --</option>
            <option v-for="opt in filterOptions.materials" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.size" class="form-select-sm bg-white">
            <option value="">-- Kích cỡ --</option>
            <option v-for="opt in filterOptions.sizes" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.color" class="form-select-sm bg-white">
            <option value="">-- Màu sắc --</option>
            <option v-for="opt in filterOptions.colors" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.sole" class="form-select-sm bg-white">
            <option value="">-- Loại sân --</option>
            <option v-for="opt in filterOptions.soles" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <button class="btn-clear-filter bg-white" type="button" @click="clearDetailFilters" title="Xóa bộ lọc">
            <i class="fa-solid fa-filter-circle-xmark"></i>
          </button>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th width="40" class="text-center">
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    @change="toggleAllVariants"
                    :checked="isAllVariantsSelected"
                  />
                </th>
                <th class="text-center" width="50">STT</th>
                <th class="text-center" width="60">Ảnh</th>
                <th>Mã SP (CT)</th>
                <th class="text-center">Tên sản phẩm</th>
                <th class="text-center">Giá bán</th>
                <th class="text-center">Thương hiệu</th>
                <th class="text-center">Chất liệu</th>
                <th class="text-center">Kích cỡ</th>
                <th class="text-center">Màu sắc</th>
                <th class="text-center">Loại sân</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="variantsDisplay.length === 0">
                <td colspan="11" class="text-center text-muted py-5">
                  <div class="empty-state">
                    <i class="fa-solid fa-box-open fa-2x mb-2"></i>
                    <p>Chưa có sản phẩm nào được chọn.</p>
                  </div>
                </td>
              </tr>

              <tr
                v-for="(item, index) in paginatedVariantsDisplay"
                :key="item.id"
                @click="fillFilters(item)"
                style="cursor: pointer"
                title="Click để điền thông tin vào bộ lọc"
              >
                <td class="text-center" @click.stop>
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    :value="item.id"
                    v-model="selectedVariantIds"
                    @change="onDetailCheckboxChange"
                  />
                </td>

                <td class="text-center">
                  {{ (currentDetailPage - 1) * detailItemsPerPage + index + 1 }}
                </td>

                <td class="text-center">
                  <img :src="getVariantThumb(item)" class="product-thumb-sm" @error="onImgError" alt="thumb" />
                </td>

                <td class="text-primary">{{ item.maChiTietSanPham }}</td>

                <td class="text-wrap-name text-center">{{ item.tenSanPham }}</td>

                <td class="text-center">{{ formatCurrency(item.giaNiemYet) }}</td>
                <td class="text-center">{{ item.tenThuongHieu }}</td>
                <td class="text-center">{{ item.tenChatLieu }}</td>
                <td class="text-center">{{ item.tenKichThuoc }}</td>

                <td class="text-center">
                  <span class="color-dot" :style="{ backgroundColor: mapColor(item.tenMauSac) }"></span>
                  {{ item.tenMauSac }}
                </td>

                <td class="text-center">{{ item.tenLoaiSan }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="totalDetailPages > 0">
          <button class="page-btn" @click="changeDetailPage(currentDetailPage - 1)" :disabled="currentDetailPage === 1">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="page-btn active">{{ currentDetailPage }}</button>
          <button
            class="page-btn"
            @click="changeDetailPage(currentDetailPage + 1)"
            :disabled="currentDetailPage === totalDetailPages"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { discountService } from "@/services/khuyen_mai/dot_giam_gia/discountService";
import { useRouter } from "vue-router";

const router = useRouter();

/* =========================
   FIX ẢNH: normalize + fallback
   ========================= */
const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  ""
);

const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='6' fill='%23F3F4F6'/%3E%3Cpath d='M12 26l6-6 4 4 6-6 4 4' stroke='%239CA3AF' stroke-width='2' fill='none'/%3E%3Ccircle cx='16' cy='16' r='2' fill='%239CA3AF'/%3E%3C/svg%3E";

const normalizeImgUrl = (raw) => {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  if (s.startsWith("data:image/")) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  if (s.startsWith("uploads/")) return `${API_BASE}/${s}`;
  return `${API_BASE}/uploads/${s}`;
};

const extractRawImg = (v) => {
  return v?.anh || v?.urlAnh || v?.duongDanAnh || v?.anhDaiDien || v?.anhSanPham || v?.hinhAnh || v?.image || v?.imageUrl || v?.thumbnail || "";
};

const getVariantThumb = (v) => normalizeImgUrl(extractRawImg(v)) || IMG_PLACEHOLDER;

const getGroupThumb = (group) => {
  if (!group?.variants?.length) return IMG_PLACEHOLDER;
  const pick = group.variants.find((x) => normalizeImgUrl(extractRawImg(x))) || group.variants[0];
  return getVariantThumb(pick);
};

const onImgError = (e) => {
  const img = e?.target;
  if (!img) return;
  if (img.src === IMG_PLACEHOLDER) return;
  img.src = IMG_PLACEHOLDER;
};
/* ========================= */

const formData = reactive({
  tenDotGiamGia: "",
  loaiGiamGia: false,
  giaTriGiamGia: null,
  ngayBatDau: "",
  ngayKetThuc: "",
  trangThai: true,
});

const rawVariants = ref([]);
const selectedVariantIds = ref([]);

const searchKeyword = ref("");
const isLoading = ref(false);

const currentPage = ref(1);
const itemsPerPage = 5;

const currentDetailPage = ref(1);
const detailItemsPerPage = 5;

const expandedGroupIds = ref([]);

// SOURCE FILTERS
const sourceFilters = reactive({ brand: "", origin: "" });

const sourceFilterOptions = computed(() => {
  const data = rawVariants.value;
  const getOpts = (k) => [...new Set(data.map((i) => i[k]))].filter(Boolean).sort();
  return {
    brands: getOpts("tenThuongHieu"),
    origins: getOpts("tenXuatXu"),
  };
});

const clearSourceFilters = () => {
  sourceFilters.brand = "";
  sourceFilters.origin = "";
};

const fillSourceFilters = (item) => {
  sourceFilters.brand = item.tenThuongHieu || "";
  sourceFilters.origin = item.tenXuatXu || "";
};

const onSourceCheckboxChange = (e) => {
  if (!e.target.checked) clearSourceFilters();
};

// COMPUTED: group sản phẩm
const productGroups = computed(() => {
  const groups = {};
  rawVariants.value.forEach((v) => {
    const pId = v.idSanPham;
    if (!groups[pId]) {
      groups[pId] = {
        idSanPham: pId,
        tenSanPham: v.tenSanPham,
        maSanPham: v.maSanPham || `SP-${pId}`,
        variants: [],
      };
    }
    groups[pId].variants.push(v);
  });
  return Object.values(groups);
});

const filteredParentProducts = computed(() => {
  let groups = productGroups.value;

  if (searchKeyword.value) {
    const key = searchKeyword.value.toLowerCase();
    groups = groups.filter(
      (g) => (g.tenSanPham || "").toLowerCase().includes(key) || (g.maSanPham || "").toLowerCase().includes(key)
    );
  }

  if (sourceFilters.brand || sourceFilters.origin) {
    groups = groups.filter((g) =>
      g.variants.some((v) => {
        const matchBrand = !sourceFilters.brand || v.tenThuongHieu === sourceFilters.brand;
        const matchOrigin = !sourceFilters.origin || v.tenXuatXu === sourceFilters.origin;
        return matchBrand && matchOrigin;
      })
    );
  }

  return groups;
});

const totalPages = computed(() => Math.ceil(filteredParentProducts.value.length / itemsPerPage));

const paginatedParentProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredParentProducts.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

// reset trang khi thay đổi tìm kiếm / lọc nguồn
watch(searchKeyword, () => (currentPage.value = 1));
watch(
  () => [sourceFilters.brand, sourceFilters.origin],
  () => (currentPage.value = 1)
);

// chặn currentPage vượt totalPages
watch(
  () => filteredParentProducts.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = Math.max(1, totalPages.value);
  }
);

const allSelectedVariants = computed(() => rawVariants.value.filter((v) => selectedVariantIds.value.includes(v.id)));

// FILTERS (bảng dưới)
const detailFilters = reactive({
  brand: "",
  material: "",
  color: "",
  size: "",
  sole: "",
});

const filterOptions = computed(() => {
  const data = allSelectedVariants.value;
  const getOptions = (key) => [...new Set(data.map((item) => item[key]))].filter(Boolean).sort();
  return {
    brands: getOptions("tenThuongHieu"),
    materials: getOptions("tenChatLieu"),
    colors: getOptions("tenMauSac"),
    sizes: getOptions("tenKichThuoc"),
    soles: getOptions("tenLoaiSan"),
  };
});

const variantsDisplay = computed(() => {
  let list = allSelectedVariants.value;
  if (detailFilters.brand) list = list.filter((v) => v.tenThuongHieu === detailFilters.brand);
  if (detailFilters.material) list = list.filter((v) => v.tenChatLieu === detailFilters.material);
  if (detailFilters.color) list = list.filter((v) => v.tenMauSac === detailFilters.color);
  if (detailFilters.size) list = list.filter((v) => v.tenKichThuoc === detailFilters.size);
  if (detailFilters.sole) list = list.filter((v) => v.tenLoaiSan === detailFilters.sole);
  return list;
});

const clearDetailFilters = () => Object.keys(detailFilters).forEach((k) => (detailFilters[k] = ""));

watch(detailFilters, () => (currentDetailPage.value = 1), { deep: true });

const fillFilters = (item) => {
  detailFilters.brand = item.tenThuongHieu || "";
  detailFilters.material = item.tenChatLieu || "";
  detailFilters.color = item.tenMauSac || "";
  detailFilters.size = item.tenKichThuoc || "";
  detailFilters.sole = item.tenLoaiSan || "";
};

const onDetailCheckboxChange = (e) => {
  if (!e.target.checked) clearDetailFilters();
};

const totalDetailPages = computed(() => Math.ceil(variantsDisplay.value.length / detailItemsPerPage));

const paginatedVariantsDisplay = computed(() => {
  const start = (currentDetailPage.value - 1) * detailItemsPerPage;
  const end = start + detailItemsPerPage;
  return variantsDisplay.value.slice(start, end);
});

const changeDetailPage = (page) => {
  if (page >= 1 && page <= totalDetailPages.value) currentDetailPage.value = page;
};

watch(
  () => variantsDisplay.value.length,
  () => {
    if (currentDetailPage.value > totalDetailPages.value) currentDetailPage.value = Math.max(1, totalDetailPages.value);
  }
);

const isAllVariantsSelected = computed(() => {
  return variantsDisplay.value.length > 0 && variantsDisplay.value.every((v) => selectedVariantIds.value.includes(v.id));
});

// METHODS
const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await discountService.getAllProductDetails();
    const arr = Array.isArray(res) ? res : res?.content ?? [];
    rawVariants.value = arr;
  } catch (e) {
    console.error("Lỗi tải dữ liệu sản phẩm: ", e);
    alert("Lỗi: Không thể tải danh sách sản phẩm.");
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value ?? 0);
};

const toggleExpand = (groupId) => {
  if (expandedGroupIds.value.includes(groupId)) expandedGroupIds.value = expandedGroupIds.value.filter((id) => id !== groupId);
  else expandedGroupIds.value.push(groupId);
};

const isGroupSelected = (parentId) => {
  const group = productGroups.value.find((g) => g.idSanPham === parentId);
  if (!group) return false;
  return group.variants.length > 0 && group.variants.every((v) => selectedVariantIds.value.includes(v.id));
};

const handleParentCheck = (parentId, isChecked) => {
  const group = productGroups.value.find((g) => g.idSanPham === parentId);
  if (!group) return;
  const childIds = group.variants.map((v) => v.id);

  if (isChecked) selectedVariantIds.value = [...new Set([...selectedVariantIds.value, ...childIds])];
  else {
    selectedVariantIds.value = selectedVariantIds.value.filter((id) => !childIds.includes(id));
    clearSourceFilters();
  }
};

const toggleAllVariants = (e) => {
  const visibleIds = variantsDisplay.value.map((v) => v.id);
  if (e.target.checked) selectedVariantIds.value = Array.from(new Set([...selectedVariantIds.value, ...visibleIds]));
  else selectedVariantIds.value = selectedVariantIds.value.filter((id) => !visibleIds.includes(id));
};

const removeAll = () => {
  selectedVariantIds.value = [];
  clearDetailFilters();
  currentDetailPage.value = 1;
};

const normalizeDate = (d, isEnd = false) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  if (isEnd) x.setHours(23, 59, 59, 999);
  else x.setHours(0, 0, 0, 0);
  return x;
};

const dateError = computed(() => {
  if (!formData.ngayBatDau || !formData.ngayKetThuc) return "";
  const s = normalizeDate(formData.ngayBatDau, false);
  const e = normalizeDate(formData.ngayKetThuc, true);
  if (!s || !e) return "Ngày không hợp lệ.";
  if (s > e) return "Ngày bắt đầu không được lớn hơn ngày kết thúc.";
  return "";
});

const canSubmit = computed(() => {
  if (!formData.tenDotGiamGia?.trim()) return false;
  if (!formData.ngayBatDau || !formData.ngayKetThuc) return false;
  if (dateError.value) return false;
  if (formData.giaTriGiamGia === null || formData.giaTriGiamGia === "") return false;
  const v = Number(formData.giaTriGiamGia);
  if (Number.isNaN(v) || v < 1 || v > 100) return false;
  return true;
});

const checkOverlaps = async (newStart, newEnd, selectedIds) => {
  const allDiscounts = await discountService.getAll();
  const overlappingDiscounts = (Array.isArray(allDiscounts) ? allDiscounts : []).filter((d) => {
    if (!d.trangThai) return false;

    const dStart = normalizeDate(d.ngayBatDau, false);
    const dEnd = normalizeDate(d.ngayKetThuc, true);
    const nStart = normalizeDate(newStart, false);
    const nEnd = normalizeDate(newEnd, true);

    if (!dStart || !dEnd || !nStart || !nEnd) return false;
    return nStart <= dEnd && nEnd >= dStart;
  });

  for (const discount of overlappingDiscounts) {
    const details = await discountService.getDiscountDetails(discount.id);
    const conflict = (Array.isArray(details) ? details : []).find((detail) => selectedIds.includes(detail.idChiTietSanPham));
    if (conflict) {
      const variant = rawVariants.value.find((v) => v.id === conflict.idChiTietSanPham);
      return { overlap: true, discountName: discount.tenDotGiamGia, productName: variant ? variant.tenSanPham : "Sản phẩm" };
    }
  }
  return { overlap: false };
};

const submitCreate = async () => {
  if (!canSubmit.value) {
    alert("Vui lòng nhập đúng và đủ thông tin bắt buộc (tên, ngày, % giảm 1-100).");
    return;
  }

  if (selectedVariantIds.value.length === 0) {
    if (!confirm("Bạn chưa chọn sản phẩm nào. Tiếp tục tạo?")) return;
  }

  if (selectedVariantIds.value.length > 0) {
    try {
      const overlapCheck = await checkOverlaps(formData.ngayBatDau, formData.ngayKetThuc, selectedVariantIds.value);
      if (overlapCheck.overlap) {
        alert(`Lỗi trùng lặp: Sản phẩm "${overlapCheck.productName}" đã nằm trong đợt giảm giá "${overlapCheck.discountName}" trong khoảng thời gian này.`);
        return;
      }
    } catch (e) {
      console.error(e);
      alert("Không kiểm tra được trùng lặp đợt giảm giá. Vui lòng thử lại.");
      return;
    }
  }

  const payload = { ...formData, idChiTietSanPhams: selectedVariantIds.value };

  try {
    isLoading.value = true;
    await discountService.createDiscountComposite(payload);
    alert("Tạo đợt giảm giá thành công!");
    router.push("/admin/giam-gia/dot");
  } catch (e) {
    alert("Lỗi tạo mới: " + (e.response?.data?.message || e.message));
  } finally {
    isLoading.value = false;
  }
};

const mapColor = (colorName) => {
  if (!colorName) return "#ccc";
  const lower = colorName.toLowerCase();
  if (lower.includes("đỏ")) return "#ef4444";
  if (lower.includes("xanh lá") || lower.includes("lục")) return "#22c55e";
  if (lower.includes("xanh dương") || lower.includes("xanh")) return "#3b82f6";
  if (lower.includes("đen")) return "#000";
  if (lower.includes("trắng")) return "#f8fafc";
  if (lower.includes("vàng")) return "#eab308";
  if (lower.includes("cam")) return "#f97316";
  if (lower.includes("tím")) return "#a855f7";
  if (lower.includes("hồng")) return "#ec4899";
  if (lower.includes("xám") || lower.includes("ghi")) return "#64748b";
  if (lower.includes("nâu")) return "#78350f";
  return "#ccc";
};

onMounted(loadData);
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

* { box-sizing: border-box; }
.discount-page { padding-bottom: 30px; font-family: "Inter", "Segoe UI", sans-serif; }

/* Header */
.header-section { display:flex; justify-content: space-between; align-items:center; margin-bottom: 30px; margin-top: 10px; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
.btn-back { background: #64748b; color: white; border:none; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor:pointer; display:flex; align-items:center; gap: 6px; transition: 0.2s; }
.btn-back:hover { background: #475569; }

/* Layout */
.content-wrapper { display:grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px; }
.left-column, .right-column { min-width:0; display:flex; flex-direction: column; }

.bottom-section { margin-top: 12px; }
.detail-card { width: 100%; }

/* Card */
.card { background:#fff; border-radius:10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border:none; display:flex; flex-direction: column; }
.card-title { font-size:16px; font-weight:600; color:#334155; margin-bottom:20px; border-bottom:1px solid #f1f5f9; padding-bottom:10px; }
.info-card, .product-select-card { height: 100%; }

/* Form */
.form-group { margin-bottom: 16px; }
.label { font-size:13px; font-weight:500; color:#64748b; margin-bottom: 8px; display:block; }
.text-red { color:#ef4444; }
.form-control { width:100%; height:40px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline:none; transition: 0.2s; }
.form-control:focus { border-color:#3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.radio-group { display:flex; gap: 20px; }

.hint { margin-top: 6px; font-size: 12px; color: #ef4444; }

/* Buttons */
.action-buttons { display:flex; gap:10px; margin-top:auto; justify-content:center; }
.btn-update { background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%); color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:500; cursor:pointer; display:flex; align-items:center; transition: 0.2s; flex:1; justify-content:center; }
.btn-update:hover { filter: brightness(0.98); }
.btn-update:disabled { opacity:0.7; cursor:not-allowed; }

/* Search */
.search-bar { margin-bottom: 16px; }
.input-wrapper { position: relative; width: 100%; }
.input-wrapper input { padding-left: 36px; width:100%; height:40px; border:1px solid #e2e8f0; border-radius:6px; background-color:#fff; outline:none; }
.search-icon { position:absolute; left:12px; top:50%; transform: translateY(-50%); color:#94a3b8; }

/* Table */
.table-wrapper-mini { height: 450px; overflow-y:auto; border:1px solid #e2e8f0; border-radius: 8px; }
.table-responsive { overflow-x:auto; border:1px solid #e2e8f0; border-radius:8px; }

.custom-table { width:100%; border-collapse: collapse; font-size:14px; }
.custom-table th { background:#f8fafc; color:#475569; font-weight:500; padding:12px; border-bottom:1px solid #e2e8f0; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
.custom-table td { padding:12px; border-bottom:1px solid #f1f5f9; vertical-align: middle; color:#334155; }
.custom-table tr:hover td { background-color:#f8fafc; }

.parent-row td { background: #fff; }
.child-row td { background-color:#f8fafc; border-bottom:1px solid #f1f5f9; }

.td-click { cursor: pointer; }

/* Pagination */
.pagination { display:flex; justify-content:center; gap:8px; margin-top:auto; padding-top:16px; }
.page-btn { width:32px; height:32px; border:1px solid #e2e8f0; background:white; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: all 0.2s; color:#64748b; }
.page-btn:hover:not(:disabled) { background:#f8fafc; border-color:#cbd5e1; }
.page-btn.active { background:#1e293b; color:#fff; border-color:#1e293b; }
.page-btn:disabled { opacity:0.5; cursor:not-allowed; }

/* Detail header */
.detail-header { display:flex; justify-content: space-between; align-items:center; margin-bottom:15px; }
.section-title { font-size:16px; font-weight:600; color:#1e293b; margin:0; }
.count-tag { background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:10px; font-size:12px; margin-left:8px; }
.btn-danger-outline { background:transparent; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:4px 10px; font-size:12px; cursor:pointer; transition:0.2s; }
.btn-danger-outline:hover { background:#fef2f2; }

/* Misc */
.text-center { text-align:center; }
.text-primary { color:#2563eb; }
.text-muted { color:#94a3b8; }

.product-thumb { width:40px; height:40px; object-fit: cover; border-radius:4px; border:1px solid #eee; background:#fff; }
.product-thumb-sm { width:32px; height:32px; object-fit: cover; border-radius:4px; border:1px solid #eee; background:#fff; }

.btn-expand { background:none; border:none; cursor:pointer; color:#64748b; width:24px; height:24px; }
.btn-expand:hover { color:#0f172a; }

.filter-grid { display:flex; gap:10px; flex-wrap: wrap; align-items:center; }
.form-select-sm { padding:6px 10px; border:1px solid #e2e8f0; border-radius:6px; font-size:13px; outline:none; min-width:120px; color:#334155; }
.bg-white { background-color:#fff !important; }

.btn-clear-filter { background:#f1f5f9; border:1px solid #e2e8f0; color:#64748b; width:34px; height:34px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.btn-clear-filter:hover { color:#ef4444; border-color:#ef4444; }

.font-weight-normal { font-weight: 400 !important; }
.color-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:4px; border:1px solid #cbd5e1; }
.custom-checkbox { width:16px; height:16px; cursor:pointer; accent-color:#ef4444; background-color:#fff; }
.empty-state { text-align:center; color:#cbd5e1; padding:20px; }

.text-wrap-name { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 1024px) {
  .content-wrapper { grid-template-columns: 1fr; }
}
</style>
