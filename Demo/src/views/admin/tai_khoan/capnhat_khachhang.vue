<template>
  <div class="update_page">
    <h3 class="page-title">CẬP NHẬT KHÁCH HÀNG</h3>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="row">

          <!-- CỘT TRÁI -->
          <div class="col-md-6">

            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input class="form-control" v-model="kh.tenKhachHang" placeholder="Nhập họ và tên" />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên tài khoản</label>
              <input class="form-control" v-model="kh.tenTaiKhoan" placeholder="Nhập tên tài khoản" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input class="form-control" type="email" v-model="kh.email" placeholder="example@email.com" />
            </div>

            <div class="mb-3">
              <label class="form-label">Mật khẩu</label>
              <input class="form-control" type="password" v-model="kh.matKhau" placeholder="Nhập mật khẩu" />
            </div>

          </div>

          <!-- CỘT PHẢI -->
          <div class="col-md-6">

            <div class="mb-3">
              <label class="form-label">Giới tính</label>
              <div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="nam" :value="true" v-model="kh.gioiTinh" />
                  <label class="form-check-label" for="nam">Nam</label>
                </div>

                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="nu" :value="false" v-model="kh.gioiTinh" />
                  <label class="form-check-label" for="nu">Nữ</label>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Ngày sinh</label>
              <input class="form-control" type="date" v-model="kh.ngaySinh" />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input class="form-control" v-model="kh.soDienThoai" placeholder="Nhập số điện thoại" />
            </div>

          </div>

        </div>

        <!-- ACTION -->
        <div class="text-end mt-4">
          <button type="submit" class="btn btn-primary me-2">Cập nhật</button>
          <button type="button" class="btn btn-danger" @click="cancel">Xóa</button>
        </div>

      </form>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { detailKhachHang, removeKhachHang, updateKhachHang } from "@/services/thuoc_tinh_tai_khoan/khach_hangService";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const kh = ref({
  tenKhachHang: "",
  tenTaiKhoan: "",
  gioiTinh: null,
  email: "",
  matKhau: "",
  ngaySinh: "",
  soDienThoai: ""
});

const loadKhachHang = async () => {
  try {
    const data = await detailKhachHang(id);
    if (data) {
      kh.value = {
        ...data,
        ngaySinh: data.ngaySinh?.substring(0, 10)
      };
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khách hàng:", error);
    alert("Không thể tải thông tin khách hàng!");
  }
};

/* SUBMIT CẬP NHẬT */
const submit = async () => {
  await updateKhachHang(id, kh.value);
  router.push("/khachhang");
};

const cancel = async () => {
  await removeKhachHang(id);
  router.push("/khachhang");
};

onMounted(() => {
  loadKhachHang();
});
</script>


<style scoped>
.update_page {
  margin: 20px;
}

.page-title {
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
