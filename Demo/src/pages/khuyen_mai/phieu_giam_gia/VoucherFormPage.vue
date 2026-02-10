<!-- File: src/pages/khuyen_mai/phieu_giam_gia/VoucherFormPage.vue -->
<template>
  <div class="p-4">
    <div class="d-flex align-items-center gap-2 mb-4">
      <button @click="goBack" class="btn btn-link p-0 text-dark" type="button">
        <span class="material-icons">arrow_back</span>
      </button>
      <h2 class="h5 fw-bold m-0 text-uppercase">
        {{ isLocked ? "Chi tiết phiếu (Đã kết thúc)" : form.id ? "Chi tiết phiếu giảm giá" : "Thêm phiếu giảm giá" }}
      </h2>
    </div>

    <div class="row g-4">
      <div :class="[form.loaiPhieuGiamGia ? 'col-lg-7' : 'col-lg-12', { 'locked-content': isLocked }]">
        <div class="card border-0 shadow-sm rounded-4 p-4" :class="{ 'bg-light': isLocked }">
          <VoucherForm v-model="form" v-model:isUnlimited="isUnlimited" :disabled="isLocked" />

          <div class="mt-5 d-flex justify-content-between align-items-center border-top pt-4">
            <div>
              <button
                v-if="form.id"
                @click="handleDelete"
                class="btn btn-outline-danger px-4 rounded-3 d-flex align-items-center gap-2"
                type="button"
              >
                <span class="material-icons fs-5">delete_outline</span> Xóa phiếu
              </button>
            </div>

            <div class="d-flex gap-2">
              <button @click="goBack" class="btn ss-btn-outline px-4 rounded-3" type="button">Quay lại</button>

              <button
                v-if="!isLocked"
                @click="handleSave"
                :disabled="isSaving"
                class="btn ss-btn-primary px-4 rounded-3 shadow"
                type="button"
              >
                {{ isSaving ? "Đang xử lý..." : (form.id ? "Cập nhật" : "Thêm phiếu") }}
              </button>

              <button v-else disabled class="btn btn-secondary px-4 rounded-3 opacity-50" type="button">
                Không thể cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ chỉ render khi cá nhân -->
      <div v-if="form.loaiPhieuGiamGia" class="col-lg-5" :class="{ 'locked-content': isLocked }">
        <VoucherCustomerSelect v-model="selectedCustomerIds" :customers="customers" :disabled="isLocked" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import VoucherForm from "@/components/voucher/VoucherForm.vue";
import VoucherCustomerSelect from "@/components/voucher/VoucherCustomerSelect.vue";

const route = useRoute();
const router = useRouter();

const isSaving = ref(false);
const isLocked = ref(false);
const isUnlimited = ref(false);

const customers = ref([]);
const selectedCustomerIds = ref([]);

const form = ref({
  id: null,
  maPhieuGiamGia: "",
  tenPhieuGiamGia: "",
  moTa: "",

  // ✅ đúng nghiệp vụ: false=công khai | true=cá nhân (BOOLEAN)
  loaiPhieuGiamGia: false,

  // FE dùng nội bộ
  hinhThucGiam: false, // false=VNĐ | true=%
  giaTriGiamGia: 0,
  soTienGiamToiDa: 0,

  soLuongSuDung: 0,
  hoaDonToiThieu: 0,
  ngayBatDau: new Date().toISOString().split("T")[0],
  ngayKetThuc: "",

  // ✅ BE đang dùng Boolean trangThai (true=đang dùng | false=kết thúc)
  trangThai: true,
});

// ✅ back chắc chắn
const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.replace("/admin/giam-gia/phieu");
};

// ✅ chỉ nhận id > 0
const normalizeCustomerIds = (arr) =>
  [...new Set((arr || []).map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0))];

// ✅ Khi đổi công khai <-> cá nhân: nếu về công khai thì clear list KH để tránh rác
watch(
  () => form.value.loaiPhieuGiamGia,
  (isCaNhan) => {
    if (!isCaNhan) selectedCustomerIds.value = [];
  }
);

const loadData = async () => {
  try {
    const cRes = await axios.get("http://localhost:8080/api/admin/khach-hang");
    customers.value = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.content || []);

    const id = route.params.id ? Number(route.params.id) : null;
    if (!id) return;

    const vRes = await axios.get(`http://localhost:8080/api/admin/phieu-giam-gia/${id}`);
    const data = vRes.data || {};

    const loaiCaNhan = data.loaiPhieuGiamGia === true || Number(data.loaiPhieuGiamGia) === 1;

    // ✅ vì BE không có field hinhThucGiam, derive theo rule:
    // giaTriGiamGia > 0 => %
    const isPercent = Number(data.giaTriGiamGia || 0) > 0;

    form.value = {
      ...form.value,
      ...data,
      id: Number(data.id || id),

      loaiPhieuGiamGia: loaiCaNhan,

      hinhThucGiam: isPercent,

      giaTriGiamGia: Number(data.giaTriGiamGia || 0),
      soTienGiamToiDa: Number(data.soTienGiamToiDa || 0),
      soLuongSuDung: Number(data.soLuongSuDung || 0),
      hoaDonToiThieu: Number(data.hoaDonToiThieu || 0),

      // ✅ normalize Boolean trangThai
      trangThai: data.trangThai === true || Number(data.trangThai) === 1,
    };

    isUnlimited.value = Number(data.soLuongSuDung || 0) >= 999999;

    // ✅ lock khi trangThai = false (hoặc 0)
    isLocked.value = !(data.trangThai === true || Number(data.trangThai) === 1);

    if (form.value.loaiPhieuGiamGia) {
      const idsRes = await axios.get(
        `http://localhost:8080/api/admin/phieu-giam-gia/${form.value.id}/khach-hang-ids`
      );
      selectedCustomerIds.value = normalizeCustomerIds(idsRes.data);
    }
  } catch (e) {
    console.error("Lỗi load dữ liệu:", e);
  }
};

const handleSave = async () => {
  if (isLocked.value) return;

  if (!form.value.tenPhieuGiamGia?.trim()) {
    return Swal.fire("Thông báo", "Vui lòng nhập tên phiếu", "warning");
  }

  if (!form.value.ngayBatDau || !form.value.ngayKetThuc) {
    return Swal.fire("Thông báo", "Vui lòng chọn đủ ngày bắt đầu/kết thúc", "warning");
  }
  if (new Date(form.value.ngayKetThuc) < new Date(form.value.ngayBatDau)) {
    return Swal.fire("Thông báo", "Ngày kết thúc phải >= ngày bắt đầu", "warning");
  }

  const uniqueCustomerIds = normalizeCustomerIds(selectedCustomerIds.value);

  if (form.value.loaiPhieuGiamGia && uniqueCustomerIds.length === 0) {
    return Swal.fire("Thông báo", "Vui lòng chọn ít nhất một khách hàng cho phiếu cá nhân", "warning");
  }

  isSaving.value = true;
  try {
    // ✅ GỬI ĐÚNG TYPE CHO BE: Boolean (không gửi 1/0)
    // ✅ Không spread toàn bộ form để tránh gửi field rác/lệch type
    const payload = {
      tenPhieuGiamGia: (form.value.tenPhieuGiamGia || "").trim(),
      moTa: (form.value.moTa || "").trim(),

      loaiPhieuGiamGia: !!form.value.loaiPhieuGiamGia, // boolean

      giaTriGiamGia: Number(form.value.giaTriGiamGia || 0),
      soTienGiamToiDa: Number(form.value.soTienGiamToiDa || 0),

      hoaDonToiThieu: Number(form.value.hoaDonToiThieu || 0),

      soLuongSuDung: form.value.loaiPhieuGiamGia
        ? uniqueCustomerIds.length
        : (isUnlimited.value ? 999999 : Number(form.value.soLuongSuDung || 0)),

      ngayBatDau: form.value.ngayBatDau,
      ngayKetThuc: form.value.ngayKetThuc,

      trangThai: !!form.value.trangThai, // boolean

      ...(form.value.loaiPhieuGiamGia ? { idKhachHangs: uniqueCustomerIds } : {}),
    };

    if (form.value.id) {
      await axios.put(`http://localhost:8080/api/admin/phieu-giam-gia/${form.value.id}`, payload);
    } else {
      await axios.post("http://localhost:8080/api/admin/phieu-giam-gia", payload);
    }

    await Swal.fire("Thành công", "Dữ liệu đã được lưu!", "success");
    router.push("/admin/giam-gia/phieu");
  } catch (e) {
    const msg = e?.response?.data?.detail || e?.response?.data?.message || "Không thể lưu dữ liệu";
    Swal.fire("Lỗi", msg, "error");
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async () => {
  const result = await Swal.fire({
    title: "Xác nhận xóa?",
    text: "Dữ liệu sẽ không thể khôi phục!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý xóa",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:8080/api/admin/phieu-giam-gia/${form.value.id}`);
      await Swal.fire("Đã xóa", "Phiếu giảm giá đã được loại bỏ", "success");
      router.push("/admin/giam-gia/phieu");
    } catch (e) {
      Swal.fire("Lỗi", "Không thể xóa phiếu này", "error");
    }
  }
};

onMounted(loadData);
</script>

<style scoped>
.locked-content {
  opacity: 0.6;
  pointer-events: none;
  user-select: none;
}
.locked-content button,
.locked-content .mt-5 {
  pointer-events: auto;
}

.ss-btn-outline {
  background: #fff;
  color: #111827;
  border: 1px solid rgba(17, 24, 39, 0.28);
  transition: all 0.2s ease;
}
.ss-btn-outline:hover {
  border-color: rgba(255, 77, 79, 0.55);
  background: rgba(255, 77, 79, 0.06);
  color: #111827;
}

.ss-btn-primary {
  color: #fff;
  border: none;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  transition: all 0.2s ease;
}
.ss-btn-primary:hover {
  filter: brightness(1.1);
}
</style>
