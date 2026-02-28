import { computed, onBeforeUnmount, reactive, ref } from "vue";

export function useBanHangVoucherThanhToan(deps) {
  const {
    SalesService,

    isCounter,
    selectedKh,

    tongTienHang,

    // helpers
    todayYmd,
    toYmd,
    formatMoney,
    parseMoneyText,
    formatNumberText,

    showToast,
    persistActiveTab,
    scheduleSyncHoaDon,
  } = deps;

  const phiVanChuyen = ref(0);
  const phiVanChuyenText = ref("0");

  const voucherCode = ref("");
  const voucherManual = ref(null);
  const autoVoucher = ref(null);

  const loadingVoucher = ref(false);
  const voucherDebounce = ref(null);

  const voucherCache = reactive({
    all: [],
    personal: [],
    personalKhId: null,
    loadedAt: 0,
    loadedAtPersonal: 0,
  });

  const effectiveVoucher = computed(() => voucherManual.value || autoVoucher.value);

  const phiVanChuyenNum = computed(() => {
    const n = Number(phiVanChuyen.value || 0);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });

  // ✅ Quy ước đúng theo BE hiện tại:
  // loaiPhieuGiamGia = false/0 => GIẢM %
  // loaiPhieuGiamGia = true/1  => GIẢM TIỀN
  function isVoucherPercent(v) {
    if (!v) return true;

    const raw = v.loaiPhieuGiamGia;

    if (raw === false || raw === 0 || raw === "0") return true;
    if (raw === true || raw === 1 || raw === "1") return false;

    const s = String(raw ?? "").trim().toLowerCase();
    if (s === "false" || s === "0" || s === "percent" || s === "phan_tram" || s === "%")
      return true;
    if (s === "true" || s === "1" || s === "money" || s === "tien" || s === "amount")
      return false;

    // fallback: suy đoán theo giá trị
    const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);
    if (Number.isFinite(giaTri) && giaTri > 100) return false; // >100 thường là tiền
    return true;
  }

  function normalizeVoucherPercent(raw) {
    let n = Number(raw ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    // hỗ trợ trường hợp BE trả 0.1 = 10%
    if (n > 0 && n <= 1) n = n * 100;
    n = Math.round(n);
    n = Math.max(0, Math.min(100, n));
    return n;
  }

  function getCapToiDa(v) {
    const raw = v?.soTienGiamToiDa ?? 0;
    const n = Number(raw || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function calcVoucherDiscount(v, tongTien) {
    const tong = Number(tongTien || 0);
    if (!v || tong <= 0) return 0;

    if (v.xoaMem === true || v.trangThai === false) return 0;

    const remain = Number(v.soLuongSuDung ?? 0);
    if (Number.isFinite(remain) && remain <= 0) return 0;

    const min = Number(v.hoaDonToiThieu ?? v.hoaDonToiThieuTien ?? 0);
    if (Number.isFinite(min) && min > 0 && tong < min) return 0;

    const today = todayYmd();
    const start = toYmd(v.ngayBatDau);
    const end = toYmd(v.ngayKetThuc);
    if (start && today < start) return 0;
    if (end && today > end) return 0;

    const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);
    let discount = 0;

    if (isVoucherPercent(v)) {
      const pct = normalizeVoucherPercent(giaTri);
      if (pct <= 0) return 0;
      discount = Math.round((tong * pct) / 100);
    } else {
      discount = Math.round(Math.max(0, giaTri));
    }

    // ✅ đồng bộ BE: cap tối đa áp dụng cho cả % và tiền
    const cap = getCapToiDa(v);
    if (cap > 0) discount = Math.min(discount, cap);

    discount = Math.min(discount, tong);
    return discount > 0 ? discount : 0;
  }

  function pickBestVoucher(list, tongTien) {
    if (!Array.isArray(list) || list.length === 0) return null;

    let best = null;
    let bestDiscount = 0;

    for (const v of list) {
      const discount = calcVoucherDiscount(v, tongTien);
      if (discount > bestDiscount) {
        bestDiscount = discount;
        best = v;
      }
    }

    return bestDiscount > 0 ? best : null;
  }

  async function loadPublicVouchersIfNeeded() {
    const now = Date.now();
    if (
      voucherCache.loadedAt &&
      now - voucherCache.loadedAt < 60_000 &&
      Array.isArray(voucherCache.all)
    ) {
      return;
    }

    const data = await SalesService.getVouchersPublic().catch(() => []);
    voucherCache.all = Array.isArray(data) ? data : [];
    voucherCache.loadedAt = now;
  }

  async function loadPersonalVouchersMaybe(khachHangId) {
    const now = Date.now();
    if (
      voucherCache.loadedAtPersonal &&
      now - voucherCache.loadedAtPersonal < 30_000 &&
      Array.isArray(voucherCache.personal) &&
      voucherCache.personalKhId === khachHangId
    ) {
      return voucherCache.personal;
    }

    try {
      const data = await SalesService.getVouchersPersonalByKhachHangId(khachHangId).catch(() => []);
      voucherCache.personal = Array.isArray(data) ? data : [];
      voucherCache.personalKhId = khachHangId;
      voucherCache.loadedAtPersonal = now;
      return voucherCache.personal;
    } catch (e) {
      voucherCache.personal = [];
      voucherCache.personalKhId = khachHangId;
      voucherCache.loadedAtPersonal = now;
      return [];
    }
  }

  async function loadBestVoucher() {
    if (voucherManual.value) {
      persistActiveTab();
      return;
    }

    autoVoucher.value = null;

    const tong = Math.round(Number(tongTienHang.value || 0));
    if (tong <= 0) {
      persistActiveTab();
      return;
    }

    loadingVoucher.value = true;
    try {
      await loadPublicVouchersIfNeeded();

      const all = Array.isArray(voucherCache.all) ? voucherCache.all : [];
      let candidates = [...all];

      if (selectedKh.value?.id) {
        const personal = await loadPersonalVouchersMaybe(selectedKh.value.id);
        if (Array.isArray(personal) && personal.length) {
          const normalized = personal
            .map((x) => {
              if (x?.phieuGiamGia) {
                return {
                  ...x.phieuGiamGia,
                  __pggcnId: x.id || x.idPhieuGiamGiaCaNhan || x.idPggcn || null,
                  __isPersonal: true,
                };
              }
              return { ...x, __isPersonal: true };
            })
            .filter(Boolean);

          candidates = candidates.concat(normalized);
        }
      }

      const best = pickBestVoucher(candidates, tong);
      autoVoucher.value = best || null;
    } catch (e) {
      autoVoucher.value = null;
    } finally {
      loadingVoucher.value = false;
      persistActiveTab();
    }
  }

  function scheduleAutoVoucher() {
    if (voucherDebounce.value) clearTimeout(voucherDebounce.value);
    voucherDebounce.value = setTimeout(async () => {
      await loadBestVoucher();
    }, 350);
  }

  async function applyVoucherCode() {
    const code = (voucherCode.value || "").trim();
    if (!code) {
      voucherManual.value = null;
      showToast("Đã bỏ mã phiếu giảm giá.", "info");
      scheduleAutoVoucher();
      scheduleSyncHoaDon();
      return;
    }

    try {
      await loadPublicVouchersIfNeeded();

      let candidates = Array.isArray(voucherCache.all) ? [...voucherCache.all] : [];

      if (selectedKh.value?.id) {
        const personal = await loadPersonalVouchersMaybe(selectedKh.value.id);
        if (Array.isArray(personal) && personal.length) {
          const normalized = personal
            .map((x) =>
              x?.phieuGiamGia
                ? { ...x.phieuGiamGia, __pggcnId: x.id, __isPersonal: true }
                : { ...x, __isPersonal: true },
            )
            .filter(Boolean);
          candidates = candidates.concat(normalized);
        }
      }

      const found = candidates.find(
        (v) => String(v.maPhieuGiamGia || v.ma || v.code || "").trim() === code,
      );

      if (!found) {
        voucherManual.value = null;
        showToast("Không tìm thấy mã phiếu giảm giá.", "error");
        return;
      }

      const disc = calcVoucherDiscount(found, Math.round(tongTienHang.value || 0));
      if (disc <= 0) {
        voucherManual.value = null;
        showToast("Mã không hợp lệ hoặc không đủ điều kiện áp dụng.", "error");
        return;
      }

      voucherManual.value = found;
      autoVoucher.value = null;
      showToast(`Đã áp dụng mã: ${code}`, "success");
      persistActiveTab();
      scheduleSyncHoaDon();
    } catch (e) {
      voucherManual.value = null;
      showToast("Áp dụng mã thất bại (API đang lỗi).", "error");
    }
  }

  const giamGia = computed(() => {
    const v = effectiveVoucher.value;
    const tong = Number(tongTienHang.value || 0);
    if (!v || tong <= 0) return 0;

    return calcVoucherDiscount(v, tong);
  });

  const tongPhaiTra = computed(() => {
    const ship = isCounter.value ? phiVanChuyenNum.value : 0;
    return Math.max(0, Number(tongTienHang.value || 0) - Number(giamGia.value || 0) + ship);
  });

  // ======= Thanh toán =======
  const showPayModal = ref(false);
  const payMethod = ref("TIEN_MAT");
  const payTienMat = ref(0);
  const payChuyenKhoan = ref(0);
  const payMaThamChieu = ref("");
  const payTienMatText = ref("");
  const payChuyenKhoanText = ref("");
  const khachThanhToan = ref(0);

  const payTienMatNum = computed(() => parseMoneyText(payTienMatText.value));
  const payChuyenKhoanNum = computed(() => parseMoneyText(payChuyenKhoanText.value));
  const payTotalNum = computed(() => Math.max(0, payTienMatNum.value + payChuyenKhoanNum.value));

  const tienThieu = computed(() => Math.max(0, tongPhaiTra.value - Number(khachThanhToan.value || 0)));

  const voucherValueText = computed(() => {
    const v = effectiveVoucher.value;
    if (!v) return "";

    const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);
    if (isVoucherPercent(v)) {
      const pct = normalizeVoucherPercent(giaTri);
      return `${pct}%`;
    }
    return formatMoney(giaTri);
  });

  function openPayModal() {
    showPayModal.value = true;
    payTienMatText.value = formatNumberText(payTienMat.value || 0);
    payChuyenKhoanText.value = formatNumberText(payChuyenKhoan.value || 0);
  }

  function closePayModal(blurActive) {
    blurActive();
    showPayModal.value = false;
  }

  function onPayTienMatInput(e) {
    const raw = String(e?.target?.value || "");
    const digits = raw.replace(/\D/g, "");
    const n = digits ? Number(digits) : 0;
    payTienMatText.value = n > 0 ? n.toLocaleString("vi-VN") : "";
  }

  function onPayChuyenKhoanInput(e) {
    const raw = String(e?.target?.value || "");
    const digits = raw.replace(/\D/g, "");
    const n = digits ? Number(digits) : 0;
    payChuyenKhoanText.value = n > 0 ? n.toLocaleString("vi-VN") : "";
  }

  function fillPayConLai(target) {
    const total = Math.round(Number(tongPhaiTra.value || 0));
    if (total <= 0) return;

    const tienMat = payTienMatNum.value;
    const chuyenKhoan = payChuyenKhoanNum.value;

    if (target === "TIEN_MAT") {
      const remain = Math.max(0, total - chuyenKhoan);
      payTienMatText.value = remain > 0 ? remain.toLocaleString("vi-VN") : "";
    } else {
      const remain = Math.max(0, total - tienMat);
      payChuyenKhoanText.value = remain > 0 ? remain.toLocaleString("vi-VN") : "";
    }
  }

  function confirmPay(blurActive) {
    const tienMat = payTienMatNum.value;
    const chuyenKhoan = payChuyenKhoanNum.value;
    const total = tienMat + chuyenKhoan;

    if (total <= 0) {
      showToast("Vui lòng nhập số tiền thanh toán.", "error");
      return;
    }

    payTienMat.value = tienMat;
    payChuyenKhoan.value = chuyenKhoan;
    payMaThamChieu.value = (payMaThamChieu.value || "").trim();

    khachThanhToan.value = total;

    if (tienMat > 0 && chuyenKhoan > 0) payMethod.value = "KET_HOP";
    else if (chuyenKhoan > 0) payMethod.value = "CHUYEN_KHOAN";
    else payMethod.value = "TIEN_MAT";

    blurActive();
    showPayModal.value = false;
    persistActiveTab();
    scheduleSyncHoaDon();
  }

  function onShipFeeInput(e) {
    const raw = String(e?.target?.value || "");
    const digits = raw.replace(/\D/g, "");
    const n = digits ? Number(digits) : 0;
    phiVanChuyen.value = n;
    phiVanChuyenText.value = n > 0 ? n.toLocaleString("vi-VN") : "0";
    scheduleSyncHoaDon();
  }

  onBeforeUnmount(() => {
    try {
      if (voucherDebounce.value) clearTimeout(voucherDebounce.value);
    } catch (e) {}
  });

  return {
    // ship
    phiVanChuyen,
    phiVanChuyenText,
    phiVanChuyenNum,
    onShipFeeInput,

    // voucher
    voucherCode,
    voucherManual,
    autoVoucher,
    effectiveVoucher,
    loadingVoucher,
    voucherValueText,
    giamGia,

    // expose helper (để SalesPage dùng chung rule, tránh đảo)
    isVoucherPercent,

    scheduleAutoVoucher,
    loadBestVoucher,
    applyVoucherCode,

    // payment
    showPayModal,
    payMethod,
    payTienMat,
    payChuyenKhoan,
    payMaThamChieu,
    payTienMatText,
    payChuyenKhoanText,
    payTienMatNum,
    payChuyenKhoanNum,
    payTotalNum,
    khachThanhToan,
    tienThieu,

    openPayModal,
    closePayModal,
    onPayTienMatInput,
    onPayChuyenKhoanInput,
    fillPayConLai,
    confirmPay,

    // totals
    tongPhaiTra,
  };
}