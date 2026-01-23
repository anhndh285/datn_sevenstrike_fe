import apiClient from "./apiClient";

const BASE_URL = "/api/admin";

// Định nghĩa các API endpoint
const API = {
    DISCOUNT: `${BASE_URL}/dot-giam-gia`,
    DISCOUNT_DETAIL: `${BASE_URL}/chi-tiet-dot-giam-gia`,
    PRODUCT_DETAIL: `${BASE_URL}/chi-tiet-san-pham`,
    PRODUCT: `${BASE_URL}/san-pham`,
    COLOR: `${BASE_URL}/mau-sac`,
    SIZE: `${BASE_URL}/kich-thuoc`,
    BRAND: `${BASE_URL}/thuong-hieu`,
    MATERIAL: `${BASE_URL}/chat-lieu`,
    CATEGORY: `${BASE_URL}/loai-san`,
    SOLE: `${BASE_URL}/co-giay`
};

export const discountService = {

    async getAll() {
        const res = await apiClient.get(API.DISCOUNT);
        return res.data;
    },

    async getOne(id) {
        const res = await apiClient.get(`${API.DISCOUNT}/${id}`);
        return res.data;
    },

    async delete(id) {
        const res = await apiClient.delete(`${API.DISCOUNT}/${id}`);
        return res.data;
    },

    async update(id, payload) {
        const res = await apiClient.put(`${API.DISCOUNT}/${id}`, payload);
        return res.data;
    },

    // Lấy danh sách chi tiết sản phẩm thuộc đợt giảm giá
    async getDiscountDetails(idDotGiamGia) {
        // Tạo query param bằng URLSearchParams
        const params = new URLSearchParams({ idDotGiamGia: idDotGiamGia });
        const url = `${API.DISCOUNT_DETAIL}?${params.toString()}`;

        const res = await apiClient.get(url);
        return res.data || [];
    },

    /**
     * 🟢 QUAN TRỌNG: Lấy dữ liệu thật và MAP tên vào ID
     * Sử dụng Promise.all với Fetch
     */
    async getAllProductDetails() {
        try {
            // 1. Gọi song song tất cả các API
            // Lưu ý: fetchClient đã bao gồm bước .json()
            const [
                ctspData,
                spData,
                mauSacData,
                kichThuocData,
                thuongHieuData,
                chatLieuData,
                loaiSanData
            ] = await Promise.all([
                apiClient.get(API.PRODUCT_DETAIL),
                apiClient.get(API.PRODUCT),
                apiClient.get(API.COLOR),
                apiClient.get(API.SIZE),
                apiClient.get(API.BRAND),
                apiClient.get(API.MATERIAL),
                apiClient.get(API.CATEGORY)
            ]);

            // Helper: Lấy data an toàn từ response axios
            const safeData = (res) => {
                const d = res?.data;
                if (Array.isArray(d)) return d;
                if (d?.data && Array.isArray(d.data)) return d.data; // Trường hợp BE trả về Page object
                return [];
            };

            // 2. Tạo Map (Dictionary)
            const createMap = (arr, nameField) => {
                return (arr || []).reduce((acc, item) => {
                    acc[item.id] = item[nameField];
                    return acc;
                }, {});
            };

            // Map ID -> Tên
            const sanPhamNameMap = createMap(safeData(spData), 'tenSanPham');
            const mauSacMap = createMap(safeData(mauSacData), 'tenMauSac');
            const kichThuocMap = createMap(safeData(kichThuocData), 'tenKichThuoc');
            const thuongHieuMap = createMap(safeData(thuongHieuData), 'tenThuongHieu');
            const chatLieuMap = createMap(safeData(chatLieuData), 'tenChatLieu');
            const loaiSanMap = createMap(safeData(loaiSanData), 'tenLoaiSan');

            // 3. Duyệt và enrich data
            const enrichedData = safeData(ctspData).map(item => {
                let idSanPham = item.idSanPham || item.id_san_pham;
                // Fix: Lấy ID từ object sanPham lồng nhau nếu có (trường hợp JPA trả về entity)
                if (!idSanPham && item.sanPham) {
                    idSanPham = item.sanPham.id;
                }
                const parentProduct = safeData(spData).find(p => p.id == idSanPham) || {};

                const brandName = thuongHieuMap[parentProduct.idThuongHieu] || 'Chưa cập nhật';
                const materialName = chatLieuMap[parentProduct.idChatLieu] || 'Chưa cập nhật';

                return {
                    ...item,
                    idSanPham: idSanPham, // Ensure idSanPham is populated for grouping
                    giaNiemYet: item.giaNiemYet || item.gia_niem_yet || item.giaBan, // Map Listed Price (fallback to giaBan if null)
                    maSanPham: parentProduct.maSanPham || 'SP-UNKNOWN',
                    tenSanPham: sanPhamNameMap[idSanPham] || 'Sản phẩm lỗi',
                    tenMauSac: mauSacMap[item.idMauSac] || 'Không xác định',
                    tenKichThuoc: kichThuocMap[item.idKichThuoc] || 'FS',
                    tenLoaiSan: loaiSanMap[item.idLoaiSan] || 'Đế thường',
                    tenThuongHieu: brandName,
                    tenChatLieu: materialName,
                    maChiTietSanPham: item.maChiTietSanPham || `CTSP-${item.id}`
                };
            });

            return enrichedData;

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu sản phẩm từ DB:", error);
            return [];
        }
    },

    /**
     * LOGIC TRANSACTION CLIENT
     */
    async createDiscountComposite(payload) {
        const { idChiTietSanPhams, ...discountData } = payload;

        // Bước 1: Tạo đợt
        const resDiscount = await apiClient.post(API.DISCOUNT, discountData);
        const newDiscount = resDiscount.data;

        const newDiscountId = newDiscount.id;
        if (!newDiscountId) throw new Error("Lỗi: Không tạo được đợt giảm giá (Không có ID trả về)");

        // Bước 2: Tạo chi tiết
        if (idChiTietSanPhams && idChiTietSanPhams.length > 0) {
            const detailRequests = idChiTietSanPhams.map(idCTSP => {
                const detailPayload = {
                    idDotGiamGia: newDiscountId,
                    idChiTietSanPham: idCTSP,
                    soLuongApDung: null,
                    giaTriGiamRieng: null,
                    soTienGiamToiDaRieng: null,
                    ghiChu: "Added via Admin UI",
                    trangThai: true
                };

                return apiClient.post(API.DISCOUNT_DETAIL, detailPayload);
            });

            await Promise.all(detailRequests);
        }

        return newDiscount;
    }
};
