<template>
  <div class="lich-page">
    <div class="card-box">
      <div class="filter-header">
        <h3>Bộ lọc tìm kiếm</h3>
        <button class="btn-icon-bg" title="Xóa bộ lọc" @click="resetFilter">
          <i class="fa-solid fa-filter-circle-xmark"></i>
        </button>
      </div>

      <div class="filter-body">
        <div class="form-group filter-col">
          <label>Tìm kiếm chung</label>
          <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              class="form-control pl-35" 
              placeholder="Nhập tên ca, mã ca..." 
              v-model="filters.keyword"
            />
          </div>
        </div>

        <div class="form-group filter-col">
          <label>Thời gian bắt đầu</label>
          <div class="time-input-wrapper">
            <input 
              type="time" 
              class="form-control" 
              v-model="filters.gioBatDau"
            />
          </div>
        </div>

        <div class="form-group filter-col">
          <label>Thời gian kết thúc</label>
          <div class="time-input-wrapper">
            <input 
              type="time" 
              class="form-control" 
              v-model="filters.gioKetThuc"
            />
          </div>
        </div>

        <div class="form-group filter-col">
          <label>Trạng thái</label>
          <div class="radio-group">
            <label class="radio-container">
              <input type="radio" value="all" v-model="filters.trangThai" />
              <span class="checkmark"></span> Tất cả
            </label>
            <label class="radio-container">
              <input type="radio" value="active" v-model="filters.trangThai" />
              <span class="checkmark"></span> Hoạt động
            </label>
            <label class="radio-container">
              <input type="radio" value="inactive" v-model="filters.trangThai" />
              <span class="checkmark"></span> Ngưng
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="table-header-row">
        <h3>Danh sách Ca làm việc</h3>
        
        <div class="action-buttons">
          <button class="btn-circle btn-success" @click="openModal(null)" title="Thêm mới">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button class="btn-circle btn-light" @click="loadData" title="Làm mới">
            <i class="fa-solid fa-rotate-right"></i>
          </button>
        </div>
      </div>

      <div class="table-responsive mt-10">
        <table>
          <thead>
            <tr>
              <th style="width: 60px" class="text-center">STT</th>
              <th>Thông tin Ca</th>
              <th class="text-center">Giờ bắt đầu</th>
              <th class="text-center">Giờ kết thúc</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-center" style="width: 120px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ca, index) in danhSachCaLam" :key="ca.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="shift-info">
                  <div class="shift-icon">
                    <i class="fa-regular fa-clock"></i>
                  </div>
                  <div class="shift-details">
                    <span class="shift-name">{{ ca.tenCa }}</span>
                    <span class="shift-code">{{ ca.maCa }}</span>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <span class="time-badge start">{{ ca.gioBatDau }}</span>
              </td>
              <td class="text-center">
                <span class="time-badge end">{{ ca.gioKetThuc }}</span>
              </td>
              <td class="text-center">
                <label class="switch">
                  <input type="checkbox" v-model="ca.trangThai" @change="toggleTrangThai(ca)">
                  <span class="slider round"></span>
                </label>
              </td>
              <td class="text-center action-col">
                <button class="ss-icon-btn-view" type="button" @click="openModal(ca)" title="Xem / Sửa">
                  <span class="material-icons-outlined">visibility</span>
                </button>

                <button class="ss-icon-btn-danger" type="button" @click="deleteCa(ca.id)" title="Xóa">
                  <span class="fa-solid fa-trash"></span>
                </button>
              </td>
            </tr>

            <tr v-if="danhSachCaLam.length === 0">
              <td colspan="6" class="text-center py-4">Không có dữ liệu ca làm việc</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Cập nhật Ca làm việc' : 'Thêm mới Ca làm việc' }}</h3>
          <button @click="closeModal" class="btn-close" type="button" title="Đóng">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group mb-15">
            <label>Tên ca <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control" 
              v-model="form.tenCa" 
              placeholder="VD: Ca Sáng, Ca Chiều..." 
            />
          </div>

          <div class="row-flex mb-15">
            <div class="form-group flex-1 mr-10">
              <label>Giờ bắt đầu</label>
              <input 
                type="time" 
                lang="en-GB" class="form-control" 
                v-model="form.gioBatDau" 
              />
            </div>
            <div class="form-group flex-1">
              <label>Giờ kết thúc</label>
              <input 
                type="time" 
                lang="en-GB" class="form-control" 
                v-model="form.gioKetThuc" 
              />
            </div>
          </div>

          <div class="form-group mb-15">
            <label>Mô tả</label>
            <textarea 
              class="form-control textarea" 
              v-model="form.moTa" 
              rows="3" 
              placeholder="Ghi chú thêm về ca làm việc..."
            ></textarea>
          </div>

          <div class="form-group" v-if="isEditing">
            <label>Trạng thái</label>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
              <label class="switch">
                <input type="checkbox" v-model="form.trangThai">
                <span class="slider round"></span>
              </label>
              <span class="text-status">{{ form.trangThai ? 'Đang hoạt động' : 'Ngưng hoạt động' }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" type="button" @click="closeModal">Hủy bỏ</button>
          <button class="btn-save" type="button" @click="handleSubmit">
            {{ isEditing ? 'Lưu' : 'Thêm mới' }}
          </button>
        </div>
      </div>
    </div>
  </div> 
</template>

<script setup>
import { createCaLam, getAllCaLam, updateCaLam } from '@/services/lich_lam_viec/ca_lamService';
import { ref, reactive, onMounted } from 'vue';

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
// State bộ lọc
const filters = reactive({
  keyword: '',
  gioBatDau: '',
  gioKetThuc: '',
  trangThai: 'all' // all, active, inactive
});

const form = reactive({
  tenCa: '',
  gioBatDau: '',
  gioKetThuc: '',
  moTa: '',
  trangThai: true
});

const danhSachCaLam = ref([]);

// Methods
const resetFilter = () => {
  filters.keyword = '';
  filters.gioBatDau = '';
  filters.gioKetThuc = '';
  filters.trangThai = 'all';
};

const loadData = async () => {
  try {
    const res = await getAllCaLam();
    danhSachCaLam.value = Array.isArray(res) ? res : res.content || [];
  } catch (e) {
    console.error(e);
  }
};

const openModal = (ca) => {
  if (ca) {
    isEditing.value = true;
    currentId.value = ca.id;
    
    form.tenCa = ca.tenCa || '';
    
    form.gioBatDau = ca.gioBatDau ? String(ca.gioBatDau).substring(0, 5) : '';
    form.gioKetThuc = ca.gioKetThuc ? String(ca.gioKetThuc).substring(0, 5) : '';
    
    form.moTa = ca.moTa || '';
    form.trangThai = ca.trangThai !== undefined ? ca.trangThai : true;
  } else {
    isEditing.value = false;
    currentId.value = null;
    form.tenCa = '';
    form.gioBatDau = '';
    form.gioKetThuc = '';
    form.moTa = '';
    form.trangThai = true;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.tenCa.trim()) {
    alert('Tên ca không được để trống!');
    return;
  }

  const payload = {
    tenCa: form.tenCa.trim(),
    gioBatDau: form.gioBatDau ? `${form.gioBatDau}:00` : null,
    gioKetThuc: form.gioKetThuc ? `${form.gioKetThuc}:00` : null,
    moTa: form.moTa.trim(),
    trangThai: form.trangThai
  };

  try {
    if (isEditing.value) {
      await updateCaLam(currentId.value, payload);
      console.log('Gọi API CẬP NHẬT với payload:', payload, 'ID:', currentId.value);
      // await caLamService.updateCaLam(currentId.value, payload);
      alert('Cập nhật thành công!');
    } else {
      await createCaLam(payload);
      // await caLamService.createCaLam(payload);
      alert('Thêm mới thành công!');
    }
    
    closeModal();
    loadData(); // Tải lại danh sách
  } catch (error) {
    console.error('Lỗi khi lưu ca làm việc:', error);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }
};

const deleteCa = (id) => {
  if(confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) {
    console.log("Xóa ca ID:", id);
    // Gọi API xóa...
  }
};

const toggleTrangThai = (ca) => {
  console.log(`Đổi trạng thái ca ${ca.id} thành: ${ca.trangThai}`);
  // Gọi API cập nhật trạng thái...
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.lich-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 20px;
  border: 1px solid #f3f4f6;
}

.mt-20 { margin-top: 20px; }
.mt-10 { margin-top: 10px; }
.text-center { text-align: center; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }

/* Filter Header */
.filter-header, .table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.filter-header h3, .table-header-row h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-icon-bg {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-icon-bg:hover {
  background: #e5e7eb;
  color: #111827;
}

/* Filter Body Grid */
.filter-body {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-col {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s;
}
.form-control:focus {
  outline: none;
  border-color: #10b981;
}

/* Custom Inputs */
.search-input-wrapper {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}
.pl-35 { padding-left: 35px; }

/* Radio Buttons Custom */
.radio-group {
  display: flex;
  gap: 15px;
  height: 40px;
  align-items: center;
}
.radio-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 24px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: #374151;
}
.radio-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.checkmark {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 16px;
  width: 16px;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 50%;
}
.radio-container input:checked ~ .checkmark {
  border-color: #10b981;
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.radio-container input:checked ~ .checkmark:after {
  display: block;
}
.radio-container .checkmark:after {
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

/* Action Buttons (Header Table) */
.action-buttons {
  display: flex;
  gap: 10px;
}
.btn-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-success { background-color: #10b981; }
.btn-success:hover { background-color: #059669; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.btn-light { background-color: #f3f4f6; color: #4b5563; }
.btn-light:hover { background-color: #e5e7eb; }

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}
td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  vertical-align: middle;
}
tbody tr:hover { background-color: #f9fafb; }

/* Shift Info Cell */
.shift-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.shift-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.shift-details {
  display: flex;
  flex-direction: column;
}
.shift-name { font-weight: 600; color: #111827; margin-bottom: 2px; }
.shift-code { font-size: 12px; color: #6b7280; }

/* Time Badges */
.time-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
}
.time-badge.start {
  background-color: #d1fae5;
  color: #059669;
}
.time-badge.end {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

/* Action Icons in Table */
.action-icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  margin: 0 4px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}
.action-icon-btn:hover { background: #f3f4f6; }
.text-warning { color: #d97706; }
.text-danger { color: #dc2626; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 20px;
}

.mb-15 { margin-bottom: 15px; }
.text-danger { color: #ef4444; }
.row-flex { display: flex; align-items: flex-end; }
.flex-1 { flex: 1; }
.mr-10 { margin-right: 10px; }

.textarea {
  resize: vertical;
  min-height: 80px;
}

.text-status {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-save {
  padding: 8px 16px;
  background: #10b981;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover {
  background: #059669;
}

.ss-icon-btn-view,
.ss-icon-btn-danger {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.ss-icon-btn-view:hover {
  background: #f3f4f6;
}

.ss-icon-btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}
</style>