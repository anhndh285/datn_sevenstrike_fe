<template>
  <div class="update_page">
    <h3 class="page-title">CẬP NHẬT KHÁCH HÀNG</h3>

    <div class="card">
      <form @submit.prevent="submit">
        <div class="row g-4">

          <!-- CỘT TRÁI -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Họ và tên</label>
              <input class="form-control" v-model="kh.tenKhachHang" placeholder="Nhập họ và tên" />
            </div>

            <div class="form-group">
              <label>Tên tài khoản</label>
              <input class="form-control" v-model="kh.tenTaiKhoan" placeholder="Nhập tên tài khoản" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input class="form-control" type="email" v-model="kh.email" placeholder="example@email.com" />
            </div>

            <div class="form-group">
              <label>Mật khẩu</label>
              <input class="form-control" type="password" v-model="kh.matKhau" placeholder="Nhập mật khẩu" />
            </div>
          </div>

          <!-- CỘT PHẢI -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Giới tính</label>
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
              <label>Ngày sinh</label>
              <input class="form-control" type="date" v-model="kh.ngaySinh" />
            </div>

            <div class="form-group">
              <label>Số điện thoại</label>
              <input class="form-control" v-model="kh.soDienThoai" placeholder="Nhập số điện thoại" />
            </div>
          </div>

          <!-- ĐỊA CHỈ -->
          <div class="col-md-12">
            <h6 class="section-title">Thông tin địa chỉ</h6>

            <div class="row g-3">
              <div class="col-md-4">
                <label>Tỉnh / Thành phố</label>
                <select class="form-control" v-model="kh.thanhPho" @change="filterDistricts">
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  <option v-for="tp in listThanhPho" :key="tp.thanhPho" :value="tp.thanhPho">
                    {{ tp.thanhPho }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label>Quận / Huyện</label>
                <select class="form-control" v-model="kh.quan" @change="filterWards" :disabled="!kh.thanhPho">
                  <option value="">Chọn Quận / Huyện</option>
                  <option v-for="qh in listQuan" :key="qh.quan" :value="qh.quan">
                    {{ qh.quan }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label>Xã / Phường</label>
                <select class="form-control" v-model="kh.phuong" :disabled="!kh.quan">
                  <option value="">Chọn Xã / Phường</option>
                  <option v-for="xp in listPhuong" :key="xp.phuong" :value="xp.phuong">
                    {{ xp.phuong }}
                  </option>
                </select>
              </div>

              <div class="col-md-12">
                <label>Địa chỉ cụ thể</label>
                <input class="form-control" v-model="kh.diaChiCuThe" placeholder="Số nhà, ngõ, đường..." />
              </div>
            </div>
          </div>


          <!-- ACTION -->
          <div class="col-md-12 text-end mt-4">
            <button type="submit" class="btn btn-primary px-4 me-2">
              Cập nhật
            </button>
            <button type="button" class="btn btn-outline-danger px-4" @click="cancel">
              Xóa
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  detailKhachHang,
  removeKhachHang,
  updateKhachHang
} from "@/services/tai_khoan/khach_hang/khach_hangService";
import { getAllDiaChi } from "@/services/tai_khoan/khach_hang/dia_chi_khach_hangService";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

/* ================== DATA ================== */
const kh = ref({
  id: "",
  tenKhachHang: "",
  tenTaiKhoan: "",
  gioiTinh: null,
  email: "",
  matKhau: "",
  ngaySinh: "",
  soDienThoai: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: ""
});

const listDiaChi = ref([]);

/* ================== COMPUTED ================== */
const listThanhPho = computed(() => {
  const seen = new Set();
  return listDiaChi.value.filter(dc => {
    if (seen.has(dc.thanhPho)) return false;
    seen.add(dc.thanhPho);
    return true;
  });
});

const listQuan = computed(() => {
  if (!kh.value.thanhPho) return [];
  const seen = new Set();
  return listDiaChi.value.filter(dc => {
    if (dc.thanhPho !== kh.value.thanhPho) return false;
    if (seen.has(dc.quan)) return false;
    seen.add(dc.quan);
    return true;
  });
});

const listPhuong = computed(() => {
  if (!kh.value.quan) return [];
  const seen = new Set();
  return listDiaChi.value.filter(dc => {
    if (
      dc.thanhPho !== kh.value.thanhPho ||
      dc.quan !== kh.value.quan
    )
      return false;
    if (seen.has(dc.phuong)) return false;
    seen.add(dc.phuong);
    return true;
  });
});

/* ================== METHODS ================== */
const filterDistricts = () => {
  kh.value.quan = "";
  kh.value.phuong = "";
};

const filterWards = () => {
  kh.value.phuong = "";
};

const loadKhachHang = async () => {
  const data = await detailKhachHang(id);
  kh.value = {
    ...data,
    ngaySinh: data.ngaySinh?.substring(0, 10)
  };
};

watch(
  () => [kh.value.id, listDiaChi.value.length],
  () => {
    if (!kh.value.id || !listDiaChi.value.length) return;

    const dc =
      listDiaChi.value.find(
        d => d.idKhachHang == kh.value.id && d.macDinh
      ) ||
      listDiaChi.value.find(d => d.idKhachHang == kh.value.id);

    if (dc) {
      kh.value.thanhPho = dc.thanhPho;
      kh.value.quan = dc.quan;
      kh.value.phuong = dc.phuong;
      kh.value.diaChiCuThe = dc.diaChiCuThe;
    }
  },
  { immediate: true }
);

/* ================== ACTION ================== */
const submit = async () => {
  await updateKhachHang(id, kh.value);
  router.push("/khachhang");
};

const cancel = async () => {
  if (confirm("Bạn chắc chắn muốn xóa khách hàng này?")) {
    await removeKhachHang(id);
    router.push("/khachhang");
  }
};

/* ================== LIFECYCLE ================== */
onMounted(async () => {
  await loadKhachHang();
  listDiaChi.value = await getAllDiaChi();
});
</script>

<style scoped>
.update_page {
  margin: 24px;
}

.page-title {
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

.form-control {
  height: 38px;
  font-size: 14px;
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
