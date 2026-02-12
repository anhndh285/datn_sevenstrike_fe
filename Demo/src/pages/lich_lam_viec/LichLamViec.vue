<template>
  <div class="lich-page">
    <div class="header-section">
      <h2 class="page-title">Quản Lý Lịch Làm Việc</h2>
    </div>

    <div class="card-box">
      <div class="toolbar-header">
        <div class="left">
          <h3><i class="fa-solid fa-sliders"></i> Tùy chọn</h3>
        </div>
      </div>

      <div class="toolbar-body">
        <button class="btn-add" @click="openModal(null)">
          <i class="fa-solid fa-plus"></i> Thêm mới lịch làm việc
        </button>

        <div class="filters-bar">
          <div class="form-group">
            <label>Nhân viên <span class="req">*</span></label>

            <div class="combobox-wrapper">
              <input type="text" class="form-control" placeholder="Nhập tên hoặc mã nhân viên..." v-model="searchNv"
                @focus="showNvDropdown = true" @blur="handleBlurNv" @input="showNvDropdown = true; filterNv = null" />
              <ul v-if="showNvDropdown" class="combobox-dropdown">
                <li v-for="nv in filteredNhanVienList" :key="nv.id" @click="selectNhanVien(nv)"
                  :class="{ active: nv.id === form.idNhanVien }">
                  <span class="fw-bold">{{ nv.tenNhanVien }}</span>
                  <small v-if="nv.maNhanVien"> - {{ nv.maNhanVien }}</small>
                </li>

                <li v-if="filteredNhanVienList.length === 0" class="no-result">
                  Không tìm thấy nhân viên
                </li>
              </ul>
            </div>
          </div>
          <div class="filter-group" v-if="viewMode === 'table'">
            <label>Ngày làm:</label>
            <input type="date" v-model="filterDate" class="form-select rounded-3 filter-pill" />
          </div>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="toolbar-header">
        <h3><i class="fa-regular fa-file-excel"></i> Nhập Dữ Liệu Từ Excel</h3>
      </div>
      <div class="import-body">
        <div class="file-input-wrapper">
          <label>Chọn file Excel:</label>
          <div class="input-group">
            <input type="file" ref="fileInputRef" accept=".xlsx, .xls" @change="handleFileChange" />

            <button class="btn-import" @click="handleImportExcel" :disabled="isLoadingImport">
              <i v-if="isLoadingImport" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-upload"></i>
              Import Excel
            </button>
          </div>
          <small v-if="selectedFile" class="text-primary mt-2 d-block">
            Đã chọn: {{ selectedFile.name }}
          </small>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="table-header-row">
        <h3>
          <i :class="viewMode === 'table' ? 'fa-solid fa-table' : 'fa-solid fa-calendar'"></i>
          {{ viewMode === 'table' ? 'Danh Sách Lịch Làm Việc' : 'Lịch Làm Việc Tháng ' + (currentMonth + 1) }}
        </h3>

        <div class="view-modes">
          <button class="mode-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="fa-solid fa-table"></i> Bảng
          </button>
          <button class="mode-btn" :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
            <i class="fa-solid fa-calendar"></i> Lịch
          </button>
        </div>
      </div>

      <div v-if="viewMode === 'table'" class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>NHÂN VIÊN</th>
              <th>CA LÀM</th>
              <th>NGÀY LÀM</th>
              <th class="text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, index) in filteredLichList" :key="l.id">
              <td>{{ index + 1 }}</td>
              <td>{{ l.tenNhanVien }}</td>
              <td>{{ l.tenCa }} ({{ formatTime(l.gioBatDau) }} - {{ formatTime(l.gioKetThuc) }})</td>
              <td>{{ formatDate(l.ngayLam) }}</td>
              <td class="text-right action-col">
                <button class="ss-icon-btn-view" @click="openModal(l)" title="Xem / Sửa">
                  <span class="material-icons-outlined">visibility</span>
                </button>

                <button class="ss-icon-btn-view" @click="deleteLich(l.id)" title="Xóa">
                  <span class="fa-solid fa-trash"></span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredLichList.length === 0">
              <td colspan="5" class="text-center">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="calendar-view">
        <div class="cal-navigation">
          <div class="nav-left">
            <button class="btn-nav" @click="changeMonth(-1)"><i class="fa-solid fa-chevron-left"></i></button>
            <span class="cal-title">Tháng {{ currentMonth + 1 }} năm {{ currentYear }}</span>
            <button class="btn-nav" @click="changeMonth(1)"><i class="fa-solid fa-chevron-right"></i></button>
            <button class="btn-nav" @click="goToday">Hôm nay</button>
          </div>
        </div>

        <div class="cal-grid-header">
          <div class="cal-day-name">CN</div>
          <div class="cal-day-name">Th 2</div>
          <div class="cal-day-name">Th 3</div>
          <div class="cal-day-name">Th 4</div>
          <div class="cal-day-name">Th 5</div>
          <div class="cal-day-name">Th 6</div>
          <div class="cal-day-name">Th 7</div>
        </div>

        <div class="cal-grid-body">
          <div v-for="blank in startPadding" :key="'blank-' + blank" class="cal-cell disabled"></div>

          <div v-for="day in daysInMonth" :key="'day-' + day" class="cal-cell" :class="{ 'is-today': isToday(day) }">
            <div class="cal-date-num">{{ day }}</div>

            <div class="cal-events">
              <div v-for="evt in getEventsForDay(day)" :key="evt.id" class="evt-chip" @click="openModal(evt)">
                {{ evt.tenNhanVien }} - {{ formatTime(evt.gioBatDau) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Cập Nhật Lịch Làm Việc' : 'Thêm Mới Lịch' }}</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nhân viên <span class="req">*</span></label>
            <div class="combobox-wrapper">
              <input type="text" class="form-control" placeholder="Tìm tên hoặc mã nhân viên..." v-model="searchNvModal"
                @focus="showNvModalDropdown = true" @blur="handleBlurNvModal" />
              <ul v-if="showNvModalDropdown" class="combobox-dropdown">
                <li v-for="nv in filteredNvModal" :key="nv.id" @click="selectNvModal(nv)"
                  :class="{ active: nv.id === form.idNhanVien }">
                  <span class="fw-bold">{{ nv.tenNhanVien }}</span>
                  <small> - {{ nv.maNhanVien }}</small>
                </li>
                <li v-if="filteredNvModal.length === 0" class="no-result">Không tìm thấy</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Ca làm việc <span class="req">*</span></label>
            <div class="combobox-wrapper">
              <input type="text" class="form-control" placeholder="Tìm ca làm việc..." v-model="searchCaModal"
                @focus="showCaModalDropdown = true" @blur="handleBlurCaModal" />
              <ul v-if="showCaModalDropdown" class="combobox-dropdown">
                <li v-for="ca in filteredCaModal" :key="ca.id" @click="selectCaModal(ca)"
                  :class="{ active: ca.id === form.idCaLam }">
                  <span class="fw-bold">{{ ca.tenCa }}</span>
                  <small> ({{ formatTime(ca.gioBatDau) }} - {{ formatTime(ca.gioKetThuc) }})</small>
                </li>
                <li v-if="filteredCaModal.length === 0" class="no-result">Không tìm thấy</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Ngày làm <span class="req">*</span></label>
            <div class="input-with-icon">
              <i class="fa-regular fa-calendar-days calendar-icon"></i>
              <input type="date" v-model="form.ngayLam" class="form-control pl-35" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Hủy</button>
          <button class="btn-save" @click="handleSubmit">
            {{ isEditing ? 'Lưu' : 'Thêm mới' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { createLich, updateLich, pagingLichLamViec, removeLich, importLichExcel } from '@/services/lich_lam_viec/lich_lam_viecService';
import { getAllNhanVien } from '@/services/tai_khoan/nhan_vien/nhan_vienService';
import { getAllCaLam } from '@/services/lich_lam_viec/ca_lamService';

const lichList = ref([]);
const listNhanVien = ref([]);
const listCa = ref([]);
const loading = ref(false);
const filterNv = ref(null);
const filterDate = ref(null);

const searchNvModal = ref("");
const showNvModalDropdown = ref(false);
const searchCaModal = ref("");
const showCaModalDropdown = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const fileInputRef = ref(null); // Ref dính với thẻ input file
const selectedFile = ref(null); // Biến lưu file người dùng chọn
const isLoadingImport = ref(false);

const form = reactive({
  idNhanVien: null,
  idCaLam: null,
  ngayLam: "",
  ghiChu: ""
});

const viewMode = ref('table');
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const startPadding = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const changeMonth = (step) => {
  let newMonth = currentMonth.value + step;
  if (newMonth > 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else if (newMonth < 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value = newMonth;
  }
};

const goToday = () => {
  const now = new Date();
  currentMonth.value = now.getMonth();
  currentYear.value = now.getFullYear();
};

const isToday = (day) => {
  const now = new Date();
  return day === now.getDate() && currentMonth.value === now.getMonth() && currentYear.value === now.getFullYear();
};

const getEventsForDay = (day) => {
  if (!lichList.value) return [];

  const m = currentMonth.value + 1;
  const mStr = m < 10 ? `0${m}` : m;
  const dStr = day < 10 ? `0${day}` : day;
  const dateString = `${currentYear.value}-${mStr}-${dStr}`; // Format YYYY-MM-DD

  return filteredLichList.value.filter(l => {
    if (Array.isArray(l.ngayLam)) {
      return l.ngayLam[0] === currentYear.value &&
        l.ngayLam[1] === m &&
        l.ngayLam[2] === day;
    }
    if (typeof l.ngayLam === 'string') {
      return l.ngayLam === dateString;
    }
    return false;
  });
};

const filteredNhanVienList = computed(() => {
  if (!searchNv.value) return listNhanVien.value;
  return listNhanVien.value.filter(nv =>
    nv.tenNhanVien.toLowerCase().includes(searchNv.value.toLowerCase()) ||
    (nv.maNhanVien && nv.maNhanVien.toLowerCase().includes(searchNv.value.toLowerCase()))
  );
});

const filteredNvModal = computed(() => {
  const q = searchNvModal.value.toLowerCase();
  return listNhanVien.value.filter(nv =>
    nv.tenNhanVien.toLowerCase().includes(q) || nv.maNhanVien.toLowerCase().includes(q)
  );
});

// Filter ca làm trong modal
const filteredCaModal = computed(() => {
  const q = searchCaModal.value.toLowerCase();
  return listCa.value.filter(ca =>
    ca.tenCa.toLowerCase().includes(q)
  );
});

const selectNhanVien = (nv) => {
  filterNv.value = nv.id;

  searchNv.value = nv.tenNhanVien;
  showNvDropdown.value = false;
};

const selectNvModal = (nv) => {
  form.idNhanVien = nv.id;
  searchNvModal.value = nv.tenNhanVien;
  showNvModalDropdown.value = false;
};

const selectCaModal = (ca) => {
  form.idCaLam = ca.id;
  searchCaModal.value = `${ca.tenCa} (${formatTime(ca.gioBatDau)} - ${formatTime(ca.gioKetThuc)})`;
  showCaModalDropdown.value = false;
};

const handleBlurNvModal = () => setTimeout(() => showNvModalDropdown.value = false, 200);
const handleBlurCaModal = () => setTimeout(() => showCaModalDropdown.value = false, 200);

const handleBlurNv = () => {
  setTimeout(() => {
    showNvDropdown.value = false;
  }, 200);
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate đuôi file (tùy chọn)
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      alert("Vui lòng chỉ chọn file Excel (.xlsx, .xls)");
      resetFileInput();
      return;
    }
    selectedFile.value = file;
  } else {
    selectedFile.value = null;
  }
};

const handleImportExcel = async () => {
  if (!selectedFile.value) {
    alert("Vui lòng chọn file trước khi import!");
    return;
  }

  if (!confirm("Bạn có chắc muốn import dữ liệu từ file này?")) return;

  isLoadingImport.value = true;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    await importLichExcel(formData);
    alert("Import dữ liệu thành công!");

    resetFileInput();
    loadData();
  } catch (e) {
    console.error(e);
    alert("Import thất bại: " + (e.message || "Lỗi không xác định"));
  } finally {
    isLoadingImport.value = false;
  }
};

const resetFileInput = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const formatTime = (arr) => {
  if (Array.isArray(arr)) return `${arr[0]}:${arr[1] < 10 ? '0' + arr[1] : arr[1]}`;
  if (typeof arr === 'string') return arr.substring(0, 5);
  return '';
}
const formatDate = (arr) => {
  if (Array.isArray(arr)) return `${arr[2]}/${arr[1]}/${arr[0]}`;
  return arr;
}

const convertArrayDateToString = (arrDate) => {
  if (Array.isArray(arrDate)) {
    const y = arrDate[0];
    const m = arrDate[1] < 10 ? '0' + arrDate[1] : arrDate[1];
    const d = arrDate[2] < 10 ? '0' + arrDate[2] : arrDate[2];
    return `${y}-${m}-${d}`;
  }
  return arrDate;
}

const openModal = (item) => {
  if (item) {
    isEditing.value = true;
    currentId.value = item.id;
    const idNv = item.idNhanVien || (item.nhanVien ? item.nhanVien.id : null);
    const idCa = item.idCaLam || (item.caLam ? item.caLam.id : null);

    form.idNhanVien = idNv;
    form.idCaLam = idCa;
    form.ngayLam = convertArrayDateToString(item.ngayLam);
    form.ghiChu = item.ghiChu || "";

    const nv = listNhanVien.value.find(n => n.id === idNv);
    searchNvModal.value = nv ? nv.tenNhanVien : "";

    const ca = listCa.value.find(c => c.id === idCa);
    searchCaModal.value = ca ? `${ca.tenCa} (${formatTime(ca.gioBatDau)} - ${formatTime(ca.gioKetThuc)})` : "";
  } else {
    isEditing.value = false;
    currentId.value = null;
    form.idNhanVien = null;
    form.idCaLam = null;
    form.ngayLam = new Date().toISOString().split('T')[0];
    form.ghiChu = "";
    searchNvModal.value = "";
    searchCaModal.value = "";
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  currentId.value = null;
};

const handleSubmit = async () => {
  if (!form.idNhanVien || !form.idCaLam || !form.ngayLam) {
    alert("Vui lòng nhập đủ: Nhân viên, Ca làm và Ngày làm!");
    return;
  }

  const payload = {
    idNhanVien: Number(form.idNhanVien),
    idCaLam: Number(form.idCaLam),
    ngayLam: form.ngayLam,
    ghiChu: form.ghiChu || ""
  };

  try {
    if (isEditing.value) {
      await updateLich(currentId.value, payload);
      alert("Cập nhật lịch thành công!");
    } else {
      await createLich(payload);
      alert("Thêm lịch thành công!");
    }

    closeModal();
    loadData();
  } catch (e) {
    alert("Có lỗi xảy ra: " + (e.response?.data?.message || e.message));
  }
};

const loadData = async () => {
  try {
    const res = await pagingLichLamViec(0, 100);
    lichList.value = res.content || [];
  } catch (e) { console.error(e); }
};

const loadthemLich = async () => {
  const nv = await getAllNhanVien();
  const ca = await getAllCaLam();
  listNhanVien.value = Array.isArray(nv) ? nv : [];
  listCa.value = Array.isArray(ca) ? ca : [];
  loadData();
};

const filteredLichList = computed(() => {
  let data = [...lichList.value];

  if (filterNv.value) {
    const searchId = Number(filterNv.value);

    data = data.filter(item => {
      if (item.nhanVien) {
        return item.nhanVien.id === searchId;
      }
      return false;
    });
  }

  if (filterDate.value) {
    data = data.filter(l => {
      const ngay = typeof l.ngayLam === "string"
        ? l.ngayLam.substring(0, 10)
        : convertArrayDateToString(l.ngayLam);
      return ngay === filterDate.value;
    });
  }

  return data;
});



const deleteLich = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa lịch này?")) return;
  try {
    await removeLich(id);
    loadData();
  } catch (e) {
    alert("Xóa thất bại: " + e.message);
  }
};

onMounted(() => {
  loadthemLich();
});
</script>

<style scoped>
.lich-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 30px;
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.92);
}

.card-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.mt-20 {
  margin-top: 20px;
}

.toolbar-header h3,
.table-header-row h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-body {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.btn-add {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-import {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.filters-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.78);
  font-weight: 600;
  white-space: nowrap;
}

.filter-pill {
  height: 38px;
  min-width: 150px;
}

.import-body {
  margin-top: 15px;
  background: #f9fafb;
  padding: 15px;
  border-radius: 6px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-modes {
  display: flex;
  gap: 5px;
}

.action-col {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ss-icon-btn-view:hover {
  background: #e0f2fe;
}

.mode-btn {
  border: 1px solid #e5e7eb;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  background: #f9fafb;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.mode-btn.active {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 4px 6px rgba(255, 77, 79, 0.2);
  color: white;
  border-color: transparent;
}

/* CSS TABLE CŨ */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  text-align: left;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  text-transform: uppercase;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #111827;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

/* --- CSS MỚI CHO CALENDAR --- */
.calendar-view {
  margin-top: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

/* Navigation Bar của Lịch */
.cal-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 10px;
  text-transform: capitalize;
}

.btn-nav {
  border: 1px solid #d1d5db;
  color: #000;
  background: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-nav:hover {
  background: #f3f4f6;
}

.btn-nav.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

/* Grid Lịch */
.cal-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.cal-day-name {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: #1e40af;
  border-right: 1px solid #e5e7eb;
}

.cal-day-name:last-child {
  border-right: none;
}

.cal-grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fff;
}

.cal-cell {
  min-height: 120px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 5px;
  position: relative;
}

.cal-cell:nth-child(7n) {
  border-right: none;
}

.cal-cell.disabled {
  background: #f9fafb;
}

.cal-cell.is-today {
  background: #fffbeb;
}

/* Màu vàng nhạt cho ngày hiện tại */

.cal-date-num {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-align: right;
  margin-bottom: 5px;
  padding-right: 5px;
}

/* Events trong lịch */
.cal-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.evt-chip {
  background: #0ea5e9;
  /* Màu xanh dương giống hình */
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
}

.evt-chip:hover {
  background: #0284c7;
  transform: translateY(-1px);
}

/* Modal Styles cũ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 500px;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeIn 0.2s;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.req {
  color: red;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #f3f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.combobox-wrapper {
  position: relative;
  /* Để dropdown bám theo thằng này */
}

.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  max-height: 200px;
  /* Giới hạn chiều cao */
  overflow-y: auto;
  /* Cho phép cuộn */
  z-index: 1050;
  /* Cao hơn các thành phần khác */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  padding: 0;
  list-style: none;
}

.combobox-dropdown li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.combobox-dropdown li:last-child {
  border-bottom: none;
}

.combobox-dropdown li:hover {
  background-color: #f3f4f6;
}

.combobox-dropdown li.active {
  background-color: #e0f2fe;
  /* Màu xanh nhạt khi được chọn */
  color: #0369a1;
  font-weight: 600;
}

.combobox-dropdown .no-result {
  padding: 10px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
  cursor: default;
}

.fw-bold {
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>