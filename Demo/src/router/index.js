// File: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/views/admin/AdminLayout.vue";

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

// ✅ Thống kê (đổi đúng đường dẫn theo vị trí file bạn đã tạo)
import ThongKePage from "@/pages/thong_ke/ThongKePage.vue";

const SimplePage = (title) => ({
  template: `<div class="p-4"><h3 style="font-weight:800">${title}</h3><div class="text-muted">Demo page</div></div>`,
});

const routes = [
  { path: "/", redirect: "/admin/san-pham" },

  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/admin/san-pham" },

      // ✅ THỐNG KÊ (hiển thị page thật thay vì demo)
      { path: "dashboard", name: "admin-dashboard", component: ThongKePage },

      // ✅ Bán hàng (UI demo)
      { path: "pos", name: "admin-pos", component: SalesPage },

      // ✅ Hóa đơn
      { path: "hoa-don", name: "admin-hoa-don", component: HoaDonList },
      {
        path: "hoa-don/:id(\\d+)",
        name: "admin-hoa-don-detail",
        component: HoaDonDetail,
        props: true,
      },

      // =========================================================
      // ✅ KHUYẾN MẠI
      // =========================================================

      // ✅ Phiếu giảm giá
      { path: "giam-gia/phieu", name: "admin-voucher", component: VoucherManagePage },
      { path: "giam-gia/phieu/them", name: "admin-voucher-new", component: VoucherFormPage },

      // ✅ id chỉ ăn số => không bao giờ match nhầm "them"
      {
        path: "giam-gia/phieu/:id(\\d+)",
        name: "admin-voucher-detail",
        component: VoucherFormPage,
        props: true,
      },

      // ✅ Đợt giảm giá
      { path: "giam-gia/dot", name: "admin-discount", component: DiscountPage },
      { path: "giam-gia/dot/new", name: "admin-discount-new", component: AddDiscountPage },
      {
        path: "giam-gia/dot/:id(\\d+)",
        name: "admin-discount-detail",
        component: DetailDiscountPage,
        props: true,
      },

      // =========================================================
      // ✅ SẢN PHẨM
      // =========================================================
      { path: "san-pham", name: "admin-san-pham", component: ProductManagePage },
      { path: "san-pham/new", name: "admin-san-pham-new", component: ProductFormPage },
      { path: "san-pham/:id(\\d+)", name: "admin-san-pham-one", component: ProductFormPage, props: true },
      { path: "san-pham/:id(\\d+)/edit", name: "admin-san-pham-edit", component: ProductFormPage, props: true },

      { path: "chi-tiet-san-pham", name: "admin-ctsp", component: ProductDetailListPage },
      { path: "chi-tiet-san-pham/new", name: "admin-ctsp-new", component: ProductDetailFormPage },
      { path: "chi-tiet-san-pham/:id(\\d+)", name: "admin-ctsp-one", component: ProductDetailFormPage, props: true },

      // =========================================================
      // ✅ THUỘC TÍNH
      // =========================================================
      { path: "xuat-xu", name: "admin-xuat-xu", component: XuatXuPage },
      { path: "thuong-hieu", name: "admin-thuong-hieu", component: ThuongHieuPage },
      { path: "vi-tri-thi-dau", name: "admin-vi-tri-thi-dau", component: ViTriThiDauPage },
      { path: "phong-cach-choi", name: "admin-phong-cach-choi", component: PhongCachChoiPage },
      { path: "co-giay", name: "admin-co-giay", component: CoGiayPage },
      { path: "chat-lieu", name: "admin-chat-lieu", component: ChatLieuPage },
      { path: "mau-sac", name: "admin-mau-sac", component: MauSacPage },
      { path: "kich-thuoc", name: "admin-kich-thuoc", component: KichThuocPage },
      { path: "form-chan", name: "admin-form-chan", component: FormChanPage },
      { path: "loai-san", name: "admin-loai-san", component: LoaiSanPage },

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
        children: [
          { path: "them", name: "tai-khoan-khach-hang-them", component: ThemKhachHangPage },
          {
            path: "cap-nhat/:id(\\d+)",
            name: "tai-khoan-khach-hang-cap-nhat",
            component: CapNhatKhachHangPage,
            props: true,
          },
        ],
      },
      {
        path: "tai-khoan/nhan-vien",
        name: "tai-khoan-nhan-vien",
        component: TaiKhoanNhanVienPage,
        children: [
          { path: "them", name: "tai-khoan-nhan-vien-them", component: ThemNhanVienPage },
          {
            path: "cap-nhat/:id(\\d+)",
            name: "tai-khoan-nhan-vien-cap-nhat",
            component: CapNhatNhanVienPage,
            props: true,
          },
        ],
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/admin/san-pham" },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
