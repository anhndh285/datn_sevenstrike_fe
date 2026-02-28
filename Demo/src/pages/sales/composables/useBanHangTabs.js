// File: src/pages/sales/composables/useBanHangTabs.js
import { onBeforeUnmount, ref } from "vue";

export function useBanHangTabs(deps) {
  const {
    // state refs cần sync vào tab
    isCounter,
    cartItems,

    selectedKh,
    diaChiList,
    selectedDiaChi,

    autoVoucher,
    voucherManual,
    voucherCode,

    khachThanhToan,
    payMethod,
    payTienMat,
    payChuyenKhoan,
    payMaThamChieu,
    payTienMatText,
    payChuyenKhoanText,

    guest,

    phiVanChuyen,
    phiVanChuyenText,

    // deps
    apiClient,
    showToast,
    capNhatTonLocal,

    // callbacks
    scheduleAutoVoucher,
    scheduleSyncHoaDon,
    ensureBaseQtyIfCartHasItems,
    capNhatDotGiamGiaChoGioHang,
    loadDiaChiAndPickDefault,

    // stock key clear
    xoaTonKhoLocal,
    dongTatCaModal,
    blurActive,
  } = deps;

  const maxOrderTabs = ref(10);
  const tabs = ref([]);
  const activeTab = ref(0);

  const midnightTimer = ref(null);
  const midnightInterval = ref(null);
  const lastDayKey = ref("");

  function persistTabs() {
    localStorage.setItem("ss_pos_tabs", JSON.stringify(tabs.value || []));
    localStorage.setItem("ss_pos_active_tab", String(activeTab.value));
  }

  function persistActiveTab() {
    const t = tabs.value?.[activeTab.value];
    if (!t) return;

    t.isCounter = isCounter.value;
    t.cartItems = Array.isArray(cartItems.value) ? cartItems.value.map((x) => ({ ...x })) : [];
    t.selectedKh = selectedKh.value;
    t.diaChiList = Array.isArray(diaChiList.value) ? diaChiList.value.map((x) => ({ ...x })) : [];
    t.selectedDiaChi = selectedDiaChi.value;

    t.autoVoucher = autoVoucher.value;
    t.voucherManual = voucherManual.value;
    t.voucherCode = voucherCode.value;

    t.khachThanhToan = khachThanhToan.value;
    t.payMethod = payMethod.value;
    t.payTienMat = payTienMat.value;
    t.payChuyenKhoan = payChuyenKhoan.value;
    t.payMaThamChieu = payMaThamChieu.value;

    t.guest = { ...(guest || {}) };
    t.phiVanChuyen = phiVanChuyen.value;
    t.phiVanChuyenText = phiVanChuyenText.value;

    persistTabs();
  }

  function applyTabState(t) {
    isCounter.value = !!t.isCounter;
    cartItems.value = Array.isArray(t.cartItems) ? t.cartItems.map((x) => ({ ...x })) : [];
    selectedKh.value = t.selectedKh || null;

    diaChiList.value = Array.isArray(t.diaChiList) ? t.diaChiList.map((x) => ({ ...x })) : [];
    selectedDiaChi.value = t.selectedDiaChi || null;

    autoVoucher.value = t.autoVoucher || null;
    voucherManual.value = t.voucherManual || null;
    voucherCode.value = t.voucherCode || "";

    khachThanhToan.value = Number(t.khachThanhToan || 0) || 0;
    payMethod.value = t.payMethod || "TIEN_MAT";
    payTienMat.value = Number(t.payTienMat || 0) || 0;
    payChuyenKhoan.value = Number(t.payChuyenKhoan || 0) || 0;
    payMaThamChieu.value = (t.payMaThamChieu || "").trim();

    payTienMatText.value = deps.formatNumberText(payTienMat.value);
    payChuyenKhoanText.value = deps.formatNumberText(payChuyenKhoan.value);

    if (t.guest && typeof t.guest === "object") {
      Object.assign(guest, t.guest);
    } else {
      Object.assign(guest, {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      });
    }

    phiVanChuyen.value = Number(t.phiVanChuyen || 0) || 0;
    phiVanChuyenText.value = String(t.phiVanChuyenText || "0");

    if (isCounter.value && selectedKh.value?.id && diaChiList.value.length === 0) {
      loadDiaChiAndPickDefault(selectedKh.value.id);
    }
  }

  function pad3(n) {
    const x = Number(n || 0);
    if (x < 10) return `00${x}`;
    if (x < 100) return `0${x}`;
    return `${x}`;
  }

  function nextHdCode() {
    const key = "ss_pos_hd_seq";
    let seq = parseInt(localStorage.getItem(key) || "1", 10);
    if (!Number.isFinite(seq) || seq <= 0) seq = 1;
    const code = pad3(seq);
    localStorage.setItem(key, String(seq + 1));
    return code;
  }

  function makeEmptyTab(orderNo, hdCode) {
    return {
      id: Date.now() + Math.random(),
      orderNo,
      hdCode,
      name: `Đơn hàng ${orderNo} - HD-${hdCode}`,
      hoaDonId: null,

      isCounter: false,
      cartItems: [],
      selectedKh: null,
      diaChiList: [],
      selectedDiaChi: null,
      autoVoucher: null,
      voucherManual: null,
      voucherCode: "",
      khachThanhToan: 0,

      payMethod: "TIEN_MAT",
      payTienMat: 0,
      payChuyenKhoan: 0,
      payMaThamChieu: "",

      guest: {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      },

      phiVanChuyen: 0,
      phiVanChuyenText: "0",
    };
  }

  function resetPageState() {
    tabs.value = [];
    activeTab.value = 0;

    isCounter.value = false;
    cartItems.value = [];

    selectedKh.value = null;
    diaChiList.value = [];
    selectedDiaChi.value = null;

    autoVoucher.value = null;
    voucherManual.value = null;
    voucherCode.value = "";

    khachThanhToan.value = 0;
    payMethod.value = "TIEN_MAT";
    payTienMat.value = 0;
    payChuyenKhoan.value = 0;
    payMaThamChieu.value = "";
    payTienMatText.value = "";
    payChuyenKhoanText.value = "";

    Object.assign(guest, {
      tenKhachHang: "",
      soDienThoai: "",
      diaChiCuThe: "",
      tinhThanh: "",
      huyenQuan: "",
      xaPhuong: "",
    });

    phiVanChuyen.value = 0;
    phiVanChuyenText.value = "0";
  }

  function tabItemCount(t) {
    const items = Array.isArray(t?.cartItems) ? t.cartItems : [];
    return items.reduce((sum, it) => sum + Math.max(0, Number(it?.qty || 0)), 0);
  }

  async function switchTab(idx) {
    if (idx === activeTab.value) return;
    persistActiveTab();

    activeTab.value = idx;
    applyTabState(tabs.value[idx]);
    persistTabs();

    await ensureBaseQtyIfCartHasItems();
    await capNhatDotGiamGiaChoGioHang();
    scheduleAutoVoucher();
    scheduleSyncHoaDon();
  }

  function createOrderTab() {
    if (tabs.value.length >= maxOrderTabs.value) {
      showToast(`Chỉ được tạo tối đa ${maxOrderTabs.value} đơn để tránh spam.`, "error");
      return;
    }

    persistActiveTab();

    const n = tabs.value.length + 1;
    const hdCode = nextHdCode();
    const tab = makeEmptyTab(n, hdCode);

    tabs.value.push(tab);
    activeTab.value = tabs.value.length - 1;
    applyTabState(tab);
    persistTabs();

    showToast(`Đã tạo đơn hàng: HD-${hdCode}`, "success");

    scheduleSyncHoaDon();
    scheduleAutoVoucher();
  }

  async function closeTab(idx) {
    persistActiveTab();

    const tab = tabs.value[idx];
    const hasItems = Array.isArray(tab?.cartItems) && tab.cartItems.length > 0;

    if (hasItems) {
      const ok = window.confirm(
        "Đơn hàng đang có sản phẩm. Bạn có chắc muốn hủy đơn này không? (Hệ thống sẽ hoàn lại tồn kho)",
      );
      if (!ok) return;
    }

    const items = Array.isArray(tab?.cartItems) ? tab.cartItems : [];
    for (const it of items) {
      const qty = Math.max(0, Number(it?.qty || 0));
      if (qty > 0) capNhatTonLocal(it?.id, qty);
    }

    const hdId = tab?.hoaDonId;
    if (hdId) {
      try {
        await apiClient.delete(`/api/admin/hoa-don/${hdId}/reset`);
      } catch (e) {
        try {
          await apiClient.delete(`/api/admin/hoa-don/${hdId}`);
        } catch (e2) {}
      }
    }

    const wasActive = idx === activeTab.value;
    tabs.value.splice(idx, 1);

    tabs.value = tabs.value.map((t, i) => ({
      ...t,
      orderNo: i + 1,
      name: `Đơn hàng ${i + 1} - HD-${t.hdCode}`,
    }));

    if (tabs.value.length === 0) {
      resetPageState();
      persistTabs();
      return;
    }

    if (wasActive) activeTab.value = idx > 0 ? idx - 1 : 0;
    else if (idx < activeTab.value) activeTab.value = Math.max(0, activeTab.value - 1);

    if (activeTab.value >= tabs.value.length) activeTab.value = tabs.value.length - 1;

    applyTabState(tabs.value[activeTab.value]);
    persistTabs();
    scheduleAutoVoucher();
    scheduleSyncHoaDon();
  }

  // ======= AUTO CLEAR 0H + STORAGE SYNC =======
  function getTodayKeyLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function clearPosTabsLocal(reason = "") {
    try {
      localStorage.removeItem("ss_pos_tabs");
      localStorage.removeItem("ss_pos_active_tab");
      localStorage.removeItem("ss_pos_hd_seq");
    } catch (e) {}

    try {
      xoaTonKhoLocal();
    } catch (e) {}

    resetPageState();
    persistTabs();

    // đóng modal nếu đang mở
    dongTatCaModal();

    showToast(reason || "Đã sang ngày mới, hệ thống tự động làm mới màn bán hàng.", "info");
  }

  function checkNewDayAndClearIfNeeded() {
    const key = "ss_pos_day";
    const today = getTodayKeyLocal();
    const last = localStorage.getItem(key);

    if (!last) {
      localStorage.setItem(key, today);
      lastDayKey.value = today;
      return;
    }

    if (last !== today) {
      localStorage.setItem(key, today);
      lastDayKey.value = today;
      clearPosTabsLocal("Đã sang ngày mới, hệ thống đã xoá các hoá đơn chờ và làm mới tabs.");
      return;
    }

    lastDayKey.value = today;
  }

  function scheduleClearAtNextMidnight() {
    if (midnightTimer.value) clearTimeout(midnightTimer.value);
    if (midnightInterval.value) clearInterval(midnightInterval.value);

    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);

    let ms = next.getTime() - now.getTime();
    if (!Number.isFinite(ms) || ms < 0) ms = 5_000;

    midnightTimer.value = setTimeout(() => {
      checkNewDayAndClearIfNeeded();
      scheduleClearAtNextMidnight();
    }, ms + 500);

    midnightInterval.value = setInterval(() => {
      checkNewDayAndClearIfNeeded();
    }, 30_000);
  }

  function onStorageSync(e) {
    if (!e) return;
    if (e.key === "ss_pos_tabs" || e.key === "ss_pos_active_tab" || e.key === "ss_pos_day") {
      checkNewDayAndClearIfNeeded();

      const savedTabs = safeParse(localStorage.getItem("ss_pos_tabs") || "[]", []);
      if (Array.isArray(savedTabs) && savedTabs.length > 0) {
        tabs.value = savedTabs;
        activeTab.value = Number(localStorage.getItem("ss_pos_active_tab") || "0");
        if (activeTab.value < 0 || activeTab.value >= tabs.value.length) activeTab.value = 0;
        applyTabState(tabs.value[activeTab.value]);
      } else {
        resetPageState();
        persistTabs();
      }
    }
  }

  function safeParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  function khoiPhucTabsTuLocal() {
    const savedTabs = safeParse(localStorage.getItem("ss_pos_tabs") || "[]", []);
    if (Array.isArray(savedTabs) && savedTabs.length > 0) {
      tabs.value = savedTabs;
      activeTab.value = Number(localStorage.getItem("ss_pos_active_tab") || "0");
      if (activeTab.value < 0 || activeTab.value >= tabs.value.length) activeTab.value = 0;
      applyTabState(tabs.value[activeTab.value]);
    } else {
      resetPageState();
      persistTabs();
    }
  }

  function khoiTaoAutoClearVaSyncStorage() {
    checkNewDayAndClearIfNeeded();
    scheduleClearAtNextMidnight();
    window.addEventListener("storage", onStorageSync);
  }

  onBeforeUnmount(() => {
    try {
      if (midnightTimer.value) clearTimeout(midnightTimer.value);
      if (midnightInterval.value) clearInterval(midnightInterval.value);
    } catch (e) {}
    window.removeEventListener("storage", onStorageSync);
  });

  return {
    maxOrderTabs,
    tabs,
    activeTab,

    persistTabs,
    persistActiveTab,
    applyTabState,

    tabItemCount,
    switchTab,
    createOrderTab,
    closeTab,

    khoiPhucTabsTuLocal,
    khoiTaoAutoClearVaSyncStorage,
    checkNewDayAndClearIfNeeded,
  };
}