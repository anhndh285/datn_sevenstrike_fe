<template>
  <div class="update_page">
    <h3 class="page-title">CẬP NHẬT NHÂN VIÊN</h3>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="row">

          <!-- AVATAR -->
          <div class="col-md-2 text-center">
            <div class="avatar-wrapper">
              <img v-if="nv.anhNhanVien" :src="getImageUrl(nv.anhNhanVien)" class="avatar-img" />
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

          <!-- THÔNG TIN CÁ NHÂN -->
          <div class="col-md-5">
            <h6 class="section-title">Thông tin cá nhân</h6>

            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input class="form-control" v-model="nv.tenNhanVien" />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên tài khoản</label>
              <input class="form-control" v-model="nv.tenTaiKhoan" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="nv.email" />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input class="form-control" v-model="nv.soDienThoai" />
            </div>
          </div>

          <!-- ĐỊA CHỈ -->
          <div class="col-md-5">
            <h6 class="section-title">Thông tin địa chỉ</h6>

            <div class="mb-3">
              <label class="form-label">Thành phố</label>
              <select class="form-control" v-model="nv.thanhPho">
                <option value="">Chọn thành phố</option>
                <option v-for="tp in thanhphoOptions" :key="tp">{{ tp }}</option>
              </select>
            </div>

            <div class="mb-3 d-flex gap-2">
              <div class="flex-grow-1">
                <label class="form-label">Quận</label> <select class="form-control"
                  v-model="nv.quan">
                  <option v-for="q in quanOptions" :key="q">{{ q }}</option>
                </select> </div>
              <div class="flex-grow-1">
                <label class="form-label">Phường</label> <select class="form-control"
                  v-model="nv.phuong">
                  <option v-for="p in phuongOptions" :key="p">{{ p }}</option>
                </select> </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Địa chỉ chi tiết</label>
              <input class="form-control" v-model="nv.diaChiCuThe" />
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="d-flex justify-content-between align-items-center mt-4">
          <button type="button" class="btn" :class="nv.trangThai ? 'btn-warning' : 'btn-success'" @click="toggleStatus">
            {{ nv.trangThai ? 'Hủy hoạt động' : 'Hoạt động' }}
          </button>

          <div>
            <button type="submit" class="btn btn-primary me-2">Cập nhật</button>
            <button type="button" class="btn btn-danger" @click="cancel">Xóa</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>



<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { detailNhanVien, removeNhanVien, updateNhanVien } from "@/services/thuoc_tinh_tai_khoan/nhan_vienService";
import { getAllQuyenHan } from "@/services/thuoc_tinh_tai_khoan/quyen_hanService";

const router = useRouter();
const route = useRoute();
const avatarFile = ref(null);
const id = route.params.id;

const listQuyenHan = ref([]);

const BASE_URL = "http://localhost:8080";

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
  cccd: ""
});

const thanhphoOptions = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

const phuongOptions = ["Phường Xuân Phương", "Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Mễ Trì", "Phường Trung Văn", "Phường Cầu Diễn", "Phường Phú Đô", "Phường Đại Mỗ", "Phường Tây Mỗ", "Phường Minh Khai", "Phường Trung Hòa"
];

const quanOptions = [
  "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Tây Hồ", "Quận Long Biên", "Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Hà Đông", "Quận Sơn Tây"
];

const getAllQH = async () => {
  listQuyenHan.value = await getAllQuyenHan();
};

/* LẤY THÔNG TIN NHÂN VIÊN THEO ID */
const loadNhanVien = async () => {
  try {
    const data = await detailNhanVien(id);
    if (data) {
      nv.value = {
        ...data,
        ngaySinh: data.ngaySinh?.substring(0, 10)
      };
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết nhân viên:", error);
    alert("Không thể tải thông tin nhân viên!");
  }
};

const toggleStatus = async () => {
  try {
    nv.value.trangThai = !nv.value.trangThai;
    await updateNhanVien(id, nv.value);
    alert(
      nv.value.trangThai === true
        ? "Đã kích hoạt nhân viên!"
        : "Đã hủy kích hoạt nhân viên!"
    );
  } catch (e) {
    console.error(e);
    alert("Cập nhật trạng thái thất bại: " + e.message);
  }
};

const submit = async () => {
  try {
    const formData = new FormData();
formData.append("data", new Blob([JSON.stringify(nv.value)], {
  type: "application/json"
}));

if (avatarFile.value) {
  formData.append("file", avatarFile.value);
}

await updateNhanVien(id, formData);

    alert("Cập nhật thành công!");
    router.push("/nhanvien");
  } catch (error) {
    console.error(error);
    alert("Cập nhật thất bại: " + error.message);
  }
};

const cancel = async () => {
  try {
    await removeNhanVien(id);
    router.push("/nhanvien");
  } catch (error) {
    console.error(error);
    alert("Xóa thất bại: " + error.message);
  }
};

const fileInput = ref(null);

const openFilePicker = () => {
  fileInput.value?.click();
};

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // ⭐ QUAN TRỌNG
  avatarFile.value = file;

  // preview
  const reader = new FileReader();
  reader.onload = (e) => {
    nv.value.anhNhanVien = e.target?.result;
  };
  reader.readAsDataURL(file);
};



const getImageUrl = (imageData) => {
  if (!imageData) return null;

  // preview từ upload
  if (imageData.startsWith("data:")) {
    return imageData;
  }

  // từ backend (đã có /add/nhanvien/...)
  return BASE_URL + imageData;
};


onMounted(() => {
  getAllQH();
  loadNhanVien();
});
</script>


<style scoped>
.update_page {
  margin: 20px;
}

.page-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 15px;
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
</style>
