# Validate FE – Quản lý phiếu giảm giá (Voucher)

> Format theo sheet của bạn: **4 cột** `Role | Màn hình | Chức năng | Validate`.
>
> Phạm vi: các màn Admin tại `src/pages/khuyen_mai/phieu_giam_gia/*` và component liên quan `src/components/voucher/*`.

| Role | Màn hình | Chức năng | Validate |
|---|---|---|---|
| Admin | Quản lý giảm giá / Phiếu giảm giá (`/admin/giam-gia/phieu`) | Hiển thị danh sách | - **Không có dữ liệu**: hiển thị bảng rỗng, không crash UI. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Phân trang | - **Không cho vượt biên**: `Trang trước` disabled ở trang 1, `Trang sau` disabled ở trang cuối. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Xem chi tiết | - **Click icon mắt** mở đúng trang chi tiết theo `id`. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Đổi trạng thái (toggle) | - **Chỉ hiện toggle khi trạng thái hiển thị = “Đang hoạt động”**. <br>- **Bắt confirm** trước khi đổi trạng thái. <br>- **Bấm Hủy**: UI revert về trạng thái cũ. <br>- **Spam click nhanh**: chặn thao tác khi đang cập nhật (không gửi nhiều request). <br>- **Lỗi API**: revert trạng thái + hiện thông báo lỗi. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Thêm phiếu giảm giá | - **Điều hướng** sang trang thêm mới. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Xuất Excel | - **Xuất theo danh sách đang lọc** (keyword/status). <br>- **Không crash khi danh sách rỗng** (file vẫn tạo được hoặc báo “Không có dữ liệu để xuất”). |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Bộ lọc – Tìm kiếm (keyword) | - **Cho phép rỗng**. <br>- **Trim khoảng trắng** khi tìm (không phân biệt hoa/thường). <br>- **Giới hạn độ dài**: khuyến nghị \(<= 255\) ký tự để tránh nhập quá dài. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Bộ lọc – Trạng thái | - Giá trị hợp lệ: `Tất cả` / `Đang hoạt động` / `Chưa bắt đầu` / `Đã kết thúc`. |
| Admin | Quản lý giảm giá / Phiếu giảm giá | Bộ lọc – Ngày bắt đầu / Ngày kết thúc | - **Nếu có cả 2 ngày**: `Ngày bắt đầu` phải \(\le\) `Ngày kết thúc`. <br>- **Nếu user chọn sai**: hiển thị cảnh báo và không áp dụng filter (hoặc tự swap 2 ngày). *(Khuyến nghị bổ sung vì hiện FE đang chưa dùng 2 field này khi lọc.)* |
| Admin | Thêm/Cập nhật/Chi tiết phiếu (`/admin/giam-gia/phieu/them` hoặc `/admin/giam-gia/phieu/:id`) | Hiển thị “Mã phiếu giảm giá” | - **Readonly** (hệ thống tự sinh). <br>- **Không cho user sửa**. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Tên giảm giá” | - **Bắt buộc** (không được chỉ toàn khoảng trắng). <br>- **Độ dài**: khuyến nghị 3–100 ký tự. <br>- **Ký tự**: cho phép chữ/số/khoảng trắng, chặn toàn ký tự đặc biệt nếu hệ thống yêu cầu. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Chọn “Hình thức giảm” | - Bắt buộc chọn 1 trong 2: **VNĐ** hoặc **%**. <br>- Khi đổi hình thức: reset giá trị giảm để tránh giữ dữ liệu cũ. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Giá trị giảm” – theo % | - **Bắt buộc** nhập. <br>- **Hợp lệ**: số nguyên trong [1..100]. <br>- **Không cho âm**, không cho `0`. <br>- **Nếu nhập > 100**: auto clamp về 100. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Giá trị giảm” – theo VNĐ | - **Bắt buộc** nhập. <br>- **Hợp lệ**: số \(> 0\). <br>- **Không cho âm**, không cho ký tự không phải số. <br>- **Khuyến nghị**: không vượt quá `Hóa đơn tối thiểu` (nếu có), và không vượt quá 1 ngưỡng nghiệp vụ (ví dụ \(<= 1.000.000.000\) VNĐ). |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Số tiền giảm tối đa” (cap) | - **Chỉ áp dụng khi giảm theo %**. <br>- **Nếu có nhập**: số \(>= 0\). <br>- **Nếu bỏ trống**: coi như không cap (hoặc cap = 0). *(Khuyến nghị bổ sung vì UI hiện chưa tách field cap rõ ràng.)* |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Số lượng sử dụng” – Công khai | - **Nếu không bật “Vô hạn”**: bắt buộc số nguyên \(> 0\). <br>- **Nếu bật “Vô hạn”**: tự set số lượng = 999999 và disable input số lượng. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Số lượng sử dụng” – Cá nhân | - **Disable input số lượng** (số lượng = số KH được chọn). <br>- **Bắt buộc chọn ít nhất 1 khách hàng** trước khi lưu. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Hóa đơn tối thiểu” | - Cho phép rỗng/0. <br>- **Hợp lệ**: số \(>= 0\). <br>- **Khuyến nghị**: nếu giảm theo VNĐ thì `Hóa đơn tối thiểu` phải \(>=\) `Giá trị giảm` để tránh phiếu gây tổng âm. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Chọn “Ngày bắt đầu / Ngày kết thúc” | - **Bắt buộc chọn đủ 2 ngày**. <br>- **Hợp lệ**: `Ngày kết thúc` \(\ge\) `Ngày bắt đầu`. <br>- **Khuyến nghị**: `Ngày bắt đầu` \(\ge\) ngày hiện tại khi tạo mới (tránh tạo phiếu trong quá khứ). |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Chọn “Loại phiếu” (Công khai/Cá nhân) | - Bắt buộc chọn 1 loại. <br>- Khi đổi sang **Cá nhân**: tắt “Vô hạn”, reset số lượng về 0 và yêu cầu chọn KH. <br>- Khi đổi sang **Công khai**: clear danh sách KH đã chọn. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nhập “Mô tả phiếu giảm giá” | - Không bắt buộc. <br>- **Độ dài**: khuyến nghị \(<= 500\) hoặc \(<= 1000\) ký tự. <br>- Trim khoảng trắng đầu/cuối. |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nút “Tạo mới/Cập nhật” | - **Disable khi đang lưu** để tránh submit nhiều lần. <br>- **Nếu phiếu đã kết thúc**: khóa form, không cho cập nhật (hiển thị “Không thể cập nhật”). |
| Admin | Thêm/Cập nhật/Chi tiết phiếu | Nút “Hủy” | - Quay về trang danh sách, không lưu dữ liệu. |
| Admin | Chi tiết phiếu | Xóa phiếu | - **Bắt confirm**. <br>- **Thành công**: quay về danh sách + toast thành công. <br>- **Thất bại**: hiện lỗi “Không thể xóa phiếu này”. |
| Admin | Phiếu cá nhân – Bảng khách hàng | Tìm theo tên | - Cho phép rỗng. <br>- Tìm không phân biệt hoa/thường. |
| Admin | Phiếu cá nhân – Bảng khách hàng | Tìm theo SĐT | - Cho phép rỗng. <br>- **Khuyến nghị**: chỉ cho nhập số, giới hạn 10–11 ký tự (tùy chuẩn). |
| Admin | Phiếu cá nhân – Bảng khách hàng | Lọc “trạng thái” (VIP/THƯỜNG XUYÊN/MỚI) | - Giá trị hợp lệ đúng 3 option. <br>- Nếu không chọn: hiển thị tất cả. |
| Admin | Phiếu cá nhân – Bảng khách hàng | Chọn khách hàng (checkbox) | - **Không trùng id** trong danh sách chọn. <br>- **Chọn tất cả trong trang** hoạt động đúng (check/uncheck). <br>- **Khi phiếu bị khóa**: không cho chọn/bỏ chọn. |
| Admin | Phiếu cá nhân – Bảng khách hàng | Phân trang khách hàng | - Không cho vượt biên trang. <br>- Cập nhật đúng range “Hiển thị X–Y trong Z khách hàng”. |

