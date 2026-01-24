<template>
  <div class="create_page">
    <h3 class="title">THÊM MỚI KHÁCH HÀNG</h3>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="row">

          <!-- CỘT TRÁI -->
          <div class="col-md-6">

            <div class="mb-3">
              <label class="form-label">Họ và tên *</label>
              <input class="form-control" v-model.trim="kh.tenKhachHang" placeholder="Nhập họ và tên" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên tài khoản *</label>
              <input class="form-control" v-model.trim="kh.tenTaiKhoan" placeholder="Nhập tên tài khoản" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại *</label>
              <input class="form-control" v-model.trim="kh.soDienThoai" placeholder="Nhập số điện thoại" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Email *</label>
              <input class="form-control" type="email" v-model.trim="kh.email" placeholder="example@email.com"
                required />
            </div>

          </div>

          <!-- CỘT PHẢI -->
          <div class="col-md-6">

            <div class="mb-3">
              <label class="form-label">Mật khẩu *</label>
              <input class="form-control" type="password" v-model="kh.matKhau" placeholder="Nhập mật khẩu" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Giới tính *</label>
              <div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" :value="true" v-model="kh.gioiTinh" required />
                  <label class="form-check-label">Nam</label>
                </div>

                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" :value="false" v-model="kh.gioiTinh" />
                  <label class="form-check-label">Nữ</label>
                </div>
              </div>
            </div>


            <div class="mb-3">
              <label class="form-label">Ngày sinh *</label>
              <input class="form-control" type="date" v-model="kh.ngaySinh" :max="today" required />
            </div>

          </div>
        </div>

        <!-- ACTION -->
        <div class="text-end mt-4">
          <button type="submit" class="btn btn-primary me-2">
            Thêm
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="cancel">
            Hủy
          </button>
        </div>

      </form>
    </div>
  </div>
</template>


<script setup>
import router from "@/router/router";
import { addKhachHang } from "@/services/thuoc_tinh_tai_khoan/khach_hangService";
import { ref } from "vue";
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
  soDienThoai: ""
});

const today = new Date().toISOString().split('T')[0];
const loading = ref(false);

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

const submit = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await sendEmail();

    await addKhachHang(kh.value);

    await Swal.fire("Thành công", "Thêm khách hàng và gửi email thành công!", "success");
    router.push('/khachhang');
  } catch (e) {
    Swal.fire("Lỗi", "Lỗi: " + (e.response?.data?.message || e.message), "error");
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
  margin: 20px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
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
