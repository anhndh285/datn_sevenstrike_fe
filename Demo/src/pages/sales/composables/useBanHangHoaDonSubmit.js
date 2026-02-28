// File: src/pages/sales/composables/useBanHangHoaDonSubmit.js
import { onBeforeUnmount, ref } from "vue";

export function useBanHangHoaDonSubmit(deps) {
  const {
    apiClient,
    router,

    tabs,
    activeTab,

    isCounter,
    cartItems,

    selectedKh,
    selectedDiaChi,
    diaChiList,
    guest,

    nguoiBan,

    effectiveVoucher,
    phiVanChuyenNum,
    tongTienHang,
    tongPhaiTra,

    ctspList,
    loadCtspForPos,
    ensureBaseQtyIfCartHasItems,
    capNhatDotGiamGiaChoGioHang,

    scheduleAutoVoucher,
    persistActiveTab,
    persistTabs,
    applyTabState,

    showToast,
  } = deps;

  const submitting = ref(false);

  const syncingHoaDon = ref(false);
  const syncHdTimer = ref(null);

  const showSubmitConfirmModal = ref(false);

  function getActiveTabObj() {
    return tabs.value?.[activeTab.value] || null;
  }

  function getHttpStatus(err) {
    return err?.response?.status ?? null;
  }

  function is404(err) {
    return Number(getHttpStatus(err)) === 404;
  }

  function resetHoaDonIdTrongTabDangChon(reason = "") {
    const t = getActiveTabObj();
    if (!t) return false;

    if (t.hoaDonId == null) return false;

    t.hoaDonId = null;
    persistTabs();

    if (reason) showToast(reason, "info");
    return true;
  }

  function buildEmptyTabState() {
    return {
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

  // ✅ FIX: xác nhận xong => ẨN TAB (remove khỏi tabs + localStorage)
  function anTabDaHoanTatSauSubmit() {
    try {
      const idx = Number(activeTab.value || 0);

      if (!Array.isArray(tabs.value) || tabs.value.length === 0) {
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
        return;
      }

      if (!Number.isFinite(idx) || idx < 0 || idx >= tabs.value.length) {
        tabs.value = [];
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
        return;
      }

      tabs.value.splice(idx, 1);

      tabs.value = (tabs.value || []).map((t, i) => ({
        ...t,
        orderNo: i + 1,
        name: `Đơn hàng ${i + 1} - HD-${t.hdCode}`,
      }));

      if (tabs.value.length === 0) {
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
        return;
      }

      activeTab.value = idx >= tabs.value.length ? tabs.value.length - 1 : idx;
      applyTabState(tabs.value[activeTab.value]);
      persistTabs();
      scheduleAutoVoucher();
    } catch (e) {
      try {
        tabs.value = [];
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
      } catch (e2) {}
    }
  }

  async function ensureHoaDonChoTab() {
    const t = getActiveTabObj();
    if (!t) throw new Error("NO_TAB");
    if (t.hoaDonId) return t.hoaDonId;

    const isShipping = isCounter.value === true;

    const tenKhachHang = isShipping
      ? selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : guest.tenKhachHang || "Khách vãng lai"
      : selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : "Khách lẻ";

    const soDienThoaiKhachHang =
      (isShipping
        ? selectedKh.value
          ? deps.getKhPhone(selectedKh.value)
          : guest.soDienThoai
        : selectedKh.value
          ? deps.getKhPhone(selectedKh.value)
          : "0000000000") || "0000000000";

    const diaChiKhachHang = isShipping
      ? selectedKh.value
        ? selectedDiaChi.value
          ? deps.renderDiaChi(selectedDiaChi.value)
          : "Chờ cập nhật"
        : "Chờ cập nhật"
      : "Tại quầy";

    const payload = {
      idKhachHang: selectedKh.value?.id || null,
      idNhanVien: nguoiBan.value?.id ?? null,

      idPhieuGiamGia: effectiveVoucher.value?.id || null,
      idPhieuGiamGiaCaNhan: effectiveVoucher.value?.__pggcnId || null,

      loaiDon: isShipping ? 1 : 0,
      phiVanChuyen: Math.round(isShipping ? phiVanChuyenNum.value : 0),

      tongTien: 0,
      tongTienSauGiam: 0,

      tenKhachHang:
        (tenKhachHang || "").trim() ||
        (isShipping ? "Khách vãng lai" : "Khách lẻ"),
      soDienThoaiKhachHang:
        String(soDienThoaiKhachHang || "").replace(/\D/g, "") || "0000000000",
      diaChiKhachHang:
        diaChiKhachHang || (isShipping ? "Chờ cập nhật" : "Tại quầy"),
      emailKhachHang: selectedKh.value
        ? deps.getKhEmail(selectedKh.value) || null
        : null,

      ghiChu: "Hóa đơn chờ POS",
    };

    const res = await apiClient.post("/api/admin/hoa-don", payload);
    const id = res?.data?.id;
    if (!id) throw new Error("CREATE_HD_FAIL");

    t.hoaDonId = id;
    persistTabs();

    return id;
  }

  function buildThongTinHoaDonPayload() {
    const isShipping = isCounter.value === true;
    const loaiDon = isShipping ? 1 : 0;

    let tenKh = isShipping
      ? selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : guest.tenKhachHang || "Khách vãng lai"
      : selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : "Khách lẻ";

    tenKh = (tenKh || "").trim() || (isShipping ? "Khách vãng lai" : "Khách lẻ");

    const sdtDigits = selectedKh.value
      ? String(deps.getKhPhone(selectedKh.value) || "").replace(/\D/g, "")
      : String(guest.soDienThoai || "").replace(/\D/g, "");

    const soDienThoai = sdtDigits || "0000000000";

    let diaChi = isShipping ? "" : "Tại quầy";
    if (isShipping) {
      if (selectedKh.value)
        diaChi = selectedDiaChi.value ? deps.renderDiaChi(selectedDiaChi.value) : "";
      else {
        const parts = [
          guest.diaChiCuThe,
          guest.xaPhuong,
          guest.huyenQuan,
          guest.tinhThanh,
        ].filter((x) => String(x || "").trim());
        diaChi = parts.join(", ");
      }
      diaChi = diaChi || "Chờ cập nhật";
    }

    return {
      idKhachHang: selectedKh.value?.id || null,
      idNhanVien: nguoiBan.value?.id ?? null,

      idPhieuGiamGia: effectiveVoucher.value?.id || null,
      idPhieuGiamGiaCaNhan: effectiveVoucher.value?.__pggcnId || null,

      loaiDon,
      phiVanChuyen: Math.round(isShipping ? phiVanChuyenNum.value : 0),

      tongTien: Math.round(
        tongTienHang.value + (isShipping ? phiVanChuyenNum.value : 0),
      ),
      tongTienSauGiam: Math.round(tongPhaiTra.value),

      tenKhachHang: tenKh,
      soDienThoaiKhachHang: soDienThoai,
      diaChiKhachHang: diaChi,
      emailKhachHang: selectedKh.value
        ? deps.getKhEmail(selectedKh.value) || null
        : null,
      ghiChu: null,
    };
  }

  function buildChiTietSnapshotPayload(idHoaDon) {
    return (cartItems.value || []).map((it) => ({
      idHoaDon,
      idChiTietSanPham: it.id,
      soLuong: Number(it.qty || 1),
      ghiChu: null,
      xoaMem: false,
    }));
  }

  async function reloadCartFromDb(idHoaDon) {
    try {
      const res = await apiClient.get(`/api/admin/hoa-don/${idHoaDon}`);
      const hd = res?.data || null;
      const list = Array.isArray(hd?.chiTietHoaDon) ? hd.chiTietHoaDon : [];

      const out = list
        .map((x) => {
          const ctspId = x?.idChiTietSanPham ?? null;
          const found =
            ctspId != null
              ? ctspList.value.find((k) => Number(k?.id) === Number(ctspId))
              : null;

          return {
            id: ctspId,
            maCtsp: x?.maChiTietSanPham || found?.maCtsp || "",
            tenSanPham: x?.tenSanPham || found?.tenSanPham || "",
            mauSac: x?.mauSac || found?.mauSac || "",
            kichCo: x?.kichCo || found?.kichCo || "",
            giaGoc: found?.giaGoc ?? 0,
            giaBan: found?.giaBan ?? (Number(x?.donGia || 0) || 0),
            phanTramGiam: found?.phanTramGiam ?? 0,
            idDotGiamGia: found?.idDotGiamGia ?? null,
            maDotGiamGia: found?.maDotGiamGia ?? null,
            tenDotGiamGia: found?.tenDotGiamGia ?? null,
            anhUrl: found?.anhUrl ?? null,
            qty: Number(x?.soLuong || 1),
            checked: true,
          };
        })
        .filter((x) => x.id != null);

      cartItems.value = out;

      await ensureBaseQtyIfCartHasItems();
      await capNhatDotGiamGiaChoGioHang();
      scheduleAutoVoucher();
      persistActiveTab();
    } catch (e) {}
  }

  async function syncHoaDonToDb(opts = {}) {
    const silent = !!opts.silent;
    const t = getActiveTabObj();
    if (!t) return;

    if (syncingHoaDon.value) return;
    syncingHoaDon.value = true;

    try {
      const idHoaDon = await ensureHoaDonChoTab();

      await apiClient.put(
        `/api/admin/hoa-don/${idHoaDon}/thong-tin`,
        buildThongTinHoaDonPayload(),
      );

      await apiClient.post(
        `/api/admin/hoa-don/${idHoaDon}/chi-tiet`,
        buildChiTietSnapshotPayload(idHoaDon),
      );

      return true;
    } catch (e) {
      if (is404(e)) {
        const daReset = resetHoaDonIdTrongTabDangChon(
          silent ? "" : "Hóa đơn chờ không còn tồn tại, hệ thống sẽ tạo lại.",
        );

        if (daReset) {
          try {
            const newId = await ensureHoaDonChoTab();

            await apiClient.put(
              `/api/admin/hoa-don/${newId}/thong-tin`,
              buildThongTinHoaDonPayload(),
            );

            await apiClient.post(
              `/api/admin/hoa-don/${newId}/chi-tiet`,
              buildChiTietSnapshotPayload(newId),
            );

            return true;
          } catch (eRetry) {
            if (!silent) {
              const msg =
                eRetry?.response?.data?.message ||
                "Không đồng bộ được hoá đơn với DB.";
              showToast(msg, "error");
            }
            if (!silent) throw eRetry;
            return false;
          } finally {
            syncingHoaDon.value = false;
          }
        }
      }

      if (!silent) {
        const msg =
          e?.response?.data?.message || "Không đồng bộ được hoá đơn với DB.";
        showToast(msg, "error");
      }

      try {
        const idHoaDon = t?.hoaDonId;
        if (idHoaDon) {
          await loadCtspForPos();
          await reloadCartFromDb(idHoaDon);
        }
      } catch (e2) {}

      if (!silent) throw e;
      return false;
    } finally {
      syncingHoaDon.value = false;
    }
  }

  function scheduleSyncHoaDon() {
    // ✅ FIX: đang submit thì không schedule sync nữa (tránh snapshot rỗng sau confirm)
    if (submitting.value) return;

    if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
    syncHdTimer.value = setTimeout(() => {
      if (submitting.value) return;
      syncHoaDonToDb({ silent: true }).catch(() => {});
    }, 200);
  }

  function openSubmitConfirm(canSubmit) {
    if (!canSubmit.value) return;
    deps.blurActive();
    showSubmitConfirmModal.value = true;
  }

  function closeSubmitConfirm() {
    deps.blurActive();
    showSubmitConfirmModal.value = false;
  }

  async function confirmSubmitOrder(submitOrder) {
    deps.blurActive();
    showSubmitConfirmModal.value = false;
    await submitOrder();
  }

  function goToHoaDon(created) {
    const id = created?.id;
    try {
      if (id != null) router.push(`/admin/hoa-don/${id}`);
      else router.push(`/admin/hoa-don`);
    } catch (e) {
      try {
        router.push(`/admin/hoa-don`);
      } catch (e2) {}
    }
  }

  // ✅ build body thanh toán cho đơn giao hàng/online
  function buildBodyThanhToanGiaoHang(pay) {
    const total = Number(tongPhaiTra.value || 0);
    const tm = Number(pay.payTienMatNum.value || 0);
    const ck = Number(pay.payChuyenKhoanNum.value || 0);

    const noteBase = "Xác nhận thanh toán đơn giao hàng";

    // ưu tiên theo số tiền đã nhập (không lệ thuộc payMethod)
    if (tm > 0 && ck > 0) {
      if (Number(tm + ck) !== Number(total)) {
        return { error: "Kết hợp: tổng tiền mặt + chuyển khoản phải đúng bằng tổng phải trả." };
      }
      return {
        ghiChu: noteBase,
        thanhToans: [
          { tenPhuongThuc: "Tiền mặt", soTien: tm },
          {
            tenPhuongThuc: "Chuyển khoản",
            soTien: ck,
            maThamChieu: (pay.payMaThamChieu.value || "").trim() || null,
          },
        ],
      };
    }

    if (ck > 0 && tm <= 0) {
      if (Number(ck) !== Number(total)) {
        return { error: "Chuyển khoản: số tiền phải đúng bằng tổng phải trả." };
      }
      return {
        ghiChu: noteBase,
        thanhToans: [
          {
            tenPhuongThuc: "Chuyển khoản",
            soTien: ck,
            maThamChieu: (pay.payMaThamChieu.value || "").trim() || null,
          },
        ],
      };
    }

    // tiền mặt: khách có thể đưa dư, nhưng ghi nhận giao dịch = tổng phải trả
    return {
      ghiChu: noteBase,
      thanhToans: [{ tenPhuongThuc: "Tiền mặt", soTien: total }],
    };
  }

  async function submitOrder(canSubmit, pay) {
    if (!canSubmit.value) return;

    // ✅ FIX: hủy timer sync đang treo trước khi chốt
    if (syncHdTimer.value) clearTimeout(syncHdTimer.value);

    for (const it of cartItems.value) {
      const qty = Number(it.qty || 0);
      if (!Number.isFinite(qty) || qty < 1) {
        showToast("Số lượng mua không hợp lệ.", "error");
        return;
      }

      const max = deps.getMaxQtyForItem(it);
      if (qty > max) {
        showToast(`Sản phẩm ${it.maCtsp || ""} vượt tồn kho.`, "error");
        it.qty = Math.max(1, max);
        return;
      }
    }

    submitting.value = true;
    try {
      const idHoaDon = await ensureHoaDonChoTab();
      await syncHoaDonToDb({ silent: false });

      // =====================
      // TẠI QUẦY
      // =====================
      if (!isCounter.value) {
        const noteBase = "Chốt đơn tại quầy";

        if (pay.payMethod.value === "KET_HOP") {
          if (Number(pay.khachThanhToan.value || 0) !== Number(tongPhaiTra.value || 0)) {
            showToast("Kết hợp: tổng tiền mặt + chuyển khoản phải đúng bằng tổng phải trả.", "error");
            pay.openPayModal();
            return;
          }

          const body = {
            ghiChu: noteBase,
            thanhToans: [
              ...(pay.payTienMatNum.value > 0
                ? [{ tenPhuongThuc: "Tiền mặt", soTien: pay.payTienMatNum.value }]
                : []),
              ...(pay.payChuyenKhoanNum.value > 0
                ? [
                    {
                      tenPhuongThuc: "Chuyển khoản",
                      soTien: pay.payChuyenKhoanNum.value,
                      maThamChieu: (pay.payMaThamChieu.value || "").trim() || null,
                    },
                  ]
                : []),
            ],
          };

          const done = await apiClient.put(
            `/api/admin/hoa-don/${idHoaDon}/confirm-tai-quay-ket-hop`,
            body,
          );
          const finalHd = done?.data || { id: idHoaDon };

          showToast("Đã chốt đơn tại quầy.", "success");
          goToHoaDon(finalHd);

          if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
          anTabDaHoanTatSauSubmit();
          return;
        }

        if (pay.payMethod.value === "CHUYEN_KHOAN") {
          if (Number(pay.khachThanhToan.value || 0) !== Number(tongPhaiTra.value || 0)) {
            showToast("Chuyển khoản: số tiền phải đúng bằng tổng phải trả.", "error");
            pay.openPayModal();
            return;
          }

          const done = await apiClient.put(
            `/api/admin/hoa-don/${idHoaDon}/confirm-tai-quay-chuyen-khoan`,
            { ghiChu: "Chốt đơn tại quầy - chuyển khoản" },
          );
          const finalHd = done?.data || { id: idHoaDon };

          showToast("Đã chốt đơn tại quầy.", "success");
          goToHoaDon(finalHd);

          if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
          anTabDaHoanTatSauSubmit();
          return;
        }

        if (Number(pay.khachThanhToan.value || 0) < Number(tongPhaiTra.value || 0)) {
          showToast("Tiền mặt: khách thanh toán chưa đủ.", "error");
          pay.openPayModal();
          return;
        }

        const done = await apiClient.put(
          `/api/admin/hoa-don/${idHoaDon}/confirm-tai-quay-tien-mat`,
          { ghiChu: "Chốt đơn tại quầy - tiền mặt" },
        );
        const finalHd = done?.data || { id: idHoaDon };

        showToast("Đã chốt đơn tại quầy.", "success");
        goToHoaDon(finalHd);

        if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
        anTabDaHoanTatSauSubmit();
        return;
      }

      // =====================
      // ✅ GIAO HÀNG: PHẢI GHI NHẬN THANH TOÁN -> TẠO giao_dich_thanh_toan
      // =====================
      const payNum = Number(pay.khachThanhToan.value || 0);
      const total = Number(tongPhaiTra.value || 0);

      if (!Number.isFinite(payNum) || payNum <= 0) {
        showToast("Vui lòng nhập thanh toán trước khi xác nhận.", "error");
        pay.openPayModal();
        return;
      }

      const bodyGiaoHang = buildBodyThanhToanGiaoHang(pay);
      if (bodyGiaoHang?.error) {
        showToast(bodyGiaoHang.error, "error");
        pay.openPayModal();
        return;
      }

      // tiền mặt có thể dư, còn CK/kết hợp phải đúng tổng
      if (Number(pay.payChuyenKhoanNum.value || 0) > 0 || Number(pay.payTienMatNum.value || 0) > 0) {
        const tm = Number(pay.payTienMatNum.value || 0);
        const ck = Number(pay.payChuyenKhoanNum.value || 0);
        if (ck > 0 && tm === 0 && ck !== total) {
          showToast("Chuyển khoản: số tiền phải đúng bằng tổng phải trả.", "error");
          pay.openPayModal();
          return;
        }
        if (ck > 0 && tm > 0 && (tm + ck) !== total) {
          showToast("Kết hợp: tổng tiền mặt + chuyển khoản phải đúng bằng tổng phải trả.", "error");
          pay.openPayModal();
          return;
        }
      }

      const doneShip = await apiClient.put(
        `/api/admin/hoa-don/${idHoaDon}/confirm-giao-hang-ket-hop`,
        bodyGiaoHang,
      );
      const finalHdShip = doneShip?.data || { id: idHoaDon };

      showToast("Đã lưu đơn giao hàng và ghi nhận thanh toán.", "success");
      goToHoaDon(finalHdShip);

      if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
      anTabDaHoanTatSauSubmit();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "Xác nhận đơn thất bại. Vui lòng kiểm tra lại.";
      showToast(msg, "error");
    } finally {
      submitting.value = false;
    }
  }

  onBeforeUnmount(() => {
    try {
      if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
    } catch (e) {}
  });

  return {
    submitting,
    syncingHoaDon,
    showSubmitConfirmModal,

    ensureHoaDonChoTab,
    syncHoaDonToDb,
    scheduleSyncHoaDon,

    openSubmitConfirm,
    closeSubmitConfirm,
    confirmSubmitOrder,

    submitOrder,
  };
}