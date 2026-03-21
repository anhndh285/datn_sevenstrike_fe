# Test Report – Quản lý giảm giá / Phiếu giảm giá (Voucher)

## Thông tin chung

| Mục | Giá trị |
|---|---|
| Module | Quản lý giảm giá / Phiếu giảm giá |
| Phạm vi | `Demo/src/pages/khuyen_mai/phieu_giam_gia/VoucherManagePage.vue`, `Demo/src/pages/khuyen_mai/phieu_giam_gia/VoucherFormPage.vue`, `Demo/src/components/voucher/VoucherForm.vue` |
| Môi trường | Local (`http://localhost:8080`) |
| Người test | … |
| Ngày test | … |
| Build/Version | … |

## Kết quả tổng hợp

| Tổng TC | Pass | Fail | Block | Not run |
|---:|---:|---:|---:|---:|
| … | … | … | … | … |

## Chi tiết Test Cases (format theo “sheet”)

> Ghi chú cột:
> - **Actual result**: điền khi test thực tế.
> - **Status**: Pass/Fail/Block/Not run.
> - **Evidence**: link ảnh/chụp màn hình hoặc tên file.

| TC ID | Test Title | Màn hình/Chức năng | Pre-condition | Test steps | Expected result | Actual result | Status | Note | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| VOU_QL_01 | Hiển thị danh sách phiếu giảm giá | Danh sách | Đăng nhập Admin | 1) Vào `/admin/giam-gia/phieu` | Bảng hiển thị danh sách (có thể rỗng), UI không crash. |  | Not run |  |  |
| VOU_QL_02 | Phân trang – Trang trước bị disable ở trang 1 | Danh sách / Pagination | Có >= 11 bản ghi | 1) Vào trang danh sách<br>2) Đảm bảo đang ở trang 1 | Nút `<` bị disable ở trang 1. |  | Not run |  |  |
| VOU_QL_03 | Phân trang – Trang sau bị disable ở trang cuối | Danh sách / Pagination | Có đủ dữ liệu để có nhiều trang | 1) Vào trang danh sách<br>2) Chuyển tới trang cuối | Nút `>` bị disable ở trang cuối. |  | Not run |  |  |
| VOU_QL_04 | Phân trang – Không cho chuyển vượt biên | Danh sách / Pagination | Có nhiều trang | 1) Thử click chuyển tới trang 0 (nếu có thao tác)<br>2) Thử click `>` ở trang cuối | Không đổi trang khi vượt biên (`gotoPage` chặn). |  | Not run |  |  |
| VOU_QL_05 | Tìm kiếm keyword – trim + không phân biệt hoa thường | Bộ lọc keyword | Có phiếu có `maPhieuGiamGia` hoặc `tenPhieuGiamGia` | 1) Nhập keyword có khoảng trắng đầu/cuối (vd: `"  abc  "`)<br>2) So khớp cả mã & tên | Kết quả lọc theo keyword đã `trim()` và `toLowerCase()`. |  | Not run |  |  |
| VOU_QL_06 | Lọc trạng thái – đúng 3 nhãn theo logic ngày + cờ trạng thái | Bộ lọc status | Có dữ liệu với các trường ngày và `trangThai` | 1) Chọn từng trạng thái trong filter (`Đang hoạt động/Chưa bắt đầu/Đã kết thúc`)<br>2) Quan sát danh sách | Danh sách chỉ hiển thị item có `getStatusText(p)` đúng với filter. |  | Not run | Logic status: `trangThai=false` luôn là “Đã kết thúc”; ngược lại dựa theo `ngayBatDau/ngayKetThuc`. |  |
| VOU_QL_07 | Xuất Excel – xuất theo danh sách đang lọc | Export Excel | Có dữ liệu | 1) Đặt bộ lọc keyword/status để danh sách thay đổi<br>2) Click `Xuất Excel` | File `.xlsx` được tạo, dữ liệu chỉ gồm các dòng đúng theo danh sách đã lọc. |  | Not run | Tên file: `Voucher_SevenStrike_<timestamp>.xlsx` |  |
| VOU_QL_08 | Xem chi tiết – icon “mắt” điều hướng đúng theo id | Xem chi tiết | Có ít nhất 1 phiếu | 1) Click hành động xem chi tiết trên 1 dòng | Điều hướng tới `/admin/giam-gia/phieu/:id`. |  | Not run |  |  |
| VOU_QL_09 | Toggle trạng thái – bắt confirm trước khi cập nhật | Toggle trạng thái | Có phiếu đang “Đang hoạt động” | 1) Thực hiện toggle trạng thái<br>2) Quan sát popup | Hiện popup “Xác nhận đổi trạng thái?” có nút `Xác nhận/Hủy`. |  | Not run |  |  |
| VOU_QL_10 | Toggle trạng thái – bấm Hủy thì revert trạng thái cũ | Toggle trạng thái | Có phiếu toggle được | 1) Toggle<br>2) Chọn `Hủy` | Trạng thái UI revert về trạng thái ban đầu (`p.trangThai = oldValue`). |  | Not run |  |  |
| VOU_QL_11 | Toggle trạng thái – chặn spam click khi đang cập nhật | Toggle trạng thái | Có phiếu toggle được | 1) Toggle và bấm xác nhận<br>2) Trong lúc đang xử lý, spam click toggle nhiều lần | Không gửi nhiều request; UI revert ngay nếu đang cập nhật (`dangCapNhatTrangThai`). |  | Not run |  |  |
| VOU_QL_12 | Toggle trạng thái – lỗi API thì revert + báo lỗi | Toggle trạng thái | Có thể giả lập lỗi API | 1) Toggle và xác nhận<br>2) Khi API lỗi | UI revert trạng thái cũ và hiện alert “Không thể cập nhật trạng thái”. |  | Not run |  |  |
| VOU_QL_13 | Nút “Thêm phiếu giảm giá” điều hướng sang trang tạo mới | Điều hướng | Đăng nhập Admin | 1) Click `Thêm phiếu giảm giá` | Điều hướng `/admin/giam-gia/phieu/them`. |  | Not run |  |  |

| TC ID | Test Title | Màn hình/Chức năng | Pre-condition | Test steps | Expected result | Actual result | Status | Note | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| VOU_FM_01 | Mã phiếu giảm giá readonly | Form phiếu | Vào trang tạo mới/chi tiết | 1) Quan sát field “Mã phiếu giảm giá”<br>2) Thử nhập | Field readonly, không sửa được. |  | Not run | `VoucherForm.vue` đặt `readonly` |  |
| VOU_FM_02 | Validate – bắt buộc nhập Tên phiếu (trim) | Lưu phiếu |  | 1) Để trống “Tên giảm giá” hoặc chỉ nhập khoảng trắng<br>2) Click `Tạo mới/Cập nhật` | Cảnh báo “Vui lòng nhập tên phiếu”, không gửi request lưu. |  | Not run | Validate tại `VoucherFormPage.vue` |  |
| VOU_FM_03 | Validate – bắt buộc chọn đủ ngày bắt đầu/kết thúc | Lưu phiếu |  | 1) Bỏ trống 1 trong 2 ngày<br>2) Click `Tạo mới/Cập nhật` | Cảnh báo “Vui lòng chọn đủ ngày bắt đầu/kết thúc”, không lưu. |  | Not run |  |  |
| VOU_FM_04 | Validate – Ngày kết thúc phải >= ngày bắt đầu | Lưu phiếu |  | 1) Chọn `ngàyBatDau` lớn hơn `ngàyKetThuc`<br>2) Click `Tạo mới/Cập nhật` | Cảnh báo “Ngày kết thúc phải >= ngày bắt đầu”, không lưu. |  | Not run |  |  |
| VOU_FM_05 | Hình thức giảm – đổi VNĐ/% reset giá trị | Form phiếu |  | 1) Chọn VNĐ, nhập số tiền<br>2) Chuyển sang %<br>3) Chuyển lại VNĐ | Khi đổi loại: reset `giaTriGiamGia=0` và `soTienGiamToiDa=0`. |  | Not run | `handleTypeChange` |  |
| VOU_FM_06 | Giá trị giảm theo % – clamp tối đa 100 | Form phiếu | Chọn hình thức % | 1) Nhập `giaTriGiamGia = 101` | Giá trị tự clamp về 100. |  | Not run | `update()` clamp khi `%` |  |
| VOU_FM_07 | Các trường số không cho âm – tự set về 0 | Form phiếu |  | 1) Thử nhập số âm cho `giaTriGiamGia/soTienGiamToiDa/soLuongSuDung/hoaDonToiThieu` | Giá trị bị set về 0. |  | Not run | `update()` chặn `<0` |  |
| VOU_FM_08 | Số lượng sử dụng – bật “Vô hạn” set 999999 và disable input | Form phiếu | Loại phiếu = Công khai | 1) Bật switch “Vô hạn”<br>2) Quan sát input số lượng | `soLuongSuDung` = 999999 và input bị disable, placeholder “∞ Không giới hạn”. |  | Not run | `handleUnlimitedChange` |  |
| VOU_FM_09 | Phiếu cá nhân – switch “Vô hạn” bị disable | Form phiếu | Loại phiếu = Cá nhân | 1) Chọn “Cá nhân”<br>2) Quan sát switch “Vô hạn” | Switch bị disable (không cho bật). |  | Not run | `:disabled="... loaiPhieuGiamGia === true"` |  |
| VOU_FM_10 | Phiếu cá nhân – số lượng sử dụng disable + theo số KH chọn | Form phiếu | Loại phiếu = Cá nhân | 1) Chọn “Cá nhân”<br>2) Quan sát input số lượng | Input số lượng bị disable và placeholder “Số lượng theo khách hàng chọn”. |  | Not run | Số lượng gửi lên BE = `uniqueCustomerIds.length` |  |
| VOU_FM_11 | Validate – Phiếu cá nhân bắt buộc chọn >= 1 khách hàng | Lưu phiếu cá nhân | Loại phiếu = Cá nhân | 1) Không chọn khách hàng<br>2) Click `Tạo mới/Cập nhật` | Cảnh báo “Vui lòng chọn ít nhất một khách hàng…”, không lưu. |  | Not run |  |  |
| VOU_FM_12 | Lưu tạo mới phiếu công khai thành công | Tạo mới | Điền form hợp lệ | 1) Nhập đủ thông tin hợp lệ<br>2) Click `Tạo mới` | Alert “Thành công – Dữ liệu đã được lưu!” và quay về `/admin/giam-gia/phieu`. |  | Not run |  |  |
| VOU_FM_13 | Cập nhật phiếu thành công (khi chưa bị khóa) | Cập nhật | Mở chi tiết phiếu còn `trangThai=true` | 1) Sửa dữ liệu<br>2) Click `Cập nhật` | Lưu thành công, quay về danh sách. |  | Not run |  |  |
| VOU_FM_14 | Phiếu đã kết thúc bị khóa form (không thể cập nhật) | Khóa form | Có phiếu `trangThai=false` | 1) Mở chi tiết phiếu đã kết thúc | Form bị “lock” (opacity + không tương tác); nút hiển thị “Không thể cập nhật”. |  | Not run | `isLocked = !trangThai` |  |
| VOU_FM_15 | Xóa phiếu – confirm và xóa thành công | Xóa | Mở chi tiết phiếu | 1) Click `Xóa phiếu`<br>2) Confirm | Xóa thành công, alert “Đã xóa…”, quay về danh sách. |  | Not run |  |  |
| VOU_FM_16 | Xóa phiếu – API lỗi thì báo “Không thể xóa phiếu này” | Xóa | Giả lập API lỗi | 1) Click `Xóa phiếu`<br>2) Confirm | Alert lỗi “Không thể xóa phiếu này”. |  | Not run |  |  |

| TC ID | Test Title | Màn hình/Chức năng | Pre-condition | Test steps | Expected result | Actual result | Status | Note | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| VOU_KH_01 | Load danh sách KH – không crash khi không có KH phù hợp | Bảng khách hàng (phiếu cá nhân) | Loại phiếu = Cá nhân | 1) Đặt filter để không có KH<br>2) Quan sát bảng | Hiện dòng “Không có khách hàng phù hợp”. |  | Not run |  |  |
| VOU_KH_02 | Tìm theo tên – không phân biệt hoa thường | Filter KH | Có KH | 1) Nhập keyword tên in hoa/thường | Lọc đúng theo `includes(toLowerCase())`. |  | Not run |  |  |
| VOU_KH_03 | Tìm theo SĐT – substring match | Filter KH | Có KH | 1) Nhập một phần SĐT | Lọc đúng theo substring match. |  | Not run | Không có validate “chỉ số” ở FE (cho phép ký tự bất kỳ). |  |
| VOU_KH_04 | Lọc trạng thái KH – chỉ 3 option (VIP/THƯỜNG XUYÊN/MỚI) | Filter KH | Có KH đa dạng | 1) Chọn từng option trong dropdown | Danh sách lọc đúng theo `getLoaiKhachHangKey`. |  | Not run |  |  |
| VOU_KH_05 | Checkbox “chọn tất cả trong trang” hoạt động đúng | Chọn KH | Có >= 2 KH trong 1 trang | 1) Tick checkbox header<br>2) Bỏ tick | Tick: chọn toàn bộ KH của trang; bỏ tick: bỏ chọn toàn bộ KH của trang. |  | Not run |  |  |
| VOU_KH_06 | Không trùng KH đã chọn (unique theo id) | Chọn KH |  | 1) Chọn 1 KH nhiều lần (tick/un-tick…) | Danh sách id chọn luôn unique (`new Set`). |  | Not run | `normalizeCustomerIds` |  |
| VOU_KH_07 | Footer range hiển thị đúng “X–Y trong Z” | Paging KH | Có nhiều KH | 1) Chuyển trang<br>2) Quan sát dòng range | Dòng “Hiển thị startIndex - endIndex trong totalItems khách hàng” cập nhật đúng. |  | Not run |  |  |
| VOU_KH_08 | Pagination KH – dấu ‹ › hoạt động và không vượt biên | Paging KH | Có nhiều trang | 1) Ở trang 1 bấm ‹ (disabled)<br>2) Ở trang cuối bấm › (disabled) | Không cho vượt biên; pageNo tự clamp theo `watch(pageNo)`. |  | Not run |  |  |
| VOU_KH_09 | Danh sách KH đã chọn hiển thị đúng và bỏ chọn được | Selected list | Đã chọn >=1 KH | 1) Chọn vài KH<br>2) Bấm nút × ở list đã chọn | Bỏ chọn đúng KH tương ứng, checkbox trong bảng cập nhật lại. |  | Not run |  |  |
| VOU_KH_10 | Lưu phiếu cá nhân – auto gửi mail sau khi lưu | Save + Mail | Loại phiếu = Cá nhân, KH có email | 1) Chọn KH<br>2) Click `Tạo mới/Cập nhật` | Sau khi lưu, hệ thống gọi API gửi mail; hiện alert success/warning theo kết quả và quay về danh sách. |  | Not run | API: `POST /api/admin/phieu-giam-gia/{id}/gui-mail` |  |

## Test cases – Thêm mới phiếu giảm giá (theo UI ảnh)

| TC ID | Test Title | Màn hình/Chức năng | Pre-condition | Test steps | Expected result | Actual result | Status | Note | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| VOU_ADD_01 | Mở trang thêm mới hiển thị đúng tiêu đề + nút Tạo mới | Thêm phiếu (`/admin/giam-gia/phieu/them`) | Đăng nhập Admin | 1) Truy cập `/admin/giam-gia/phieu/them` | Hiển thị tiêu đề “THÊM PHIẾU GIẢM GIÁ” và nút `Hủy` + `Tạo mới`. |  | Not run | Theo ảnh bạn gửi |  |
| VOU_ADD_02 | Mã phiếu giảm giá hiển thị placeholder và readonly | Thêm phiếu |  | 1) Quan sát field “Mã phiếu giảm giá”<br>2) Thử focus + gõ | Field readonly; placeholder “Mã sẽ được hệ thống tự động tạo...” (hoặc tương tự). |  | Not run | FE không validate field này khi lưu; BE sinh mã. |  |
| VOU_ADD_03 | Giá trị mặc định khi vào form | Thêm phiếu |  | 1) Vào trang thêm mới | - `Hình thức giảm` mặc định **VNĐ** (`hinhThucGiam=false`)<br>- `Giá trị giảm (VNĐ)` mặc định 0<br>- `Số lượng sử dụng` mặc định 0, `Vô hạn` tắt<br>- `Ngày bắt đầu` auto = ngày hiện tại<br>- `Ngày kết thúc` rỗng<br>- `Loại phiếu` mặc định **Công khai** |  | Not run | Default từ `form` trong `VoucherFormPage.vue`. |  |
| VOU_ADD_04 | Đổi hình thức giảm VNĐ -> % đổi đúng label và loại input | Thêm phiếu |  | 1) Chọn radio `%` | Label đổi thành “Giá trị giảm (%)”; input đổi sang type number, placeholder “1 - 100”. |  | Not run | Theo `VoucherForm.vue`. |  |
| VOU_ADD_05 | Đổi hình thức giảm reset giá trị liên quan | Thêm phiếu |  | 1) Ở VNĐ, nhập giá trị giảm (VNĐ)<br>2) Chuyển sang % | Reset `giaTriGiamGia=0` và `soTienGiamToiDa=0` (field hiển thị về 0). |  | Not run | `handleTypeChange`. |  |
| VOU_ADD_06 | Nhập % > 100 tự clamp về 100 | Thêm phiếu | Chọn % | 1) Nhập `101` vào “Giá trị giảm (%)” | UI tự đưa về 100. |  | Not run | `update()` clamp. |  |
| VOU_ADD_07 | Không cho nhập số âm ở các trường số | Thêm phiếu |  | 1) Nhập `-1` cho `%` hoặc cho “Hóa đơn tối thiểu” hoặc “Số lượng sử dụng” | Giá trị hiển thị bị đưa về 0. |  | Not run | `update()` chặn `<0`. |  |
| VOU_ADD_08 | “Vô hạn” (phiếu công khai) disable input số lượng và set 999999 | Thêm phiếu | Loại phiếu = Công khai | 1) Bật switch `Vô hạn` | Input “Số lượng sử dụng” bị disable; payload khi lưu có `soLuongSuDung=999999`. |  | Not run | `handleUnlimitedChange` + `handleSave` payload. |  |
| VOU_ADD_09 | “Vô hạn” bị disable khi loại phiếu = Cá nhân | Thêm phiếu |  | 1) Chọn loại phiếu `Cá nhân` | Switch `Vô hạn` bị disable. |  | Not run | `:disabled="... loaiPhieuGiamGia === true"`. |  |
| VOU_ADD_10 | Chọn loại phiếu Cá nhân hiện bảng khách hàng bên dưới form | Thêm phiếu | Có API danh sách KH | 1) Chọn `Cá nhân` | Bên dưới form hiển thị khu vực chọn KH: nút `Làm mới`, search tên/SĐT, filter trạng thái, bảng KH + phân trang + “Đã chọn: X khách hàng”. |  | Not run | Theo ảnh bạn gửi + `VoucherFormPage.vue`. |  |
| VOU_ADD_11 | Chuyển Cá nhân -> Công khai sẽ clear danh sách KH đã chọn và reset filter KH | Thêm phiếu | Đã chọn vài KH | 1) Đang ở `Cá nhân`, chọn vài KH<br>2) Chuyển về `Công khai` | Khu vực KH biến mất; `selectedCustomerIds=[]`; filter KH được reset (tên/sđt/trạng thái về rỗng). |  | Not run | `watch(loaiPhieuGiamGia)`. |  |
| VOU_ADD_12 | Nút Hủy quay về danh sách, không tạo mới | Thêm phiếu |  | 1) Nhập vài dữ liệu<br>2) Bấm `Hủy` | Điều hướng về `/admin/giam-gia/phieu` (không gửi request). |  | Not run | `goBack()`. |  |
| VOU_ADD_13 | Validate khi tạo mới – thiếu Tên phiếu báo warning | Thêm phiếu / Validate |  | 1) Để trống “Tên giảm giá”<br>2) Bấm `Tạo mới` | Popup warning “Vui lòng nhập tên phiếu”. |  | Not run | `handleSave()`. |  |
| VOU_ADD_14 | Validate khi tạo mới – thiếu ngày bắt đầu/kết thúc báo warning | Thêm phiếu / Validate |  | 1) Bỏ trống 1 trong 2 ngày<br>2) Bấm `Tạo mới` | Popup warning “Vui lòng chọn đủ ngày bắt đầu/kết thúc”. |  | Not run |  |  |
| VOU_ADD_15 | Validate khi tạo mới – ngày kết thúc < ngày bắt đầu báo warning | Thêm phiếu / Validate |  | 1) Chọn `Ngày kết thúc` nhỏ hơn `Ngày bắt đầu`<br>2) Bấm `Tạo mới` | Popup warning “Ngày kết thúc phải >= ngày bắt đầu”. |  | Not run |  |  |
| VOU_ADD_16 | Validate khi tạo mới (phiếu cá nhân) – chưa chọn KH báo warning | Thêm phiếu / Validate | Loại phiếu = Cá nhân | 1) Không chọn KH<br>2) Bấm `Tạo mới` | Popup warning “Vui lòng chọn ít nhất một khách hàng cho phiếu cá nhân”. |  | Not run |  |  |
| VOU_ADD_17 | Tạo mới phiếu công khai thành công | Thêm phiếu / Submit | Điền form hợp lệ, loại phiếu = Công khai | 1) Nhập tên + ngày hợp lệ + các số hợp lệ<br>2) Bấm `Tạo mới` | Hiện success “Dữ liệu đã được lưu!” và quay về `/admin/giam-gia/phieu`. |  | Not run | API: `POST /api/admin/phieu-giam-gia`. |  |
| VOU_ADD_18 | Tạo mới phiếu cá nhân thành công + auto gửi mail | Thêm phiếu / Submit | Loại phiếu = Cá nhân, chọn KH | 1) Chọn vài KH<br>2) Bấm `Tạo mới` | - Lưu phiếu thành công<br>- Tự gọi API gửi mail và hiển thị message theo `soLuongGuiThanhCong/soLuongBoQua`<br>- Quay về danh sách |  | Not run | Có thể hiện warning nếu gửi mail lỗi nhưng phiếu vẫn lưu. |  |
| VOU_ADD_19 | Khi đang tạo mới: nút Tạo mới bị disable và text đổi “Đang xử lý...” | Thêm phiếu / UX |  | 1) Bấm `Tạo mới` và quan sát trong lúc chờ API | Nút `Tạo mới` disabled; text “Đang xử lý...”; tránh submit nhiều lần. |  | Not run | `isSaving`. |  |
| VOU_ADD_20 | Lỗi API khi tạo mới hiển thị thông báo lỗi | Thêm phiếu / Error handling | Có thể giả lập API lỗi | 1) Bấm `Tạo mới` khi API lỗi | Popup error “Không thể lưu dữ liệu” (hoặc message BE trả về). |  | Not run | `e.response.data.detail/message`. |  |
