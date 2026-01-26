<template>
  <div class="taikhoan-nhanvien" v-if="!isPage">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input v-model="filters.keyword" type="text" placeholder="Tìm kiếm" class="search-input" />
        </div>

      </div>

      <div class="toolbar-right">
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="filters.status" class="form-select rounded-3 no-border-select">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        <button class="btn btn-newaccount" @click="themnv">
          <i class="fa-solid fa-plus"></i> Tạo Tài Khoản
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Tên tài khoản</th>
            <th>Email</th>
            <th>Họ và tên</th>
            <th>Chức vụ</th>
            <th>Địa chỉ</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in nhanVienList" :key="item.id">
            <td class="text-bold text-gray">
              {{ pageNo * pageSize + index + 1 }}
            </td>

            <td class="img-cell">
              <div class="avatar-wrapper">
                <img v-if="item.anhNhanVien" :src="getImageUrl(item.anhNhanVien)" class="avatar-img" />
                <i v-else class="bi bi-person avatar-icon"></i>
              </div>
            </td>



            <td class="text-bold text-gray">
              {{ item.tenTaiKhoan }}
            </td>

            <td class="text-gray">
              {{ item.email }}
            </td>

            <td class="text-bold text-gray">
              {{ item.tenNhanVien }}
            </td>

            <td class="text-gray">
              {{ getTenChucVu(item.idQuyenHan) }}
            </td>


            <td class="text-gray">
              {{ [item.diaChiCuThe, item.phuong, item.quan, item.thanhPho].filter(Boolean).join(', ') || 'Chưa có' }}
            </td>

            <td>
              <div class="date">
                <span class="sub-date">
                  {{ formatDate(item.ngayTao) }}
                </span>
              </div>
            </td>

            <td>
              <span class="badge" :class="item.trangThai ? 'status-active' : 'status-ended'">
                {{ item.trangThai ? 'Hoạt động' : 'Ngừng hoạt động' }}
              </span>

            </td>

            <td class="text-center">
              <button class="btn-icon view" @click="updatednv(item.id)"><i class="fa-regular fa-eye"></i></button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>

    <div class="pagination-container">
      <button class="page-btn" :class="{ disabled: pageNo === 0 }" @click="pageNo--; handleFilter()"
        :disabled="pageNo === 0">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="page-btn active">{{ pageNo + 1 }}</button>
      <button class="page-btn" :class="{ disabled: pageNo >= totalPages - 1 }" :disabled="pageNo >= totalPages - 1"
        @click="pageNo++; handleFilter()">
        <i class="fa-solid fa-chevron-right"></i>
      </button>

    </div>
  </div>

  <router-view />
</template>

<script setup>
import { searchNhanVien, pagingNhanVien } from '@/services/tai_khoan/nhan_vien/nhan_vienService';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { getAllQuyenHan } from '@/services/tai_khoan/nhan_vien/quyen_nhanService';

const router = useRouter();
const route = useRoute();
const pageNo = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)
const totalElements = ref(0)

const nhanVienList = ref([])
const nhanVienOrigin = ref([])
const listQuyenHan = ref([])

const BASE_URL = "http://localhost:8080";

const filters = ref({
  keyword: '',
  status: ''
});

const getTenChucVu = (id) => {
  if (!id) return 'Chưa có';

  const qh = listQuyenHan.value.find(qh => qh.id === id);
  return qh ? qh.tenQuyenHan : 'Chưa có';
};


const themnv = () => {
  router.push({ name: 'nv-add' });
};

const updatednv = (id) => {
  router.push({ name: 'nv-update', params: { id } });
};

const isPage = computed(() =>
  route.name === 'nv-add' || route.name === 'nv-update'
);

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

const getImageUrl = (imageData) => {
  if (!imageData) return null;

  // preview từ upload
  if (imageData.startsWith("data:")) {
    return imageData;
  }

  // đảm bảo luôn có dấu /
  if (imageData.startsWith("/add/nhanvien/")) {
    return BASE_URL + imageData;
  } else {
    return BASE_URL + "/add/nhanvien/" + imageData;
  }
};


const handleFilter = async () => {
  try {
    // Có keyword → search
    if (filters.value.keyword.trim()) {
      const res = await searchNhanVien(filters.value.keyword.trim());
      // Hàm searchNhanVien có thể trả về một mảng (không phân trang) hoặc một đối tượng phân trang { content, totalPages }.
      if (Array.isArray(res)) {
        nhanVienOrigin.value = res;
        totalPages.value = 1;
      } else {
        nhanVienOrigin.value = res?.content ?? [];
        totalPages.value = res?.totalPages ?? 0;
      }
    }
    // Không keyword → paging thường
    else {
      const res = await pagingNhanVien(pageNo.value, pageSize.value);
      nhanVienOrigin.value = res?.content ?? [];
      totalPages.value = res?.totalPages ?? 0;
    }

    applyStatusFilter();
  } catch (e) {
    console.log('Filter error', e);
  }
};

const applyStatusFilter = () => {
  const source = Array.isArray(nhanVienOrigin.value) ? nhanVienOrigin.value : (nhanVienOrigin.value ?? []);

  if (!filters.value.status) {
    nhanVienList.value = source;
    return;
  }

  const isActive = filters.value.status === 'active';

  nhanVienList.value = source.filter(item => Boolean(item.trangThai) === isActive);
};


watch(
  filters,
  () => {
    pageNo.value = 0;   // reset về trang đầu
    handleFilter();    // gọi lại API
  },
  { deep: true }
);

watch(
  () => route.path,
  (newPath) => {
    if (!newPath.includes('/nhanvien/add') && !newPath.includes('/nhanvien/update')) {
      handleFilter();
    }
  }
);

const getAllQH = async () => {
  try {
    listQuyenHan.value = await getAllQuyenHan();
  } catch (error) {
    console.log("Lỗi lấy danh sách quyền hạn:", error);
  }
};

onMounted(() => {
  handleFilter();
  getAllQH();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.taikhoan-nhanvien {
  font-family: 'Inter', sans-serif;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  margin: 20px;
}

.text-bold {
  font-weight: 600;
}

.text-gray {
  color: #6B7280;
}

.text-center {
  text-align: center;
}

.w-50 {
  width: 50px;
}

/* ===== TOOLBAR ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 24px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-left {
  gap: 10px;
}

.toolbar-right {
  gap: 24px;
}

.btn {
  height: 34px;
  /* nhỏ hơn */
  padding: 0 14px;
  /* gọn lại */
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  /* chữ nhỏ hơn */
  transition: all 0.2s;
}


.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #94a3b8;
  transition: 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #333;
}

.btn-icon.view:hover {
  color: #3b82f6;
}

.btn-icon.edit:hover {
  color: #f59e0b;
}

.btn:hover {
  opacity: 0.9;
}

.btn-newaccount {
  background: #3B82F6;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #4B5563;
  font-weight: 500;
  white-space: nowrap;
}

.table-wrapper {
  max-width: 100%;
  overflow-x: auto;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.img-cell {
  padding-left: 0px;
  padding-right: 0px;
  text-align: left;
}

.avatar-wrapper {
  margin-left: 0px;
  width: 48px;
  height: 48px;
  border-radius: 5;
}

th {
  padding: 16px;
  background: #F9FAFB;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  color: #374151;
  border-bottom: 1px solid #E5E7EB;
  white-space: nowrap;
}

th:first-child {
  border-top-left-radius: 6px;
}

th:last-child {
  border-top-right-radius: 6px;
}

td {
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  font-size: 14px;
  vertical-align: middle;
}

tbody tr:hover {
  background: #F9FAFB;
}

/* DATE & STATUS */
.date {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.sub-date {
  font-size: 14px;
  color: #9CA3AF;
}

.status {
  padding: 6px 0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  width: 130px;
  text-align: center;
}

.status.active {
  background: #22C55E;
  color: #fff;
}

.status.inactive {
  background: #EF4444;
  color: #fff;
}

.icon-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #6B7280;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #3B82F6;
}

/* ===== PAGINATION ===== */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: #fff;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.page-btn.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.page-btn.disabled {
  color: #D1D5DB;
  background: #F9FAFB;
}

.no-border-select {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  cursor: pointer;
  font-size: 14px;
}

/* ===== STATUS BADGE (Giống discount) ===== */
.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  display: inline-block;
  min-width: 110px;
  text-align: center;
}

/* Hoạt động */
.status-active {
  background: #dcfce7;
  color: #166534;
}

/* Ngừng hoạt động */
.status-ended {
  background: #fee2e2;
  color: #991b1b;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9CA3AF;
  font-size: 14px;
  pointer-events: none;
}

.search-input {
  height: 40px;
  padding: 0 16px 0 36px;
  border-radius: 20px;
  border: 1px solid #E5E7EB;
  outline: none;
  min-width: 300px;
  color: #6c757d;
  font-size: 14px;
  background: #F9FAFB;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-input:focus {
  border-color: #3B82F6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.avatar-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 22px;
  color: #9ca3af;
}
</style>
