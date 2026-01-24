import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/views/admin/AdminLayout.vue";

import ProductManagePage from "@/pages/product/ProductManagePage.vue";
import ProductDetailListPage from "@/pages/product/ProductDetailListPage.vue";
import ProductDetailFormPage from "@/pages/product/ProductDetailFormPage.vue";
import ProductFormPage from "@/pages/product/ProductFormPage.vue";

// ✅ CỔ GIÀY đúng cây thư mục của bạn
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

      // ✅ Sản phẩm
      { path: "san-pham", name: "admin-san-pham", component: ProductManagePage },
      { path: "san-pham/new", name: "admin-san-pham-new", component: ProductFormPage },

      // ✅ THÊM MỚI: trang sửa sản phẩm riêng (icon mắt sẽ dùng route này)
      { path: "san-pham/:id", name: "admin-san-pham-one", component: ProductFormPage, props: true },

      // ✅ giữ nguyên route cũ để không ảnh hưởng code hiện tại
      { path: "san-pham/:id/edit", name: "admin-san-pham-edit", component: ProductFormPage, props: true },

      // ✅ Chi tiết sản phẩm
      { path: "chi-tiet-san-pham", name: "admin-ctsp", component: ProductDetailListPage },
      { path: "chi-tiet-san-pham/new", name: "admin-ctsp-new", component: ProductDetailFormPage },
      { path: "chi-tiet-san-pham/:id", name: "admin-ctsp-one", component: ProductDetailFormPage, props: true },

      // ✅ Thuộc tính
      { path: "xuat-xu", component: SimplePage("XUẤT XỨ") },
      { path: "thuong-hieu", component: SimplePage("THƯƠNG HIỆU") },
      { path: "vi-tri-thi-dau", component: SimplePage("VỊ TRÍ THI ĐẤU") },
      { path: "phong-cach-choi", component: SimplePage("PHONG CÁCH CHƠI") },

      { path: "co-giay", component: CoGiayPage },

      { path: "chat-lieu", component: SimplePage("CHẤT LIỆU") },
      { path: "mau-sac", component: SimplePage("MÀU SẮC") },
      { path: "kich-thuoc", component: SimplePage("KÍCH THƯỚC") },
      { path: "form-chan", component: SimplePage("FORM CHÂN") },
      { path: "loai-san", component: SimplePage("LOẠI SÂN") },

      { path: "khach-hang", component: SimplePage("KHÁCH HÀNG") },
      { path: "nhan-vien", component: SimplePage("NHÂN VIÊN") },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/admin/san-pham" },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
