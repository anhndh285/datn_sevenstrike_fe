<template>
  <div class="create_page">
    <h4 class="page-title">Thêm mới nhân viên</h4>

    <div class="card">
      <h6 class="section-title">Thông tin cá nhân</h6>

      <form @submit.prevent="submit">
        <div class="row">

          <div class="col-md-2 text-center">
            <div class="avatar-wrapper">
              <img v-if="nv.anhNhanVien" :src="nv.anhNhanVien" class="avatar-img" />
              <i v-else class="bi bi-person avatar-icon"></i>
            </div>

            <!-- INPUT FILE ẨN -->
            <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" hidden />

            <!-- BUTTON -->
            <button type="button" class="btn btn-light btn-sm mt-2" @click="openFilePicker">
              <i class="bi bi-camera me-2"></i>
              Chọn ảnh
            </button>
          </div>

          <div class="col-md-10">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Họ và tên *</label>
                <input class="form-control" v-model="nv.tenNhanVien" placeholder="Nhập họ và tên" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Tên tài khoản *</label>
                <input class="form-control" v-model="nv.tenTaiKhoan" placeholder="Nhập tên tài khoản" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Số điện thoại *</label>
                <input class="form-control" v-model="nv.soDienThoai" placeholder="Nhập số điện thoại" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Căn cước công dân *</label>
                <input class="form-control" v-model="nv.cccd" placeholder="Nhập căn cước công dân" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Mật khẩu *</label>
                <input class="form-control" type="password" v-model="nv.matKhau" placeholder="Nhập mật khẩu" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Ngày sinh *</label>
                <input class="form-control" type="date" v-model="nv.ngaySinh" placeholder="Nhập ngày sinh" />
              </div>

              <!-- EMAIL FULL -->
              <div class="col-12 mb-3">
                <label class="form-label">Email *</label>
                <input class="form-control" type="email" v-model="nv.email" placeholder="Nhập email" />
              </div>

              <!-- ĐỊA CHỈ -->
              <div class="col-md-4 mb-3">
                <select class="form-control" v-model="nv.thanhPho">
                  <option value="">Tỉnh / Thành phố *</option>
                  <option v-for="tp in thanhphoOptions" :key="tp">{{ tp }}</option>
                </select>
              </div>

              <div class="col-md-4 mb-3">
                <select class="form-control" v-model="nv.quan">
                  <option value="">Quận / Huyện *</option>
                  <option v-for="q in quanOptions" :key="q">{{ q }}</option>
                </select>
              </div>

              <div class="col-md-4 mb-3">
                <select class="form-control" v-model="nv.phuong">
                  <option value="">Xã / Phường *</option>
                  <option v-for="p in phuongOptions" :key="p">{{ p }}</option>
                </select>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Địa chỉ cụ thể *</label>
                <input class="form-control" v-model="nv.diaChiCuThe" placeholder="Nhập địa chỉ chi tiết" />
              </div>

              <div class="col-md-12 mb-3">
                <label class="form-label">Chức vụ</label> <select class="form-control" v-model="nv.idQuyenHan">
                  <option disabled value="">-- Chọn chức vụ --</option>
                  <option v-for="qh in listQuyenHan" :key="qh.id" :value="qh.id"> {{ qh.tenQuyenHan }} </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTION -->
        <div class="text-end mt-4">
          <button type="submit" class="btn btn-primary me-2">Thêm</button>
          <button type="button" class="btn btn-outline-secondary" @click="cancel">Hủy</button>
        </div>
      </form>
    </div>
  </div>
</template>



<script setup>
import router from "@/router/index";
import { addNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import { getAllQuyenHan } from "@/services/tai_khoan/nhan_vien/quyen_nhanService";
import { onMounted, ref } from "vue";
import Swal from "sweetalert2";


const listQuyenHan = ref([]);
const avatarFile = ref(null);
const fileInput = ref(null);

const nv = ref({
  idQuyenHan: null,
  tenNhanVien: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  anhNhanVien: "",
  ngaySinh: "",
  ghiChu: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: "",
  cccd: "",
  trangThai: true
});

const thanhphoOptions = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

const phuongOptions = ["Phường Xuân Phương", "Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Mễ Trì", "Phường Trung Văn", "Phường Cầu Diễn", "Phường Phú Đô", "Phường Đại Mỗ", "Phường Tây Mỗ", "Phường Minh Khai", "Phường Trung Hòa"
];

const quanOptions = [
  "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Tây Hồ", "Quận Long Biên", "Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Hà Đông", "Quận Sơn Tây"
];

// Email
const emailvali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Số điện thoại VN: 03,05,07,08,09 + 8 số
const phonevali = /^(03|05|07|08|09)\d{8}$/;

// CCCD: đúng 12 số
const cccdvali = /^\d{12}$/;


const submit = async () => {
  // VALIDATE
  if (
    !nv.value.tenNhanVien ||
    !nv.value.tenTaiKhoan ||
    !nv.value.matKhau ||
    !nv.value.email ||
    !nv.value.soDienThoai ||
    !nv.value.cccd ||
    !nv.value.ngaySinh ||
    !nv.value.thanhPho ||
    !nv.value.quan ||
    !nv.value.phuong ||
    !nv.value.diaChiCuThe ||
    !nv.value.idQuyenHan
  ) {
    Swal.fire(
      "Thông báo",
      "Vui lòng nhập đầy đủ thông tin bắt buộc",
      "warning"
    );
    return;
  }

  // VALIDATE EMAIL
  if (!emailvali.test(nv.value.email)) {
    Swal.fire("Thông báo", "Email không đúng định dạng", "warning");
    return;
  }

  // VALIDATE SỐ ĐIỆN THOẠI
  if (!phonevali.test(nv.value.soDienThoai)) {
    Swal.fire(
      "Thông báo",
      "Số điện thoại không hợp lệ (VD: 09xxxxxxxx)",
      "warning"
    );
    return;
  }

  // VALIDATE CCCD
  if (!cccdvali.test(nv.value.cccd)) {
    Swal.fire(
      "Thông báo",
      "Căn cước công dân phải đủ 12 chữ số",
      "warning"
    );
    return;
  }

  try {
    const formData = new FormData();
formData.append("data", new Blob([JSON.stringify(nv.value)], {
  type: "application/json"
}));

if (avatarFile.value) {
  formData.append("file", avatarFile.value);
}

await addNhanVien(formData);

    await Swal.fire("Thành công", "Thêm nhân viên thành công!", "success");
    router.push('/admin/nhan-vien');
  } catch (error) {
    Swal.fire("Lỗi", error.message || "Có lỗi xảy ra khi thêm nhân viên", "error");
  }
};

const cancel = () => {
  router.push('/admin/nhan-vien');
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  avatarFile.value = file; // gửi backend
  nv.value.anhNhanVien = URL.createObjectURL(file); // preview
};

const openFilePicker = () => {
  fileInput.value.click();
};

const getAllQH = async () => {
  try {
    listQuyenHan.value = await getAllQuyenHan();
  } catch (error) {
    console.log("Lỗi lấy danh sách quyền hạn:", error);
  }
};

onMounted(() => {
  getAllQH();
});
</script>

<style scoped>
.create_page {
  padding: 24px;
  min-height: 100vh;
}

.page-title {
  font-weight: 600;
  margin-bottom: 16px;
}

.card {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.avatar {
  width: 96px;
  height: 96px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #9ca3af;
  margin: auto;
}

.avatar-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 42px;
  color: #9ca3af;
}

.avatar-upload {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}

.avatar-upload i {
  font-size: 14px;
}

.form-control {
  border-radius: 6px;
  height: 40px;
}

.form-check-input {
  cursor: pointer;
}

.btn {
  height: 34px;
  padding: 0 14px;
  border: dark;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}
</style>
