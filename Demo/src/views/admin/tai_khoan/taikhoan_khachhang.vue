<template>
  <div class="taikhoan-khachhang" v-if="!isPage">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="Tìm kiếm"
            class="search-input"
          />
        </div>
      </div>

      <div class="toolbar-right">
        <button class="btn btn-newaccount" @click="themkh">
          <i class="fa-solid fa-plus"></i> Tạo Tài Khoản
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã khách hàng</th>
            <th>Tên khách hàng</th>
            <th>Tên tài khoản</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Địa chỉ chi tiết</th>
            <th>Ngày tạo</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in khachhangList" :key="item.id">
            <td class="text-bold text-gray">{{ pageNo * pageSize + index + 1 }}</td>

            <td class="text-bold text-gray">
              {{ item.maKhachHang }}
            </td>

            <td class="text-bold text-gray">
              {{ item.tenKhachHang }}
            </td>

            <td class="text-bold text-gray">
              {{ item.tenTaiKhoan }}
            </td>

            <td class="text-gray">
              {{ item.soDienThoai }}
            </td>

            <td class="text-gray">
              {{ item.email }}
            </td>

            <td class="text-gray">
              {{ formatAddress(item.id) }}
            </td>

            <td>
              <div class="date">
                <span class="sub-date">
                  {{ formatDate(item.ngayTao) }}
                </span>
              </div>
            </td>
            <td class="text-center">
              <button class="btn-icon view" @click="updatedkh(item.id)"><i class="fa-regular fa-eye"></i></button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>

    <div class="pagination-container">
      <button class="page-btn" :class="{ disabled: pageNo === 0 }" @click="pageNo--; handleFilter()" :disabled="pageNo === 0">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button class="page-btn active">{{ pageNo + 1 }}</button>
      <button class="page-btn" :class="{ disabled: pageNo >= totalPages - 1 }" :disabled="pageNo >= totalPages - 1" @click="pageNo++; handleFilter()">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </div>

  <router-view />
</template>

<script setup>
import { getAllDiaChi } from '@/services/tai_khoan/khach_hang/dia_chi_khach_hangService';
import { searchKhachHang, pagingKhachHang } from '@/services/tai_khoan/khach_hang/khach_hangService';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const pageNo = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)

const khachhangList = ref([])
const khachhangOrigin = ref([])

const diacchilist = ref([]);

const filters = ref({
  keyword: '',
  status: ''
});

const getAllDC = async () => {
  try {
    const res = await getAllDiaChi();
    diacchilist.value = res;
  } catch (error) {
    console.log("Lỗi lấy danh sách địa chỉ:", error);
  }
};



const themkh = () => {
  router.push({ name: 'kh-add' });
};

const updatedkh = (id) => {
  router.push({ name: 'kh-update', params: { id } });
};

const isPage = computed(() => 
  route.name === 'kh-add' || route.name === 'kh-update'
);

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatAddress = (id) => {
  if (!id) return 'Chưa có';

  const dc = diacchilist.value.find(dc => dc.idKhachHang === id);
  if (!dc) return 'Chưa có';

  return [
    dc.diaChiCuThe,
    dc.phuong,
    dc.quan,
    dc.thanhPho
  ].filter(Boolean).join(', ');
};


const handleFilter = async () => {
  try {
    // Có keyword → search
    if (filters.value.keyword.trim()) {
      const res = await searchKhachHang(filters.value.keyword.trim());
      // Hàm searchKhachHang có thể trả về một mảng (không phân trang) hoặc một đối tượng phân trang { content, totalPages }.
      if (Array.isArray(res)) {
        khachhangOrigin.value = res;
        totalPages.value = 1;
      } else {
        khachhangOrigin.value = res?.content ?? [];
        totalPages.value = res?.totalPages ?? 0;
      }
    }
    // Không keyword → paging thường
    else {
      const res = await pagingKhachHang(pageNo.value, pageSize.value);
      khachhangOrigin.value = res?.content ?? [];
      totalPages.value = res?.totalPages ?? 0;
    }

    applyStatusFilter();
  } catch (e) {
    console.log('Filter error', e);
  }
};

const applyStatusFilter = () => {
  const source = Array.isArray(khachhangOrigin.value) ? khachhangOrigin.value : (khachhangOrigin.value ?? []);

  if (!filters.value.status) {
    khachhangList.value = source;
    return;
  }

  const isActive = filters.value.status === 'active';

  khachhangList.value = source.filter(item => Boolean(item.trangThai) === isActive);
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
    if (!newPath.includes('/khachhang/add') && !newPath.includes('/khachhang/update')) {
      handleFilter();
    }
  }
);

onMounted(() => {
  handleFilter();
  getAllDC();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.taikhoan-khachhang {
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

.search-input {
  height: 40px;
  padding: 0 16px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  outline: none;
  min-width: 200px;
  color: #374151;
}

.btn {
  height: 34px;
  padding: 0 14px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
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

.btn-search {
  background: #3B82F6;
  color: #fff;
}

.btn-reset {
  background: #FF4500;
  color: #fff;
}

.btn-newaccount {
  background: #3B82F6;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== TABLE ===== */
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
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
  font-size: 13px;
  color: #9CA3AF;
}

.status {
  padding: 6px 0;
  border-radius: 6px;
  font-size: 13px;
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

.page-btn:hover:not(.disabled) {
  background: #F3F4F6;
  border-color: #D1D5DB;
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
}

.form-select {
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
}

.no-border-select {
  border: 1px solid #E5E7EB;
}

.badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.status-active {
  background: #22C55E;
  color: #fff;
}

.status-ended {
  background: #EF4444;
  color: #fff;
}
</style>
