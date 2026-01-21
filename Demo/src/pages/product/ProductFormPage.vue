<template>
  <div class="ss-page">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">{{ isEdit ? "SỬA SẢN PHẨM" : "THÊM SẢN PHẨM" }}</div>
      <button class="btn btn-outline-secondary ss-btn" @click="goBack">Quay lại</button>
    </div>

    <div class="ss-card ss-border p-3">
      <div class="row g-2">
        <div class="col-md-6">
          <label class="form-label">Mã sản phẩm</label>
          <input v-model="form.maSanPham" class="form-control" placeholder="SPxxxxx..." />
        </div>

        <div class="col-md-6">
          <label class="form-label">Tên sản phẩm *</label>
          <input v-model="form.tenSanPham" class="form-control" placeholder="Nike Mercurial..." />
        </div>

        <div class="col-md-6">
          <label class="form-label">Giá</label>
          <input v-model.number="form.gia" type="number" min="0" class="form-control" placeholder="0" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Trạng thái kinh doanh</label>
          <select v-model="form.trangThai" class="form-select">
            <option :value="true">Kinh doanh</option>
            <option :value="false">Ngừng kinh doanh</option>
          </select>
        </div>

        <div class="col-12">
          <label class="form-label">Mô tả ngắn</label>
          <textarea v-model="form.moTaNgan" rows="3" class="form-control" />
        </div>

        <div class="col-12">
          <div class="d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-secondary ss-btn" @click="goBack">Hủy</button>
            <button class="btn btn-dark ss-btn" :disabled="saving" @click="save">
              {{ saving ? "Đang lưu..." : "Lưu" }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import productService from "@/services/productService";

const router = useRouter();
const route = useRoute();

const saving = ref(false);

const id = computed(() => route.params.id);
const isEdit = computed(() => !!id.value);

const form = reactive({
  maSanPham: "",
  tenSanPham: "",
  gia: 0,
  trangThai: true,
  moTaNgan: "",
});

function goBack() {
  router.push("/admin/san-pham");
}

async function fetchOne() {
  if (!isEdit.value) return;
  try {
    const data = await productService.getOne(id.value);
    Object.assign(form, {
      maSanPham: data?.maSanPham ?? data?.ma ?? "",
      tenSanPham: data?.tenSanPham ?? data?.ten ?? "",
      gia: Number(data?.gia ?? data?.giaBan ?? data?.donGia ?? 0),
      trangThai: normalizeKinhDoanh(data?.trangThai ?? data?.kinhDoanh ?? data?.dangKinhDoanh),
      moTaNgan: data?.moTaNgan ?? data?.moTa ?? "",
    });
  } catch (e) {
    console.error(e);
    alert("Không tải được sản phẩm.");
    goBack();
  }
}

function normalizeKinhDoanh(v) {
  if (v === true || v === 1 || v === "1") return true;
  if (v === false || v === 0 || v === "0") return false;
  const s = String(v ?? "").toLowerCase();
  if (s.includes("kinh")) return true;
  if (s.includes("ngung")) return false;
  return true;
}

async function save() {
  if (!form.tenSanPham?.trim()) return alert("Vui lòng nhập tên sản phẩm.");

  const payload = {
    maSanPham: form.maSanPham?.trim() || null,
    tenSanPham: form.tenSanPham?.trim(),
    gia: Number(form.gia ?? 0),
    trangThai: !!form.trangThai,
    moTaNgan: form.moTaNgan || null,
  };

  saving.value = true;
  try {
    if (!isEdit.value) {
      await productService.create(payload);
    } else {
      await productService.update(id.value, payload);
    }
    goBack();
  } catch (e) {
    console.error(e);
    alert("Lưu thất bại. Kiểm tra BE/log.");
  } finally {
    saving.value = false;
  }
}

onMounted(fetchOne);
</script>

<style scoped>
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
}
.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
}
</style>
