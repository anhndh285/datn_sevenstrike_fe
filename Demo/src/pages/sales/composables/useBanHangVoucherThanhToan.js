// File: src/pages/sales/composables/useBanHangVoucherThanhToan.js
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";

export function useBanHangVoucherThanhToan(deps) {
  const {
    SalesService,
    isCounter,
    selectedKh,
    tongTienHang,
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

  const showBetterVoucherModal = ref(false);
  const betterVoucherCandidate = ref(null);
  const betterVoucherCurrentDiscount = ref(0);
  const betterVoucherNewDiscount = ref(0);

  const betterVoucherModalTitleText = ref("Có phiếu giảm giá mới");
  const betterVoucherQuestionText = ref("Bạn có muốn áp dụng phiếu giảm giá mới không?");

  const voucherPinned = ref(null);
  const voucherSuggest = ref(null);

  const dangHoiVoucherMoi = ref(false);
  const declinedBetterKey = ref("");

  function isVoucherPercent(v) {
    if (!v) return true;

    const raw = v.loaiPhieuGiamGia;

    if (raw === false || raw === 0 || raw === "0") return true;
    if (raw === true || raw === 1 || raw === "1") return false;

    const s = String(raw ?? "").trim().toLowerCase();
    if (s === "false" || s === "0" || s === "percent" || s === "phan_tram" || s === "%") return true;
    if (s === "true" || s === "1" || s === "money" || s === "tien" || s === "amount") return false;

    const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);
    if (Number.isFinite(giaTri) && giaTri > 100) return false;
    return true;
  }

  function normalizeVoucherPercent(raw) {
    let n = Number(raw ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
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

  function getSoLuongConLai(v) {
    const raw =
      v?.soLuongSuDung ??
      v?.soLuong ??
      v?.soLuongConLai ??
      v?.soLuotSuDungConLai ??
      v?.conLai ??
      null;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function isTrangThaiActive(v) {
    const t = v?.trangThai;
    if (t === undefined || t === null) return true;
    if (t === false || t === 0 || t === "0") return false;
    return true;
  }

  function voucherCodeOf(v) {
    return String(v?.maPhieuGiamGia || v?.ma || v?.code || "").trim();
  }

  function voucherKeyOf(v) {
    if (!v) return "";
    const id = v?.id ?? "";
    const code = voucherCodeOf(v);
    const p = v?.__pggcnId ?? "";
    return `${id}|${p}|${code}`;
  }

  function makeBetterKey(candidate, tong) {
    const k = voucherKeyOf(candidate);
    const d = calcVoucherDiscount(candidate, tong);
    return `${k}|${Math.round(Number(tong || 0))}|${Math.round(Number(d || 0))}`;
  }

  function calcVoucherDiscount(v, tongTien) {
    const tong = Number(tongTien || 0);
    if (!v || tong <= 0) return 0;

    if (v.xoaMem === true) return 0;
    if (!isTrangThaiActive(v)) return 0;

    const remain = getSoLuongConLai(v);
    if (remain != null && remain <= 0) return 0;

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

  function normalizePersonalList(personal) {
    if (!Array.isArray(personal) || !personal.length) return [];
    return personal
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
  }

  function buildFingerprint(list) {
    const arr = Array.isArray(list) ? list : [];
    return arr
      .map((v) => {
        const id = v?.id ?? "";
        const p = v?.__pggcnId ?? "";
        const code = voucherCodeOf(v);
        const loai = v?.loaiPhieuGiamGia ?? "";
        const giaTri = Number(v?.giaTriGiamGia ?? v?.giaTriGiam ?? 0);
        const cap = Number(v?.soTienGiamToiDa ?? 0);
        const min = Number(v?.hoaDonToiThieu ?? v?.hoaDonToiThieuTien ?? 0);
        const start = toYmd(v?.ngayBatDau) || "";
        const end = toYmd(v?.ngayKetThuc) || "";
        const trangThai = v?.trangThai ?? "";
        const remain = getSoLuongConLai(v) ?? "";
        const xoaMem = v?.xoaMem ?? "";
        return `${id}|${p}|${code}|${loai}|${giaTri}|${cap}|${min}|${start}|${end}|${trangThai}|${remain}|${xoaMem}`;
      })
      .sort()
      .join("~");
  }

  function getFpStorageKey(khId) {
    const k = khId ? String(khId) : "0";
    return `ss_pos_voucher_fp_${k}`;
  }

  function readFpFromStorage(khId) {
    try {
      return localStorage.getItem(getFpStorageKey(khId)) || "";
    } catch (e) {
      return "";
    }
  }

  function writeFpToStorage(khId, fp) {
    try {
      localStorage.setItem(getFpStorageKey(khId), fp || "");
    } catch (e) {}
  }

  function clearVoucherDangApDung() {
    voucherManual.value = null;
    autoVoucher.value = null;
    voucherCode.value = "";
    voucherPinned.value = null;
    declinedBetterKey.value = "";
  }

  function apDungVoucherTuDong(best) {
    voucherManual.value = null;
    autoVoucher.value = best || null;
    voucherCode.value = "";
    voucherPinned.value = null;
  }

  function thongBaoVoucherBiNgungHoatDong(best) {
    showToast("Phiếu giảm giá hiện tại đã ngừng hoạt động, hệ thống đang tự động tìm phiếu giảm giá tốt nhất.", "info");

    if (best) {
      showToast("Đã tự động áp dụng phiếu giảm giá tốt nhất.", "success");
    } else {
      showToast("Phiếu giảm giá đã bị gỡ, hiện không còn phiếu phù hợp.", "info");
    }
  }

  async function loadPublicVouchers(force = false) {
    const now = Date.now();
    if (!force && voucherCache.loadedAt && now - voucherCache.loadedAt < 60_000 && Array.isArray(voucherCache.all)) {
      return;
    }
    const data = await SalesService.getVouchersPublic().catch(() => []);
    voucherCache.all = Array.isArray(data) ? data : [];
    voucherCache.loadedAt = now;
  }

  async function loadPersonalVouchers(khachHangId, force = false) {
    const now = Date.now();
    if (!khachHangId) {
      voucherCache.personal = [];
      voucherCache.personalKhId = null;
      voucherCache.loadedAtPersonal = now;
      return [];
    }

    if (
      !force &&
      voucherCache.loadedAtPersonal &&
      now - voucherCache.loadedAtPersonal < 30_000 &&
      Array.isArray(voucherCache.personal) &&
      voucherCache.personalKhId === khachHangId
    ) {
      return voucherCache.personal;
    }

    const data = await SalesService.getVouchersPersonalByKhachHangId(khachHangId).catch(() => []);
    voucherCache.personal = Array.isArray(data) ? data : [];
    voucherCache.personalKhId = khachHangId;
    voucherCache.loadedAtPersonal = now;
    return voucherCache.personal;
  }

  async function getCandidates({ force = false } = {}) {
    await loadPublicVouchers(force);

    const all = Array.isArray(voucherCache.all) ? voucherCache.all : [];
    let candidates = [...all];

    const khId = selectedKh.value?.id || null;
    if (khId) {
      const personal = await loadPersonalVouchers(khId, force);
      const normalized = normalizePersonalList(personal);
      if (normalized.length) candidates = candidates.concat(normalized);
    }

    return candidates;
  }

  function updateVoucherSuggest(candidates, tong, currentDiscount) {
    try {
      voucherSuggest.value = null;
      if (!Array.isArray(candidates) || !candidates.length) return;
      if (!Number.isFinite(tong) || tong <= 0) return;

      let best = null;

      for (const v of candidates) {
        const min = Number(v.hoaDonToiThieu ?? v.hoaDonToiThieuTien ?? 0);
        if (!Number.isFinite(min) || min <= 0) continue;
        if (tong >= min) continue;

        const canThem = Math.max(0, Math.round(min - tong));
        if (canThem <= 0) continue;

        const discAtMin = calcVoucherDiscount(v, min);
        if (discAtMin <= 0) continue;

        const giamThem = Math.max(0, discAtMin - Math.max(0, currentDiscount || 0));
        if (giamThem <= 0) continue;

        const candidate = { soTienCanThem: canThem, giamThemDuKien: giamThem, voucher: v };

        if (
          !best ||
          candidate.giamThemDuKien > best.giamThemDuKien ||
          (candidate.giamThemDuKien === best.giamThemDuKien && candidate.soTienCanThem < best.soTienCanThem)
        ) {
          best = candidate;
        }
      }

      voucherSuggest.value = best;
    } catch (e) {
      voucherSuggest.value = null;
    }
  }

  function moModalVoucherTotHon(best, curDiscount, bestDiscount) {
    try {
      const tong = Math.round(Number(tongTienHang.value || 0));
      const key = makeBetterKey(best, tong);
      if (declinedBetterKey.value && declinedBetterKey.value === key) return false;

      dangHoiVoucherMoi.value = true;
      betterVoucherCandidate.value = best;
      betterVoucherCurrentDiscount.value = Math.max(0, Math.round(curDiscount));
      betterVoucherNewDiscount.value = Math.max(0, Math.round(bestDiscount));
      showBetterVoucherModal.value = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function refreshVoucherDangApDung(best) {
    try {
      const cur = effectiveVoucher.value;
      if (!cur || !best) return;

      const kCur = voucherKeyOf(cur);
      const kBest = voucherKeyOf(best);
      if (!kCur || kCur !== kBest) return;

      if (voucherManual.value && voucherKeyOf(voucherManual.value) === kBest) {
        const pinned = voucherManual.value?.__pinnedPos === true;
        voucherManual.value = { ...best, __pinnedPos: pinned ? true : undefined };
        return;
      }

      if (autoVoucher.value && voucherKeyOf(autoVoucher.value) === kBest) {
        autoVoucher.value = { ...best };
        return;
      }

      if (voucherManual.value) {
        const pinned = voucherManual.value?.__pinnedPos === true;
        voucherManual.value = { ...best, __pinnedPos: pinned ? true : undefined };
      } else {
        autoVoucher.value = { ...best };
      }
    } catch (e) {}
  }

  async function loadBestVoucher() {
    const tong = Math.round(Number(tongTienHang.value || 0));
    if (tong <= 0) {
      autoVoucher.value = null;
      voucherSuggest.value = null;
      persistActiveTab();
      return;
    }

    if (dangHoiVoucherMoi.value || showBetterVoucherModal.value) {
      try {
        const candidates = await getCandidates({ force: false });
        const cur = effectiveVoucher.value;
        const curDiscount = cur ? calcVoucherDiscount(cur, tong) : 0;
        updateVoucherSuggest(candidates, tong, curDiscount);
      } catch (e) {}
      return;
    }

    loadingVoucher.value = true;
    try {
      const candidates = await getCandidates({ force: false });

      let listChanged = false;
      try {
        const khId = selectedKh.value?.id || null;
        const fpNow = buildFingerprint(candidates) + `|KH=${khId || ""}`;
        const old = readFpFromStorage(khId);
        if (!old) {
          writeFpToStorage(khId, fpNow);
        } else if (old !== fpNow) {
          writeFpToStorage(khId, fpNow);
          listChanged = true;
        }
      } catch (e) {}

      const cur = effectiveVoucher.value;
      const curDiscount = cur ? calcVoucherDiscount(cur, tong) : 0;

      const best = pickBestVoucher(candidates, tong);
      const bestDiscount = best ? calcVoucherDiscount(best, tong) : 0;

      updateVoucherSuggest(candidates, tong, curDiscount);

      if (cur && curDiscount <= 0) {
        clearVoucherDangApDung();
        apDungVoucherTuDong(best || null);
        thongBaoVoucherBiNgungHoatDong(best || null);
        persistActiveTab();
        scheduleSyncHoaDon();
        return;
      }

      if (listChanged && cur && best && bestDiscount > curDiscount) {
        if (voucherKeyOf(best) === voucherKeyOf(cur)) {
          refreshVoucherDangApDung(best);
          showToast("Phiếu giảm giá đang áp dụng vừa được cập nhật.", "info");
          persistActiveTab();
          scheduleSyncHoaDon();
          return;
        }

        const opened = moModalVoucherTotHon(best, curDiscount, bestDiscount);
        if (opened) {
          persistActiveTab();
          return;
        }

        persistActiveTab();
        return;
      }

      if (voucherManual.value) {
        persistActiveTab();
        return;
      }

      autoVoucher.value = best || null;
      persistActiveTab();
    } catch (e) {
      persistActiveTab();
    } finally {
      loadingVoucher.value = false;
    }
  }

  function scheduleAutoVoucher() {
    if (voucherDebounce.value) clearTimeout(voucherDebounce.value);
    voucherDebounce.value = setTimeout(async () => {
      await loadBestVoucher();
    }, 350);
  }

  async function kiemTraVoucherMoiTotHon() {
    if (dangHoiVoucherMoi.value || showBetterVoucherModal.value) return;

    const tong = Math.round(Number(tongTienHang.value || 0));
    if (tong <= 0) return;

    try {
      const khId = selectedKh.value?.id || null;
      const candidates = await getCandidates({ force: true });

      const fp = buildFingerprint(candidates) + `|KH=${khId || ""}`;
      const lastFp = readFpFromStorage(khId);

      if (!lastFp) {
        writeFpToStorage(khId, fp);
        return;
      }

      if (lastFp === fp) return;

      writeFpToStorage(khId, fp);

      const cur = effectiveVoucher.value;
      const best = pickBestVoucher(candidates, tong);

      if (!cur) {
        autoVoucher.value = best || null;
        persistActiveTab();
        return;
      }

      const curDiscount = calcVoucherDiscount(cur, tong);
      const bestDiscount = best ? calcVoucherDiscount(best, tong) : 0;

      updateVoucherSuggest(candidates, tong, curDiscount);

      if (curDiscount <= 0) {
        clearVoucherDangApDung();
        apDungVoucherTuDong(best || null);
        thongBaoVoucherBiNgungHoatDong(best || null);
        persistActiveTab();
        scheduleSyncHoaDon();
        return;
      }

      if (best && voucherKeyOf(best) === voucherKeyOf(cur)) {
        refreshVoucherDangApDung(best);
        showToast("Phiếu giảm giá đang áp dụng vừa được cập nhật.", "info");
        persistActiveTab();
        scheduleSyncHoaDon();
        return;
      }

      if (!best || bestDiscount <= curDiscount) return;

      const key = makeBetterKey(best, tong);
      if (declinedBetterKey.value && declinedBetterKey.value === key) return;

      moModalVoucherTotHon(best, curDiscount, bestDiscount);
    } catch (e) {}
  }

  function boQuaVoucherMoiTotHon() {
    try {
      const tong = Math.round(Number(tongTienHang.value || 0));
      const best = betterVoucherCandidate.value;
      if (best) declinedBetterKey.value = makeBetterKey(best, tong);

      const cur = effectiveVoucher.value;
      if (cur) {
        const pinned = { ...cur, __pinnedPos: true };
        voucherManual.value = pinned;
        autoVoucher.value = null;
        voucherPinned.value = { ...pinned };
      }

      showBetterVoucherModal.value = false;
      betterVoucherCandidate.value = null;
      betterVoucherCurrentDiscount.value = 0;
      betterVoucherNewDiscount.value = 0;
      dangHoiVoucherMoi.value = false;

      persistActiveTab();
      scheduleSyncHoaDon();

      showToast("Đã giữ phiếu giảm giá hiện tại.", "info");
    } catch (e) {
      showBetterVoucherModal.value = false;
      dangHoiVoucherMoi.value = false;
    }
  }

  function apDungVoucherMoiTotHon() {
    try {
      const best = betterVoucherCandidate.value;
      if (!best) {
        showBetterVoucherModal.value = false;
        dangHoiVoucherMoi.value = false;
        return;
      }

      declinedBetterKey.value = "";

      voucherManual.value = null;
      autoVoucher.value = best;
      voucherCode.value = "";
      voucherPinned.value = null;

      showBetterVoucherModal.value = false;
      betterVoucherCandidate.value = null;
      betterVoucherCurrentDiscount.value = 0;
      betterVoucherNewDiscount.value = 0;
      dangHoiVoucherMoi.value = false;

      persistActiveTab();
      scheduleSyncHoaDon();

      showToast("Đã áp dụng phiếu giảm giá mới tốt hơn.", "success");
    } catch (e) {
      showBetterVoucherModal.value = false;
      dangHoiVoucherMoi.value = false;
    }
  }

  async function applyVoucherCode() {
    const code = (voucherCode.value || "").trim();
    if (!code) {
      voucherManual.value = null;
      voucherPinned.value = null;
      showToast("Đã bỏ mã phiếu giảm giá.", "info");
      scheduleAutoVoucher();
      scheduleSyncHoaDon();
      return;
    }

    try {
      const candidates = await getCandidates({ force: true });

      const found = candidates.find((v) => voucherCodeOf(v) === code);
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
      voucherPinned.value = null;

      declinedBetterKey.value = "";
      showToast(`Đã áp dụng mã: ${code}`, "success");

      persistActiveTab();
      scheduleSyncHoaDon();
    } catch (e) {
      voucherManual.value = null;
      showToast("Áp dụng mã thất bại (API đang lỗi).", "error");
    }
  }

  async function refreshVoucherRealtimeTruocKhiXacNhan() {
    const tong = Math.round(Number(tongTienHang.value || 0));
    if (tong <= 0) {
      autoVoucher.value = null;
      voucherManual.value = null;
      voucherPinned.value = null;
      voucherSuggest.value = null;
      persistActiveTab();
      return;
    }

    try {
      const candidates = await getCandidates({ force: true });

      const cur = effectiveVoucher.value;
      const curDiscount = cur ? calcVoucherDiscount(cur, tong) : 0;

      const best = pickBestVoucher(candidates, tong);
      const bestDiscount = best ? calcVoucherDiscount(best, tong) : 0;

      updateVoucherSuggest(candidates, tong, curDiscount);

      if (cur) {
        const foundCur = candidates.find((v) => voucherKeyOf(v) === voucherKeyOf(cur)) || null;
        if (foundCur) refreshVoucherDangApDung(foundCur);
      }

      if (cur && curDiscount <= 0) {
        clearVoucherDangApDung();
        apDungVoucherTuDong(best || null);
        thongBaoVoucherBiNgungHoatDong(best || null);

        persistActiveTab();
        scheduleSyncHoaDon();
        return;
      }

      if (!cur) {
        autoVoucher.value = best || null;
        persistActiveTab();
        scheduleSyncHoaDon();
        return;
      }

      if (voucherManual.value) {
        persistActiveTab();
        return;
      }

      if (!autoVoucher.value && best && bestDiscount > 0) {
        autoVoucher.value = best;
      }

      persistActiveTab();
    } catch (e) {}
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
    if (isVoucherPercent(v)) return `${normalizeVoucherPercent(giaTri)}%`;
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

  const pollTimer = ref(null);

  function startPoll() {
    if (pollTimer.value) return;
    pollTimer.value = setInterval(() => {
      kiemTraVoucherMoiTotHon().catch?.(() => {});
    }, 2500);
  }

  function stopPoll() {
    if (!pollTimer.value) return;
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }

  function onFocus() {
    kiemTraVoucherMoiTotHon().catch?.(() => {});
  }

  function onVisibilityChange() {
    if (document.visibilityState === "visible") kiemTraVoucherMoiTotHon().catch?.(() => {});
  }

  watch(
    () => selectedKh.value?.id || null,
    () => {
      declinedBetterKey.value = "";
      kiemTraVoucherMoiTotHon().catch?.(() => {});
    },
  );

  kiemTraVoucherMoiTotHon().catch?.(() => {});
  startPoll();
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibilityChange);

  onBeforeUnmount(() => {
    try {
      if (voucherDebounce.value) clearTimeout(voucherDebounce.value);
    } catch (e) {}
    try {
      stopPoll();
    } catch (e) {}
    try {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    } catch (e) {}
  });

  return {
    phiVanChuyen,
    phiVanChuyenText,
    phiVanChuyenNum,
    onShipFeeInput,

    voucherCode,
    voucherManual,
    autoVoucher,
    effectiveVoucher,
    loadingVoucher,
    voucherValueText,
    giamGia,
    isVoucherPercent,

    scheduleAutoVoucher,
    loadBestVoucher,
    applyVoucherCode,

    refreshVoucherRealtimeTruocKhiXacNhan,

    voucherSuggest,
    voucherPinned,
    showBetterVoucherModal,
    betterVoucherCandidate,
    betterVoucherCurrentDiscount,
    betterVoucherNewDiscount,

    betterVoucherModalTitleText,
    betterVoucherQuestionText,

    apDungVoucherMoiTotHon,
    boQuaVoucherMoiTotHon,

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

    tongPhaiTra,
  };
}