<template>
  <div class="create_page">
    <h3 class="title">THÊM MỚI KHÁCH HÀNG</h3>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="row g-4">

          <!-- CỘT TRÁI -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Họ và tên <span>*</span></label>
              <input class="form-control" v-model.trim="kh.tenKhachHang" placeholder="Nhập họ và tên" />
            </div>

            <div class="form-group">
              <label>Tên tài khoản <span>*</span></label>
              <input class="form-control" v-model.trim="kh.tenTaiKhoan" placeholder="Nhập tên tài khoản" />
            </div>

            <div class="form-group">
              <label>Số điện thoại <span>*</span></label>
              <input class="form-control" v-model.trim="kh.soDienThoai" placeholder="Nhập số điện thoại" />
            </div>

            <div class="form-group">
              <label>Email <span>*</span></label>
              <input class="form-control" type="email" v-model.trim="kh.email" placeholder="example@email.com" />
            </div>
          </div>

          <!-- CỘT PHẢI -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Mật khẩu <span>*</span></label>
              <input class="form-control" type="password" v-model="kh.matKhau" placeholder="Nhập mật khẩu" />
            </div>

            <div class="form-group">
              <label>Giới tính <span>*</span></label>
              <div class="d-flex gap-4 mt-1">
                <div class="form-check">
                  <input class="form-check-input" type="radio" :value="true" v-model="kh.gioiTinh" />
                  <label class="form-check-label">Nam</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" :value="false" v-model="kh.gioiTinh" />
                  <label class="form-check-label">Nữ</label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Ngày sinh <span>*</span></label>
              <input class="form-control" type="date" v-model="kh.ngaySinh" :max="today" />
            </div>
          </div>

          <!-- ĐỊA CHỈ -->
          <div class="col-md-12">
            <h6 class="section-title">Thông tin địa chỉ</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <label>Tỉnh / Thành phố <span>*</span></label>
                <select class="form-control" v-model="dc.thanhPho" @change="filterDistricts">
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  <option v-for="tp in listThanhPho" :key="tp" :value="tp">
                    {{ tp }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label>Quận / Huyện <span>*</span></label>
                <select class="form-control" v-model="dc.quan" @change="filterWards" :disabled="!dc.thanhPho">
                  <option value="">Chọn Quận / Huyện</option>
                  <option v-for="qh in listQuan" :key="qh" :value="qh">
                    {{ qh }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label>Xã / Phường <span>*</span></label>
                <select class="form-control" v-model="dc.phuong" :disabled="!dc.quan">
                  <option value="">Chọn Xã / Phường</option>
                  <option v-for="xp in listPhuong" :key="xp" :value="xp">
                    {{ xp }}
                  </option>
                </select>
              </div>

              <div class="col-md-12">
                <label>Địa chỉ cụ thể</label>
                <input class="form-control" v-model.trim="dc.diaChiCuThe" placeholder="Số nhà, ngõ, đường..." />
              </div>
            </div>
          </div>

          <!-- ACTION -->
          <div class="col-md-12 text-end mt-4">
            <button type="submit" class="btn btn-primary px-4 me-2">Thêm</button>
            <button type="button" class="btn btn-outline-secondary px-4" @click="cancel">Hủy</button>
          </div>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import router from "@/router/index";
import { addKhachHang } from "@/services/tai_khoan/khach_hang/khach_hangService";
import { addDiaChi, getAllDiaChi } from "@/services/tai_khoan/khach_hang/dia_chi_khach_hangService";
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

// Khởi tạo EmailJS (thay YOUR_PUBLIC_KEY bằng public key của bạn từ emailjs.com)
const EMAILJS_PUBLIC_KEY = "D-LHcLlAo_N5Vc5Kc";

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const kh = ref({
  tenKhachHang: "",
  tenTaiKhoan: "",
  gioiTinh: null,
  email: "",
  matKhau: "",
  ngaySinh: "",
  soDienThoai: "",
});

const dc = ref({
  idKhachHang: "",
  tenDiaChi: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: ""
});

const tenDiaChi = computed(() => {
  return [
    dc.value.diaChiCuThe,
    dc.value.phuong,
    dc.value.quan,
    dc.value.thanhPho
  ]
    .filter(Boolean)
    .join(", ");
});

const listThanhPho = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

const listQuan = ["Phường Xuân Phương", "Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Mễ Trì", "Phường Trung Văn", "Phường Cầu Diễn", "Phường Phú Đô", "Phường Đại Mỗ", "Phường Tây Mỗ", "Phường Minh Khai", "Phường Trung Hòa"
];

const listPhuong = [
  "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Đống Đa", "Quận Hai Bà Trưng", "Quận Tây Hồ", "Quận Long Biên", "Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Hà Đông", "Quận Sơn Tây"
];

const today = new Date().toISOString().split('T')[0];
const loading = ref(false);

// Email
const emailvali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SĐT VN
const phonevali = /^(03|05|07|08|09)\d{8}$/;

const sendEmail = async () => {
  const templateParams = {
    to_email: kh.value.email,
    to_name: kh.value.tenKhachHang,
    username: kh.value.tenTaiKhoan,
    password: kh.value.matKhau,
    phone: kh.value.soDienThoai
  };

  try {
    const res = await emailjs.send(
      "service_n03lqrf",      // your service ID
      "template_1gy88ic",     // your template ID
      templateParams,
      EMAILJS_PUBLIC_KEY      // pass public key here too
    );
    console.log("EmailJS response:", res);
  } catch (error) {
    console.error("Lỗi gửi email (chi tiết):", error);
    // include server response text if present
    const msg = error?.text || error?.statusText || error?.message || "Gửi email thất bại";
    throw new Error(msg);
  }
};

const filterDistricts = () => {
  dc.value.quan = "";
  dc.value.phuong = "";
};

const filterWards = () => {
  dc.value.phuong = "";
};

const submit = async () => {
  if (loading.value) return;
  loading.value = true;

  // VALIDATE RỖNG
  if (
    !kh.value.tenKhachHang ||
    !kh.value.tenTaiKhoan ||
    !kh.value.matKhau ||
    !kh.value.email ||
    !kh.value.soDienThoai ||
    kh.value.gioiTinh === null ||
    !kh.value.ngaySinh ||
    !dc.value.thanhPho ||
    !dc.value.quan ||
    !dc.value.phuong

  ) {
    Swal.fire(
      "Thông báo",
      "Vui lòng nhập đầy đủ thông tin bắt buộc",
      "warning"
    );
    loading.value = false;
    return;
  }

  // VALIDATE EMAIL
  if (!emailvali.test(kh.value.email)) {
    Swal.fire("Thông báo", "Email không đúng định dạng", "warning");
    loading.value = false;
    return;
  }

  // VALIDATE SỐ ĐIỆN THOẠI
  if (!phonevali.test(kh.value.soDienThoai)) {
    Swal.fire(
      "Thông báo",
      "Số điện thoại không hợp lệ (VD: 09xxxxxxxx)",
      "warning"
    );
    loading.value = false;
    return;
  }

  try {
    await sendEmail();

    const res = await addKhachHang(kh.value);
    dc.value.idKhachHang = res.id;

    dc.value.tenDiaChi = tenDiaChi.value;
    await addDiaChi(dc.value);



    await Swal.fire(
      "Thành công",
      "Thêm khách hàng và gửi email thành công!",
      "success"
    );
    router.push('/khachhang');
  } catch (e) {
    Swal.fire(
      "Lỗi",
      e.response?.data?.message || e.message || "Có lỗi xảy ra",
      "error"
    );
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  router.push('/khachhang');
};
</script>

<style scoped>
.create_page {
  margin: 24px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 16px;
}

label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

label span {
  color: #dc3545;
}

.form-control {
  height: 38px;
  font-size: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #495057;
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