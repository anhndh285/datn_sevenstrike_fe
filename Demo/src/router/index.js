import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/views/admin/AdminLayout.vue";

import ProductManagePage from "@/pages/product/ProductManagePage.vue";
import ProductFormPage from "@/pages/product/ProductFormPage.vue";

import ProductDetailListPage from "@/pages/product/ProductDetailListPage.vue";
import ProductDetailFormPage from "@/pages/product/ProductDetailFormPage.vue";

// Thuộc tính - Cổ giày
import CoGiayPage from "@/pages/product/thuoc_tinh/co_giay/CoGiayPage.vue";

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

      { path: "dashboard", component: SimplePage("THỐNG KÊ") },
      { path: "pos", component: SimplePage("BÁN HÀNG TẠI QUẦY") },
      { path: "hoa-don", component: SimplePage("HÓA ĐƠN") },

      { path: "giam-gia/phieu", component: SimplePage("PHIẾU GIẢM GIÁ") },
      { path: "giam-gia/dot", component: SimplePage("ĐỢT GIẢM GIÁ") },

      // ===== SẢN PHẨM =====
      { path: "san-pham", name: "admin-san-pham", component: ProductManagePage },

      // Thêm / sửa sản phẩm: chuyển sang PAGE (không dùng modal)
      { path: "san-pham/new", name: "admin-san-pham-new", component: ProductFormPage },
      { path: "san-pham/:id/edit", name: "admin-san-pham-edit", component: ProductFormPage, props: true },

      // ===== CHI TIẾT SẢN PHẨM =====
      // List: có thể nhận query ?productId=
      { path: "chi-tiet-san-pham", name: "admin-ctsp", component: ProductDetailListPage },
      { path: "chi-tiet-san-pham/new", name: "admin-ctsp-new", component: ProductDetailFormPage },
      { path: "chi-tiet-san-pham/:id", name: "admin-ctsp-one", component: ProductDetailFormPage, props: true },

      // ===== THUỘC TÍNH =====
      { path: "xuat-xu", component: SimplePage("XUẤT XỨ") },
      { path: "thuong-hieu", component: SimplePage("THƯƠNG HIỆU") },
      { path: "vi-tri-thi-dau", component: SimplePage("VỊ TRÍ THI ĐẤU") },
      { path: "phong-cach-choi", component: SimplePage("PHONG CÁCH CHƠI") },

      { path: "co-giay", name: "admin-co-giay", component: CoGiayPage },

      { path: "chat-lieu", component: SimplePage("CHẤT LIỆU") },
      { path: "mau-sac", component: SimplePage("MÀU SẮC") },
      { path: "kich-thuoc", component: SimplePage("KÍCH THƯỚC") },
      { path: "form-chan", component: SimplePage("FORM CHÂN") },
      { path: "loai-san", component: SimplePage("LOẠI SÂN") },
      {
          path: 'nhan-vien',
          component: () => import('@/views/admin/tai_khoan/taikhoan_nhanvien.vue'),
          children: [
            {
              path: 'add',
              name: 'nv-add',
              component: () => import('@/views/admin/tai_khoan/them_nhanvien.vue'),
            },
            {
              path: 'update/:id',
              name: 'nv-update',
              component: () => import('@/views/admin/tai_khoan/capnhat_nhanvien.vue'),
            }
          ],
        },
        {
          path: 'khach-hang',
          component: () => import('@/views/admin/tai_khoan/taikhoan_khachhang.vue'),
          children: [
            {
              path: 'add',
              name: 'kh-add',
              component: () => import('@/views/admin/tai_khoan/them_khachhang.vue'),
            },
            {
              path: 'update/:id',
              name: 'kh-update',
              component: () => import('@/views/admin/tai_khoan/capnhat_khachhang.vue'),
            }
          ],
        }
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/admin/san-pham" },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
