// File: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Swal from "sweetalert2";

import TrangChuPage from "@/pages/trang_chu/TrangChuPage.vue";
import AdminLayout from "@/views/admin/AdminLayout.vue";
import LoginManager from "@/views/authen_author/LoginManager.vue";

import ProductManagePage from "@/pages/product/ProductManagePage.vue";
import ProductDetailListPage from "@/pages/product/ProductDetailListPage.vue";
import ProductDetailFormPage from "@/pages/product/ProductDetailFormPage.vue";
import ProductFormPage from "@/pages/product/ProductFormPage.vue";

import CoGiayPage from "@/pages/product/thuoc_tinh/CoGiayPage.vue";

// ✅ THUỘC TÍNH (file lẻ, không folder snake_case)
import XuatXuPage from "@/pages/product/thuoc_tinh/XuatXuPage.vue";
import ThuongHieuPage from "@/pages/product/thuoc_tinh/ThuongHieuPage.vue";
import ViTriThiDauPage from "@/pages/product/thuoc_tinh/ViTriThiDauPage.vue";
import PhongCachChoiPage from "@/pages/product/thuoc_tinh/PhongCachChoiPage.vue";
import ChatLieuPage from "@/pages/product/thuoc_tinh/ChatLieuPage.vue";
import MauSacPage from "@/pages/product/thuoc_tinh/MauSacPage.vue";
import KichThuocPage from "@/pages/product/thuoc_tinh/KichThuocPage.vue";
import FormChanPage from "@/pages/product/thuoc_tinh/FormChanPage.vue";
import LoaiSanPage from "@/pages/product/thuoc_tinh/LoaiSanPage.vue";

import DiscountPage from "@/pages/khuyen_mai/dot_giam_gia/DiscountPage.vue";
import AddDiscountPage from "@/pages/khuyen_mai/dot_giam_gia/AddDiscountPage.vue";
import DetailDiscountPage from "@/pages/khuyen_mai/dot_giam_gia/DetailDiscountPage.vue";

// ✅ Phiếu giảm giá
import VoucherManagePage from "@/pages/khuyen_mai/phieu_giam_gia/VoucherManagePage.vue";
import VoucherFormPage from "@/pages/khuyen_mai/phieu_giam_gia/VoucherFormPage.vue";

// ✅ Tài khoản (nhân viên / khách hàng)
import TaiKhoanNhanVienPage from "@/pages/tai_khoan/taikhoan_nhanvien.vue";
import ThemNhanVienPage from "@/pages/tai_khoan/them_nhanvien.vue";
import CapNhatNhanVienPage from "@/pages/tai_khoan/capnhat_nhanvien.vue";

import TaiKhoanKhachHangPage from "@/pages/tai_khoan/taikhoan_khachhang.vue";
import ThemKhachHangPage from "@/pages/tai_khoan/them_khachhang.vue";
import CapNhatKhachHangPage from "@/pages/tai_khoan/capnhat_khachhang.vue";

// ✅ Hóa đơn
import HoaDonList from "@/pages/hoa_don/HoaDonList.vue";
import HoaDonDetail from "@/pages/hoa_don/HoaDonDetail.vue";

// ✅ Bán hàng
import SalesPage from "@/pages/sales/SalesPage.vue";

// ✅ Thống kê
import ThongKePage from "@/pages/thong_ke/ThongKePage.vue";

// ✅ LỊCH LÀM VIỆC
import LichLamViecPage from "@/pages/lich_lam_viec/LichLamViec.vue";
import GiaoCaPage from "@/pages/lich_lam_viec/GiaoCa.vue";
import LichCaLamPage from "@/pages/lich_lam_viec/LichCaLam.vue";

// ======================= AUTH HELPERS =======================
const normalizeRole = (role) => {
  const r = String(role || "").trim().toUpperCase();

  // tương thích nếu ai đó còn lưu STAFF
  if (r === "STAFF") return "NHAN_VIEN";
  if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";

  return r;
};

const getUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const getUserRole = () => {
  const u = getUser();

  // ưu tiên field dạng string trước, object (quyenHan) để sau
  const role =
    u?.role ||
    u?.vaiTro ||
    u?.tenVaiTro ||
    u?.tenQuyenHan ||
    u?.quyenHan?.tenQuyenHan ||
    u?.quyenHan;

  return normalizeRole(role);
};

// ✅ Check đăng nhập: token (nếu có) HOẶC user
const isLoggedIn = () => {
  const tokenKeys = ["accessToken", "token", "jwt", "ss_token"];
  const hasToken = tokenKeys.some((k) => !!localStorage.getItem(k) || !!sessionStorage.getItem(k));

  const hasUser =
    !!localStorage.getItem("user") ||
    !!sessionStorage.getItem("user") ||
    !!localStorage.getItem("nguoiDung") ||
    !!sessionStorage.getItem("nguoiDung");

  return hasToken || hasUser;
};

const clearAuth = () => {
  const keys = ["user", "nguoiDung", "accessToken", "token", "jwt", "ss_token", "ss_nguoi_ban"];
  keys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

const hasPermission = (requiredRoles, userRole) => {
  if (!requiredRoles) return true;
  if (!userRole) return false;

  return Array.isArray(requiredRoles) ? requiredRoles.includes(userRole) : requiredRoles === userRole;
};

// ======================= ROUTES =======================
const routes = [
  { path: "/", redirect: "/dang-nhap" },

  {
    path: "/dang-nhap",
    name: "dang-nhap",
    component: LoginManager,
    meta: { public: true },
  },

  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/admin/trang-chu" },

      // ✅ TRANG CHỦ: ADMIN + NHÂN VIÊN ĐỀU THẤY
      {
        path: "trang-chu",
        name: "admin-trang-chu",
        component: TrangChuPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      // ✅ TRANG THÔNG TIN CÁ NHÂN: ADMIN + NHÂN VIÊN ĐỀU THẤY
      {
        path: "thong-tin-ca-nhan",
        name: "admin-profile",
        component: () => import("@/views/admin/ThongTinCaNhan.vue"),
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      // ✅ THỐNG KÊ: chỉ ADMIN
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: ThongKePage,
        meta: { roles: ["ADMIN"] },
      },

      // ✅ POS / HÓA ĐƠN / KHÁCH HÀNG / LỊCH: ADMIN + NHÂN VIÊN
      {
        path: "pos",
        name: "admin-pos",
        component: SalesPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "hoa-don",
        name: "admin-hoa-don",
        component: HoaDonList,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },
      {
        path: "hoa-don/:id(\\d+)",
        name: "admin-hoa-don-detail",
        component: HoaDonDetail,
        props: true,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "lich-lam-viec",
        name: "admin-lich-lam-viec",
        component: LichLamViecPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },
      {
        path: "lich-ca-lam",
        name: "admin-lich-ca-lam",
        component: LichCaLamPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },
      {
        path: "giao-ca",
        name: "admin-giao-ca",
        component: GiaoCaPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      // =========================================================
      // ✅ KHUYẾN MẠI (ADMIN)
      // =========================================================
      {
        path: "giam-gia/phieu",
        name: "admin-voucher",
        component: VoucherManagePage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/phieu/them",
        name: "admin-voucher-new",
        component: VoucherFormPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/phieu/:id(\\d+)",
        name: "admin-voucher-detail",
        component: VoucherFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "giam-gia/dot",
        name: "admin-discount",
        component: DiscountPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/dot/new",
        name: "admin-discount-new",
        component: AddDiscountPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/dot/:id(\\d+)",
        name: "admin-discount-detail",
        component: DetailDiscountPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      // =========================================================
      // ✅ SẢN PHẨM (ADMIN)
      // =========================================================
      {
        path: "san-pham",
        name: "admin-san-pham",
        component: ProductManagePage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "san-pham/new",
        name: "admin-san-pham-new",
        component: ProductFormPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "san-pham/:id(\\d+)",
        name: "admin-san-pham-one",
        component: ProductFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "san-pham/:id(\\d+)/edit",
        name: "admin-san-pham-edit",
        component: ProductFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "chi-tiet-san-pham",
        name: "admin-ctsp",
        component: ProductDetailListPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "chi-tiet-san-pham/new",
        name: "admin-ctsp-new",
        component: ProductDetailFormPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "chi-tiet-san-pham/:id(\\d+)",
        name: "admin-ctsp-one",
        component: ProductDetailFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      // =========================================================
      // ✅ THUỘC TÍNH (ADMIN)
      // =========================================================
      { path: "xuat-xu", name: "admin-xuat-xu", component: XuatXuPage, meta: { roles: ["ADMIN"] } },
      { path: "thuong-hieu", name: "admin-thuong-hieu", component: ThuongHieuPage, meta: { roles: ["ADMIN"] } },
      { path: "vi-tri-thi-dau", name: "admin-vi-tri-thi-dau", component: ViTriThiDauPage, meta: { roles: ["ADMIN"] } },
      { path: "phong-cach-choi", name: "admin-phong-cach-choi", component: PhongCachChoiPage, meta: { roles: ["ADMIN"] } },
      { path: "co-giay", name: "admin-co-giay", component: CoGiayPage, meta: { roles: ["ADMIN"] } },
      { path: "chat-lieu", name: "admin-chat-lieu", component: ChatLieuPage, meta: { roles: ["ADMIN"] } },
      { path: "mau-sac", name: "admin-mau-sac", component: MauSacPage, meta: { roles: ["ADMIN"] } },
      { path: "kich-thuoc", name: "admin-kich-thuoc", component: KichThuocPage, meta: { roles: ["ADMIN"] } },
      { path: "form-chan", name: "admin-form-chan", component: FormChanPage, meta: { roles: ["ADMIN"] } },
      { path: "loai-san", name: "admin-loai-san", component: LoaiSanPage, meta: { roles: ["ADMIN"] } },

      // ✅ redirect demo cũ
      { path: "khach-hang", redirect: "/admin/tai-khoan/khach-hang" },
      { path: "nhan-vien", redirect: "/admin/tai-khoan/nhan-vien" },

      // =========================================================
      // ✅ TÀI KHOẢN
      // =========================================================
      {
        path: "tai-khoan/khach-hang",
        name: "tai-khoan-khach-hang",
        component: TaiKhoanKhachHangPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
        children: [
          { path: "them", name: "tai-khoan-khach-hang-them", component: ThemKhachHangPage, meta: { roles: ["ADMIN", "NHAN_VIEN"] } },
          {
            path: "cap-nhat/:id(\\d+)",
            name: "tai-khoan-khach-hang-cap-nhat",
            component: CapNhatKhachHangPage,
            props: true,
            meta: { roles: ["ADMIN", "NHAN_VIEN"] },
          },
        ],
      },
      {
        path: "tai-khoan/nhan-vien",
        name: "tai-khoan-nhan-vien",
        component: TaiKhoanNhanVienPage,
        meta: { roles: ["ADMIN"] },
        children: [
          { path: "them", name: "tai-khoan-nhan-vien-them", component: ThemNhanVienPage, meta: { roles: ["ADMIN"] } },
          {
            path: "cap-nhat/:id(\\d+)",
            name: "tai-khoan-nhan-vien-cap-nhat",
            component: CapNhatNhanVienPage,
            props: true,
            meta: { roles: ["ADMIN"] },
          },
        ],
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/dang-nhap" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ======================= GUARD =======================
router.beforeEach((to, from, next) => {
  const role = getUserRole();

  // Public route
  if (to.meta?.public) {
    // chỉ đá khỏi /dang-nhap khi đã login + role hợp lệ
    if (to.name === "dang-nhap" && isLoggedIn() && role) {
      return next("/admin/trang-chu");
    }
    return next();
  }

  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  if (!requiresAuth) return next();

  // chưa login -> về login
  if (!isLoggedIn()) {
    return next({ name: "dang-nhap", query: { redirect: to.fullPath } });
  }

  // đã có token/user nhưng không đọc ra role -> coi như chưa login (tránh “từ chối” sai)
  if (!role) {
    clearAuth();
    return next({ name: "dang-nhap" });
  }

  // lấy roles gần nhất trong matched (ưu tiên route con)
  const requiredRoles = to.matched.reduce(
    (acc, r) => (r.meta?.roles ?? r.meta?.role ?? acc),
    null
  );

  // =========================================================
  // ✅ CHẶN VÀO TRANG GIAO CA NẾU CHƯA MỞ CA LÀM VIỆC
  // =========================================================
  if (to.path.includes("/admin/giao-ca")) {
    if (role === "NHAN_VIEN") {
      const hasActiveShift = sessionStorage.getItem("ss_has_active_shift") === "true";
      if (!hasActiveShift) {
        // Thông báo nhẹ góc màn hình
        Swal.fire({
          icon: "warning",
          title: "Chưa mở ca",
          text: "Bạn cần có ca làm việc đang hoạt động để vào mục này.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000
        });
        return next(false); // Từ chối chuyển trang
      }
    }
  }
  
  // =========================================================
  // ✅ LỚP BẢO VỆ 1: CHẶN VÀO CÁC TRANG THÊM/SỬA/CẬP NHẬT NẾU CHƯA MỞ CA
  // =========================================================
  const isActionRoute = to.path.includes("/new") || 
                        to.path.includes("/them") || 
                        to.path.includes("/edit") || 
                        to.path.includes("/cap-nhat");

  if (isActionRoute && role === "NHAN_VIEN") {
    const hasActiveShift = sessionStorage.getItem("ss_has_active_shift") === "true";
    if (!hasActiveShift) {
      Swal.fire({
        icon: "error",
        title: "Chế độ Chỉ xem",
        text: "Bạn cần Bắt đầu ca làm việc mới có thể Thêm hoặc Sửa dữ liệu!",
      });
      return next(false); // Chặn không cho vào trang form
    }
  }
  // =========================================================

  if (!hasPermission(requiredRoles, role)) {
    Swal.fire({
      icon: "error",
      title: "Từ chối truy cập",
      text: "Bạn không có quyền vào chức năng này!",
      timer: 1500,
      showConfirmButton: false,
    });

    // fallback an toàn
    const fallback = role === "NHAN_VIEN" ? "/admin/trang-chu" : "/admin/trang-chu";
    return next(from.fullPath && from.fullPath !== "/dang-nhap" ? from.fullPath : fallback);
  }

  return next();
});

export default router;