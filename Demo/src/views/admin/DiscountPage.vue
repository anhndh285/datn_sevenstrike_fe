<template>
  <div class="discount-page">
    <h2 class="page-title">QUẢN LÝ ĐỢT GIẢM GIÁ</h2>

    <div class="card filter-section">
      <div class="filter-row">
        <div class="filter-item search-item">
          <label class="label">Từ khóa</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input v-model="filters.keyword" type="text" placeholder="Tìm theo tên hoặc mã đợt..." />
          </div>
        </div>
        <div class="filter-item">
          <label class="label">Từ ngày</label>
          <input v-model="filters.startDate" type="date" class="form-control" />
        </div>
        <div class="filter-item">
          <label class="label">Đến ngày</label>
          <input v-model="filters.endDate" type="date" class="form-control" />
        </div>
      </div>
      <div class="filter-row mt-3">
        <div class="filter-item">
          <label class="label">Loại giảm giá</label>
          <select v-model="filters.type" class="form-control">
            <option value="">-- Tất cả --</option>
            <option value="percent">Theo Phần trăm (%)</option>
            <option value="money">Theo Số tiền (VND)</option>
          </select>
        </div>
        <div class="filter-item">
          <label class="label">Trạng thái</label>
          <select v-model="filters.status" class="form-control">
            <option value="">-- Tất cả --</option>
            <option value="active">Đang diễn ra</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
        <div class="filter-item action-item">
          <label class="label d-none-mobile">&nbsp;</label>
          <div class="btn-group">
            <button class="btn-filter reset" @click="resetFilters">
              <i class="fa-solid fa-rotate-left"></i> <span class="btn-text">Làm mới</span>
            </button>
            <button class="btn-filter search" @click="fetchDiscounts">
              <i class="fa-solid fa-filter"></i> <span class="btn-text">Lọc</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card table-section">
      <div class="table-header">
        <div class="header-left">
          <h3>Danh sách đợt giảm giá</h3>
          <span class="count-badge">{{ filteredList.length }} bản ghi</span>
        </div>
        <button class="btn-add" @click="goToAddPage">
          <i class="fa-solid fa-plus"></i> Thêm mới
        </button>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th class="text-center" width="50px">STT</th>
              <th>Mã đợt</th>
              <th>Tên đợt</th>
              <th>Loại giảm</th>
              <th class="text-right">Giá trị</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredList.length === 0">
              <td colspan="10" class="empty-row">
                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Empty" width="60" />
                <p>Không tìm thấy dữ liệu phù hợp</p>
              </td>
            </tr>
            <tr v-for="(item, index) in paginatedDiscounts" :key="item.id">
              <td class="text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td><strong>{{ item.maDotGiamGia }}</strong></td>
              <td>{{ item.tenDotGiamGia }}</td>
              <td>
                <span class="tag-type" :class="item.loaiGiamGia ? 'tag-money' : 'tag-percent'">
                  {{ item.loaiGiamGia ? 'VND' : '%' }}
                </span>
              </td>
              <td class="text-right highlight-text">
                {{ item.loaiGiamGia ? formatCurrency(item.giaTriGiamGia) : item.giaTriGiamGia + '%' }}
              </td>
              <td>{{ formatDate(item.ngayBatDau) }}</td>
              <td>{{ formatDate(item.ngayKetThuc) }}</td>
              <td class="text-center">
                <span class="badge" :class="item.statusClass">{{ item.statusText }}</span>
              </td>

              <td class="text-center action-cell">
                <button class="btn-icon view" @click="viewDetail(item.id)" title="Xem chi tiết">
                    <i class="fa-regular fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 0">
        <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="page-btn active">{{ currentPage }}</button>
        <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { discountService } from '@/services/DiscountService';

const router = useRouter();
const rawDiscounts = ref([]); // Dữ liệu gốc từ API

// State cho bộ lọc
const filters = reactive({
  keyword: '',
  startDate: '',
  endDate: '',
  type: '',      // '' | 'percent' | 'money'
  status: ''     // '' | 'active' | 'upcoming' | 'ended' | 'disabled'
});

const currentPage = ref(1);
const itemsPerPage = 5;

// --- HELPER FORMAT ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateArrOrStr) => {
  if (!dateArrOrStr) return '-';
  // Xử lý nếu BE trả về array [yyyy, MM, dd] hoặc string
  const date = new Date(dateArrOrStr);
  return date.toLocaleDateString('vi-VN'); // dd/mm/yyyy
};

// --- LOGIC FETCH DATA ---
const fetchDiscounts = async () => {
  try {
    // Gọi API lấy toàn bộ danh sách
    const data = await discountService.getAll();

    // Xử lý dữ liệu thô để tính toán trạng thái (status) cho việc lọc
    const now = new Date();

    rawDiscounts.value = data.map(item => {
      let statusKey = ''; // Dùng để lọc
      let statusText = '';
      let statusClass = '';

      // Helper: Parse date về Local Time và set giờ đầu/cuối ngày để so sánh chính xác
      const parseDateBoundary = (d, isEnd) => {
          let dateObj = new Date(); // Default fallback
          if (Array.isArray(d)) {
              dateObj = new Date(d[0], d[1] - 1, d[2]);
          } else if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
              const [y, m, day] = d.split('-').map(Number);
              dateObj = new Date(y, m - 1, day);
          } else if (d) {
              dateObj = new Date(d);
          }
          dateObj.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0);
          return dateObj;
      };

      const start = parseDateBoundary(item.ngayBatDau, false);
      const end = parseDateBoundary(item.ngayKetThuc, true);

      if (now < start) {
        statusKey = 'upcoming';
        statusText = 'Sắp diễn ra';
        statusClass = 'status-upcoming';
      } else if (now > end) {
        statusKey = 'ended';
        statusText = 'Đã kết thúc';
        statusClass = 'status-ended';
      } else {
        statusKey = 'active';
        statusText = 'Đang diễn ra';
        statusClass = 'status-active';
      }

      return {
        ...item,
        statusKey,    // key dùng để lọc
        statusText,   // text hiển thị
        statusClass   // class css
      };
    });
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
};

// --- LOGIC LỌC DỮ LIỆU (COMPUTED) ---
const filteredList = computed(() => {
  return rawDiscounts.value.filter(item => {
    // 1. Lọc theo từ khóa (Mã hoặc Tên)
    const keywordMatch = !filters.keyword ||
      item.tenDotGiamGia.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      item.maDotGiamGia.toLowerCase().includes(filters.keyword.toLowerCase());

    // 2. Lọc theo ngày bắt đầu (Nếu chọn ngày X, thì ngày bắt đầu của đợt phải >= X)
    const startMatch = !filters.startDate || new Date(item.ngayBatDau) >= new Date(filters.startDate);

    // 3. Lọc theo ngày kết thúc (Nếu chọn ngày Y, thì ngày kết thúc của đợt phải <= Y)
    const endMatch = !filters.endDate || new Date(item.ngayKetThuc) <= new Date(filters.endDate);

    // 4. Lọc theo loại (percent = false, money = true)
    let typeMatch = true;
    if (filters.type === 'percent') typeMatch = (item.loaiGiamGia === false);
    if (filters.type === 'money') typeMatch = (item.loaiGiamGia === true);

    // 5. Lọc theo trạng thái
    const statusMatch = !filters.status || item.statusKey === filters.status;

    return keywordMatch && startMatch && endMatch && typeMatch && statusMatch;
  });
});

// --- PHÂN TRANG ---
const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage));

const paginatedDiscounts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredList.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

// Reset trang về 1 khi bộ lọc thay đổi
watch(filters, () => { currentPage.value = 1; }, { deep: true });

const resetFilters = () => {
  filters.keyword = '';
  filters.startDate = '';
  filters.endDate = '';
  filters.type = '';
  filters.status = '';
  fetchDiscounts(); // Reload lại cho chắc chắn
};

// --- NAVIGATION ---
const goToAddPage = () => {
  router.push({ name: 'admin-discount-create' });
};

const viewDetail = (id) => {
  // Điều hướng đến trang chi tiết hoặc mở modal
  router.push({ name: 'admin-discount-detail', params: { id } });
};

onMounted(() => {
  fetchDiscounts();
});
</script>

<style scoped>
* { box-sizing: border-box; }
.discount-page { padding-bottom: 30px; }
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 30px; margin-top: 10px; color: #1e293b; }
.card { background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.filter-row { display: flex; gap: 20px; flex-wrap: wrap; }
.mt-3 { margin-top: 20px; }
.filter-item { flex: 1; min-width: 200px; display: flex; flex-direction: column; }
.search-item { flex: 2; min-width: 250px; }
.action-item { flex: 0.8; min-width: 180px; justify-content: flex-end; }
.label { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; display: block; }
.form-control, .input-wrapper input { height: 40px; width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 12px; font-size: 14px; outline: none; transition: all 0.2s; background-color: #fff; }
.form-control:focus, .input-wrapper input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.input-wrapper { position: relative; width: 100%; }
.input-wrapper input { padding-left: 36px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 14px; pointer-events: none; }
.btn-group { display: flex; gap: 10px; }
.btn-filter { height: 40px; flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 6px; font-weight: 500; font-size: 14px; cursor: pointer; border: none; white-space: nowrap; padding: 0 15px; }
.btn-filter.reset { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.btn-filter.reset:hover { background: #e2e8f0; }
.btn-filter.search { background: #1e293b; color: white; }
.btn-filter.search:hover { background: #0f172a; }
@media (max-width: 768px) { .filter-row { gap: 15px; } .filter-item { flex: 100%; min-width: 100%; } .d-none-mobile { display: none; } }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 10px; }
.count-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #64748b; }
.btn-add { background: #16a34a; color: white; border: none; padding: 0 20px; height: 40px; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.btn-add:hover { background: #15803d; }
.table-container { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
.custom-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 1000px; }
.custom-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 14px 12px; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.custom-table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #334155; }
.tag-type { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.tag-percent { background: #f3e8ff; color: #7e22ce; }
.tag-money { background: #dcfce7; color: #15803d; }
.highlight-text { font-weight: 600; color: #d63031; }
.badge-priority { display: inline-block; width: 26px; height: 26px; line-height: 26px; text-align: center; background: #e2e8f0; border-radius: 50%; font-weight: bold; font-size: 12px; color: #475569; }
.badge { padding: 6px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.empty-row { text-align: center; padding: 40px !important; color: #94a3b8; }
.empty-row img { margin-bottom: 10px; opacity: 0.5; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.action-cell { white-space: nowrap; }
.btn-icon { width: 32px; height: 32px; border: none; background: transparent; border-radius: 4px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-icon:hover { background: #f1f5f9; color: #333; }
.btn-icon.view:hover { color: #3b82f6; }
.pagination { display: flex; justify-content: center; gap: 8px; margin-top: 24px; }
.page-btn { width: 36px; height: 36px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.page-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
.page-btn.active { background: #333; color: white; border-color: #333; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.status-active { background: #dcfce7; color: #166534; }
.status-upcoming { background: #fef3c7; color: #b45309; }
.status-ended { background: #f1f5f9; color: #64748b; }
.status-disabled { background: #fee2e2; color: #991b1b; }
</style>
