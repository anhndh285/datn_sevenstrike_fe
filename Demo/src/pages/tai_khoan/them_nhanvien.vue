<template>
  <div class="taikhoan-form">
    <div class="header-section">
      <h2 class="page-title">Thêm nhân viên</h2>
      <div class="toolbar-right">
        <button class="btn btn-outline" @click="back">
          <i class="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <button class="btn btn-primary" :disabled="saving" @click="submit">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </div>
    </div>

    <div class="form-card">
      <div>
        <div class="right-col-header">
  <button class="btn btn-outline btn-sm" @click="toggleScanner">
    <i class="fa-solid fa-qrcode"></i> Quét QR
  </button>
</div>


<div v-if="showScanner" class="scanner-overlay">
  <div class="scanner-box">
    <div class="scanner-header">
      <span>Quét mã QR CCCD</span>
      <button class="btn-close" @click="stopScanner">✕</button>
    </div>
    <div id="reader" width="600px"></div>
    <div class="scanner-hint">Đưa mã QR CCCD vào khung hình</div>
  </div>
</div>
      </div>
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="fileRef?.click()">
          <img v-if="form.anhNhanVien" :src="form.anhNhanVien" class="avatar-img" />
          <div v-else class="avatar-placeholder">
            <i class="fa-solid fa-camera"></i>
            <span>Chọn ảnh</span>
          </div>
          <input ref="fileRef" type="file" accept="image/*" class="d-none" @change="onPickFile" />
        </div>
        <div class="avatar-hint">PNG, JPG, JPEG - Tối đa 5MB</div>
        
        <button v-if="form.anhNhanVien" class="btn-text-red" @click.stop="clearImage">
          Xóa ảnh
        </button>
      </div>

      <div class="form-grid">
        
        <div class="form-group">
          <label class="label">Tên nhân viên</label>
          <input v-model.trim="form.tenNhanVien" class="input" placeholder="Nhập họ và tên" />
        </div>
        <div class="form-group">
          <label class="label">Số điện thoại</label>
          <input v-model.trim="form.soDienThoai" class="input" placeholder="Nhập số điện thoại" />
        </div>

        <div class="form-group">
          <label class="label">Email</label>
          <input v-model.trim="form.email" type="email" class="input" placeholder="Nhập địa chỉ email" />
        </div>

        <div class="form-group">
          <label class="label">Tỉnh/Thành phố</label>
<<<<<<< HEAD
          <select class="input select" v-model="addr.tinhCode" @change="onTinhChange">
=======
          <select class="input select" v-model="addr.tinhCode" @change="timTinh">
>>>>>>> 02bb122 (init update new UI)
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Quận/Huyện</label>
<<<<<<< HEAD
          <select class="input select" v-model="addr.huyenCode" @change="onHuyenChange">
=======
          <select class="input select" v-model="addr.huyenCode" @change="timHuyen">
>>>>>>> 02bb122 (init update new UI)
            <option value="">-- Chọn Quận/Huyện --</option>
            <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Xã/Phường</label>
          <select class="input select" v-model="addr.xaCode">
            <option value="">-- Chọn Xã/Phường --</option>
            <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Địa chỉ cụ thể</label>
          <input v-model.trim="form.diaChiCuThe" class="input" placeholder="Số nhà, tên đường..." />
        </div>

        <div class="form-group">
          <label class="label">Ngày sinh</label>
          <input v-model="form.ngaySinh" type="date" class="input" />
        </div>

        <div class="form-group">
            <label class="label">Quyền hạn <span class="req">*</span></label>
            <select v-model="form.idQuyenHan" class="input select">
              <option value="">-- Chọn quyền hạn --</option>
              <option v-for="q in quyenHanOptions" :key="q.id" :value="q.id">
                {{ q.ten ?? q.tenQuyenHan ?? ("Quyền " + q.id) }}
              </option>
            </select>
        </div>
        <div class="form-group">
           <label class="label">Ghi chú</label>
           <input v-model="form.ghiChu" class="input" placeholder="Ghi chú thêm..." />
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, onMounted, computed, nextTick } from "vue";
=======
import { ref, onMounted, nextTick } from "vue";
>>>>>>> 02bb122 (init update new UI)
import { useRouter } from "vue-router";
import { Html5QrcodeScanner } from "html5-qrcode";
import { addNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import vnAddressService from "@/services/vnAddressService";
import emailjs from "@emailjs/browser";

const router = useRouter();
const saving = ref(false);
const errorMsg = ref("");
const fileRef = ref(null);

const EMAILJS_PUBLIC_KEY = "D-LHcLlAo_N5Vc5Kc";
emailjs.init(EMAILJS_PUBLIC_KEY);

const form = ref({
  idQuyenHan: "",
  tenNhanVien: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  anhNhanVien: "",
  ngaySinh: "",
  ghiChu: "",
  diaChiCuThe: "",
  trangThai: true,
});

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const addr = ref({
  tinhCode: "",
  huyenCode: "",
  xaCode: "",
});

const quyenHanOptions = ref([]);

const back = () => router.push({ name: "tai-khoan-nhan-vien" });

const loadQuyenHan = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/admin/quyen-han");
    if (!res.ok) return;
    const data = await res.json();
    quyenHanOptions.value = Array.isArray(data) ? data : data?.content ?? [];
  } catch {
    quyenHanOptions.value = [];
  }
};

const findName = (list, code) => list.find((x) => String(x.code) === String(code))?.name || "";

<<<<<<< HEAD
const onTinhChange = async () => {
=======
const timTinh = async () => {
>>>>>>> 02bb122 (init update new UI)
  addr.value.huyenCode = "";
  addr.value.xaCode = "";
  wards.value = [];
  districts.value = addr.value.tinhCode ? await vnAddressService.getDistricts(addr.value.tinhCode) : [];
};

const timHuyen = async () => {
  addr.value.xaCode = "";
  wards.value = addr.value.huyenCode ? await vnAddressService.getWards(addr.value.huyenCode) : [];
};

const onPickFile = (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.value.anhNhanVien = reader.result;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  form.value.anhNhanVien = "";
  if (fileRef.value) fileRef.value.value = "";
};

const removeVietnameseTones = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

const buildUsername = (fullName) => {
  if (!fullName) return "";
  const noTone = removeVietnameseTones(fullName.trim().toLowerCase());
  const parts = noTone.split(/\s+/);
  const lastName = parts[parts.length - 1];
  const initials = parts.slice(0, parts.length - 1).map((x) => x[0]).join("");
  return lastName + initials;
};

const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const showScanner = ref(false);
let scanner = null;

<<<<<<< HEAD
const onScanSuccess = async (decodedText, decodedResult) => {
  try {
    const data = JSON.parse(decodedText);

    if (data.tenNhanVien) form.value.tenNhanVien = data.tenNhanVien;
    if (data.email) form.value.email = data.email;
    if (data.soDienThoai) form.value.soDienThoai = data.soDienThoai;
    if (data.ngaySinh) form.value.ngaySinh = data.ngaySinh;
    if (data.ghiChu) form.value.ghiChu = data.ghiChu;
    if (data.diaChiCuThe) form.value.diaChiCuThe = data.diaChiCuThe;

    if (form.value.tenNhanVien) {
        form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);
    }

    if (data.thanhPho) {
      const tinhCode = findCodeByName(provinces.value, data.thanhPho);
      if (tinhCode) {
        addr.value.tinhCode = tinhCode;
        await onTinhChange();

        if (data.quan) {
          const huyenCode = findCodeByName(districts.value, data.quan);
          if (huyenCode) {
            addr.value.huyenCode = huyenCode;
            await onHuyenChange();

            if (data.phuong) {
              const xaCode = findCodeByName(wards.value, data.phuong);
              if (xaCode) {
                addr.value.xaCode = xaCode;
              }
            }
          }
        }
      }
    }

    alert("Quét dữ liệu thành công!");
    stopScanner();

  } catch (e) {
    console.error("Lỗi đọc QR:", e);
    alert("Mã QR không hợp lệ. Vui lòng sử dụng mã QR đúng định dạng JSON hệ thống.");
  }
};

=======

const normalizeString = (str) => {
  if (!str) return "";
  let s = removeVietnameseTones(str.trim().toLowerCase());
  s = s.replace(/(tinh|thanh pho|tp|huyen|quan|thi xa|xa|phuong|thi tran)\s+/g, "").trim();
  return s;
};

const diachicccd = (list, nameToFind) => {
  if (!nameToFind || !list || list.length === 0) return null;
  const target = normalizeString(nameToFind);
  
  let found = list.find(item => normalizeString(item.name) === target);
  
  if (!found) {
    found = list.find(item => normalizeString(item.name).includes(target) || target.includes(normalizeString(item.name)));
  }
  return found ? found.code : null;
};

const onScanSuccess = async (decodedText, decodedResult) => {
  try {
    if (decodedText.includes("|")) {
      await CCCDScan(decodedText);
    } 

    alert("Quét dữ liệu thành công!");
    stopScanner();

  } catch (e) {
    console.error("Lỗi xử lý dữ liệu:", e);
    alert("Dữ liệu không hợp lệ hoặc lỗi hệ thống địa chỉ.");
  }
};

const CCCDScan = async (text) => {
  const parts = text.split("|");
  
  if (parts.length < 6) throw new Error("Format CCCD không đúng");

  form.value.tenNhanVien = parts[2];
  form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);

  const rawDob = parts[3];
  if (rawDob && rawDob.length === 8) {
    form.value.ngaySinh = `${rawDob.slice(4)}-${rawDob.slice(2, 4)}-${rawDob.slice(0, 2)}`;
  }

  const fullAddress = parts[5];
  const addrParts = fullAddress.split(",").map(s => s.trim());
  
  const tinhName = addrParts.length > 0 ? addrParts[addrParts.length - 1] : "";
  const huyenName = addrParts.length > 1 ? addrParts[addrParts.length - 2] : "";
  const xaName = addrParts.length > 2 ? addrParts[addrParts.length - 3] : "";
  
  const specificAddr = addrParts.slice(0, addrParts.length - 3).join(", ");
  form.value.diaChiCuThe = specificAddr || fullAddress;

  if (tinhName) {
    const tinhCode = diachicccd(provinces.value, tinhName);
    if (tinhCode) {
      addr.value.tinhCode = tinhCode;
      await timTinh();

      if (huyenName) {
        const huyenCode = diachicccd(districts.value, huyenName);
        if (huyenCode) {
          addr.value.huyenCode = huyenCode;
          await timHuyen();

          if (xaName) {
             const xaCode = diachicccd(wards.value, xaName);
             if (xaCode) addr.value.xaCode = xaCode;
          }
        }
      }
    }
  }

};

// const nhapqr = async (data) => {
//     if (data.tenNhanVien) form.value.tenNhanVien = data.tenNhanVien;
//     if (data.email) form.value.email = data.email;
//     if (data.soDienThoai) form.value.soDienThoai = data.soDienThoai;
//     if (data.ngaySinh) form.value.ngaySinh = data.ngaySinh;
//     if (data.ghiChu) form.value.ghiChu = data.ghiChu;
//     if (data.diaChiCuThe) form.value.diaChiCuThe = data.diaChiCuThe;

//     if (form.value.tenNhanVien) {
//         form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);
//     }

//     if (data.thanhPho) {
//       const tinhCode = findCodeByName(provinces.value, data.thanhPho);
//       if (tinhCode) {
//         addr.value.tinhCode = tinhCode;
//         await onTinhChange();

//         if (data.quan) {
//           const huyenCode = findCodeByName(districts.value, data.quan);
//           if (huyenCode) {
//             addr.value.huyenCode = huyenCode;
//             await onHuyenChange();

//             if (data.phuong) {
//               const xaCode = findCodeByName(wards.value, data.phuong);
//               if (xaCode) addr.value.xaCode = xaCode;
//             }
//           }
//         }
//       }
//     }
// }

>>>>>>> 02bb122 (init update new UI)
const toggleScanner = async () => {
  showScanner.value = !showScanner.value;
  if (showScanner.value) {
    await nextTick();
    scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(onScanSuccess, (err) => {});
  } else {
    stopScanner();
  }
};

const stopScanner = () => {
  if (scanner) {
    scanner.clear().catch(console.error);
    scanner = null;
  }
  showScanner.value = false;
};

const sendEmail = async ({ tenNhanVien, tenTaiKhoan, matKhau, email }) => {
<<<<<<< HEAD
    console.log("Sending email to", email);
=======
  try {
    const serviceID = "service_n03lqrf";
    const templateID = "template_1gy88ic";

    const templateParams = {
      to_email: email,
      to_name: tenNhanVien,
      username: tenTaiKhoan,
      password: matKhau,
    };

    const response = await emailjs.send(serviceID, templateID, templateParams);
    console.log("Email gửi thành công!", response.status, response.text);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
  }
>>>>>>> 02bb122 (init update new UI)
};

const validate = () => {
  if (!form.value.tenNhanVien) return "Chưa nhập tên nhân viên";
  if (!form.value.email) return "Chưa nhập email";
  if (!form.value.soDienThoai) return "Chưa nhập số điện thoại";
  if (!form.value.idQuyenHan) return "Chưa chọn quyền hạn";
  if (!addr.value.tinhCode || !addr.value.huyenCode || !addr.value.xaCode) return "Chưa chọn địa chỉ đầy đủ";
  return "";
};

const submit = async () => {
  form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);
  form.value.matKhau = generatePassword();

  const msg = validate();
  if (msg) {
    alert(msg);
    return;
  }

  try {
    saving.value = true;
    const payload = {
      ...form.value,
      idQuyenHan: Number(form.value.idQuyenHan),
      thanhPho: findName(provinces.value, addr.value.tinhCode),
      quan: findName(districts.value, addr.value.huyenCode),
      phuong: findName(wards.value, addr.value.xaCode),
    };

    await addNhanVien(payload);
    await sendEmail({
      tenNhanVien: form.value.tenNhanVien,
      tenTaiKhoan: form.value.tenTaiKhoan,
      matKhau: form.value.matKhau,
      email: form.value.email,
    });
    
    alert("Thêm nhân viên thành công!");
    back();
  } catch (e) {
    alert(e.message || "Lỗi hệ thống");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  provinces.value = await vnAddressService.getProvinces();
  await loadQuyenHan();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

<<<<<<< HEAD
.taikhoan-form {
  font-family: "Inter", sans-serif;
  max-width: 1000px;
  margin: 20px auto;
  color: #334155;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.form-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.avatar-wrapper:hover {
  background-color: #e2e8f0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
  gap: 5px;
}

.avatar-placeholder i {
  font-size: 24px;
}

.avatar-placeholder span {
  font-size: 12px;
}

.avatar-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #94a3b8;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 30px;
  row-gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  display: flex;
  justify-content: space-between;
}

.input {
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 16px;
  font-size: 14px;
  
  background-color: #ffffff !important; 
  color: #1e293b !important;
  
  transition: border-color 0.2s;
  outline: none;
}

.input:focus {
  border-color: #f97316;
  background-color: #ffffff;
}

.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  background-color: #ffffff !important;
}

.radio-group {
  display: flex;
  gap: 24px;
  align-items: center;
  height: 44px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
}

.radio-item input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
  cursor: pointer;
}

.form-footer {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
=======
/* ===== SevenStrike font wrapper (không in đậm) ===== */
.taikhoan-form{
  font-family: inherit; /* không ép Inter nếu dự án đã có font chung */
  max-width: 1000px;
  margin: 20px auto;
  color: rgba(17,24,39,0.82);
}

/* ===== Header ===== */
.header-section{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 12px;
  margin-bottom: 12px;
}

.page-title{
  font-size: 20px;
  font-weight: 500;
  color: rgba(17,24,39,0.88);
  margin: 0;
}

/* ===== Card ===== */
.form-card{
  background:#fff;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid rgba(255,77,79,0.18);
  box-shadow: 0 18px 50px rgba(17,24,39,0.08);
}

/* ===== Avatar ===== */
.avatar-section{
  display:flex;
  flex-direction: column;
  align-items:center;
  margin: 10px 0 18px;
}

.avatar-wrapper{
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(17,24,39,0.03);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  overflow:hidden;
  position: relative;
  transition: 0.15s ease;
  border: 1px solid rgba(17,24,39,0.14);
}
.avatar-wrapper:hover{
  background: rgba(17,24,39,0.04);
}

.avatar-img{ width:100%; height:100%; object-fit: cover; }

.avatar-placeholder{
  display:flex;
  flex-direction: column;
  align-items:center;
  gap: 6px;
  color: rgba(17,24,39,0.45);
}
.avatar-placeholder i{ font-size: 20px; }
.avatar-placeholder span{ font-size: 12px; font-weight: 400; }

.avatar-hint{
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(17,24,39,0.55);
}

.btn-text-red{
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 6px;
}

/* ===== Form grid ===== */
.form-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 18px;
  row-gap: 14px;
}

.form-group{
  display:flex;
  flex-direction: column;
  gap: 6px;
}

/* label chuẩn 13px, không in đậm */
.label{
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.82);
  display:flex;
  align-items:center;
  justify-content: space-between;
}

.req{ color:#ef4444; }

/* input chuẩn 40px */
.input{
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(17,24,39,0.14);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.82);
  background: #fff !important;
  outline: none;
  transition: 0.15s ease;
}
.input:focus{
  border-color: rgba(255,77,79,0.45);
  box-shadow: 0 0 0 0.18rem rgba(255,77,79,0.14);
}

/* select giữ mũi tên nhẹ */
.select{
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 1em;
  padding-right: 34px;
}

/* ===== Buttons (13px, không in đậm) ===== */
.toolbar-right{
  display:flex;
  gap: 10px;
  align-items:center;
>>>>>>> 02bb122 (init update new UI)
}

.btn{
  height: 36px;
  padding: 0 14px;
<<<<<<< HEAD
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
  border-radius: 10px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  transition: .2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-primary{
  color:#fff;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}

.btn-outline{
  background:#fff;
  border:1px solid rgba(17,24,39,0.14);
  color: rgba(17,24,39,0.88);
}

.btn-text-red {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
}

.scan-action {
  color: #007bff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.d-none { display: none; }

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.scanner-overlay {
  position: fixed; inset: 0; z-index: 999;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
}
.scanner-box {
  background: white; padding: 20px; border-radius: 10px; width: 90%; max-width: 400px;
}
.scanner-header {
  display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold;
}
.btn-close { border: none; background: none; font-size: 20px; cursor: pointer;}
.scanner-hint { text-align: center; margin-top: 10px; font-size: 13px; color: #666; }
</style>
=======
  border-radius: 10px;
  border: 1px solid rgba(17,24,39,0.14);
  background:#fff;
  color: rgba(17,24,39,0.88);
  font-size: 13px;
  font-weight: 400;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
  transition: 0.15s ease;
}
.btn:hover{ background: rgba(17,24,39,0.04); }
.btn:disabled{ opacity:.6; cursor:not-allowed; }

.btn-primary{
  border: none;
  color:#fff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}
.btn-primary:hover{ filter: brightness(0.98); }

.btn-outline{
  background:#fff;
  border:1px solid rgba(17,24,39,0.14);
  color: rgba(17,24,39,0.88);
}

/* btn-sm (Quét QR) vẫn giữ 36px nhưng padding nhỏ hơn */
.btn.btn-sm{
  padding: 0 12px;
}

/* ===== Scanner overlay (không in đậm) ===== */
.scanner-overlay{
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(17,24,39,0.45);
  display:flex;
  justify-content:center;
  align-items:center;
}

.scanner-box{
  background:#fff;
  border-radius: 14px;
  width: 92%;
  max-width: 420px;
  border: 1px solid rgba(17,24,39,0.14);
  box-shadow: 0 18px 50px rgba(17,24,39,0.18);
  padding: 14px;
}

.scanner-header{
  display:flex;
  justify-content: space-between;
  align-items:center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 500; /* tiêu đề nhỏ, nhẹ */
  color: rgba(17,24,39,0.88);
}

.btn-close{
  border: 1px solid rgba(17,24,39,0.14);
  background:#fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  color: rgba(17,24,39,0.88);
  transition: 0.15s ease;
}
.btn-close:hover{ background: rgba(17,24,39,0.04); }

.scanner-hint{
  text-align:center;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(17,24,39,0.55);
}

.d-none{ display:none; }

@media (max-width: 768px){
  .form-grid{ grid-template-columns: 1fr; }
}
</style>
>>>>>>> 02bb122 (init update new UI)
