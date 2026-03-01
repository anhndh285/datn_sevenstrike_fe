<!-- File: src/pages/sales/SalesPage.vue -->
<template>
  <div class="ss-page ss-font ss-pos">
    <!-- HEAD -->
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Bán hàng</div>
        <div class="ss-subtitle">
          Người bán:
          <span class="ss-seller-name">{{ nguoiBanTen || "—" }}</span>
        </div>
      </div>

      <div class="ss-head-right">
        <button
          class="btn ss-btn-primary"
          type="button"
          @click="createOrderTab"
          :disabled="submitting"
        >
          <span class="material-icons-outlined" style="font-size: 18px">add</span>
          Tạo đơn hàng
        </button>
      </div>
    </div>

    <!-- TOAST -->
    <div v-if="toast.show" class="ss-toast" :class="toast.type">
      <div class="ss-toast-left">
        <span class="ss-toast-dot"></span>
      </div>
      <div class="ss-toast-msg">{{ toast.msg }}</div>
      <button class="ss-toast-x" type="button" @click="hideToast">×</button>
    </div>

    <!-- ========================= EMPTY: CHƯA CÓ ĐƠN HÀNG ========================= -->
    <div v-if="!hasOrders" class="ss-card ss-border ss-card-main">
      <div class="ss-empty-wrap">
        <div class="ss-empty-icon" aria-hidden="true">
          <svg width="54" height="54" viewBox="0 0 64 64">
            <path
              d="M18 22h28c2.2 0 4 1.8 4 4v22c0 4.4-3.6 8-8 8H22c-4.4 0-8-3.6-8-8V26c0-2.2 1.8-4 4-4z"
              fill="#d1d5db"
            />
            <path
              d="M24 22c0-4.4 3.6-8 8-8s8 3.6 8 8"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="6"
              stroke-linecap="round"
            />
            <path d="M26 28h12" stroke="#e5e7eb" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>
        <div class="ss-empty-text">Chưa có đơn hàng</div>
      </div>
    </div>

    <!-- ========================= ORDER UI (có đơn hàng) ========================= -->
    <template v-else>
      <!-- TABS -->
      <div class="ss-tabs">
        <div class="ss-tab-list">
          <button
            v-for="(t, idx) in tabs"
            :key="t.id"
            class="ss-tab"
            :class="{ active: idx === activeTab }"
            type="button"
            @click="switchTab(idx)"
          >
            <span class="ss-tab-name">
              {{ t.name }}
              <span
                v-if="tabItemCount(t) > 0"
                class="ss-tab-badge"
                :title="`Đơn có ${tabItemCount(t)} sản phẩm`"
              >
                {{ tabItemCount(t) }}
              </span>
            </span>

            <span class="ss-tab-x" title="Đóng" @click.stop="closeTab(idx)">×</span>
          </button>
        </div>
      </div>

      <!-- MAIN CARD -->
      <div class="ss-card ss-border ss-card-main">
        <!-- Product Section Head -->
        <div class="ss-section-head">
          <div class="ss-section-title">Sản phẩm</div>

          <div class="ss-section-actions">
            <button class="btn ss-btn-outline" type="button" @click="openQrModal">
              QUÉT QR SẢN PHẨM
            </button>
            <button class="btn ss-btn-primary" type="button" @click="openCtspModal">
              THÊM SẢN PHẨM
            </button>
          </div>
        </div>

        <!-- Cart -->
        <div class="ss-cart-box ss-border">
          <div v-if="cartItems.length === 0" class="ss-empty-wrap ss-empty-cart">
            <div class="ss-empty-icon" aria-hidden="true">
              <svg width="54" height="54" viewBox="0 0 64 64">
                <path
                  d="M18 22h28c2.2 0 4 1.8 4 4v22c0 4.4-3.6-8-8-8H22c-4.4 0-8-3.6-8-8V26c0-2.2 1.8-4 4-4z"
                  fill="#d1d5db"
                />
                <path
                  d="M24 22c0-4.4 3.6-8 8-8s8 3.6 8 8"
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="6"
                  stroke-linecap="round"
                />
                <path d="M26 28h12" stroke="#e5e7eb" stroke-width="4" stroke-linecap="round" />
              </svg>
            </div>
            <div class="ss-empty-text ss-empty-eng">Không có dữ liệu</div>
          </div>

          <div v-else class="ss-cart-list">
            <div v-for="it in cartItems" :key="it.id" class="ss-cart-item">
              <input class="ss-cart-check" type="checkbox" v-model="it.checked" :disabled="!hasPermission" />

              <div class="ss-cart-thumb thumb-wrap">
                <img
                  v-if="resolveImage(it.anhUrl)"
                  :src="resolveImage(it.anhUrl)"
                  class="ss-thumb-img"
                  alt=""
                  @error="onImgErr"
                />
                <div v-else class="ss-thumb-ph"></div>

                <span
                  v-if="getPhanTramGiamDisplay(it) > 0"
                  class="discount-badge sm"
                  :title="getGiamGiaTitle(it)"
                >
                  -{{ getPhanTramGiamDisplay(it) }}%
                </span>
              </div>

              <div class="ss-cart-info">
                <div class="ss-cart-name">{{ it.tenSanPham }}</div>
                <div class="ss-cart-sub">
                  <span class="ss-cart-code">{{ it.maCtsp }}</span>
                  <span class="ss-dot">•</span>
                  <span>{{ it.mauSac }}</span>
                  <span class="ss-dot">•</span>
                  <span>{{ it.kichCo }}</span>
                </div>
              </div>

              <div class="ss-cart-price">
                <div v-if="showGiaGoc(it)" class="ss-price-old">
                  {{ formatMoney(getGiaGoc(it)) }}
                </div>
                <div class="ss-price-now">
                  {{ formatMoney(getGiaThucTe(it)) }}
                </div>
              </div>

              <div class="ss-cart-qty">
                <button
                  class="ss-qty-btn"
                  type="button"
                  @click="decQty(it)"
                  :disabled="Number(it.qty || 1) <= 1 || !hasPermission"
                >
                  -
                </button>

                <input
                  class="ss-qty-input"
                  type="text"
                  :value="String(it.qty || 1)"
                  :title="`Tối đa: ${getMaxQtyForItem(it)}`"
                  :disabled="!hasPermission"
                  @input="onQtyInput(it, $event)"
                  @blur="onQtyBlur(it)"
                />

                <button
                  class="ss-qty-btn"
                  type="button"
                  @click="incQty(it)"
                  :disabled="Number(it.qty || 1) >= getMaxQtyForItem(it) || !hasPermission"
                  :title="
                    Number(it.qty || 1) >= getMaxQtyForItem(it)
                      ? 'Đã đạt tồn tối đa'
                      : 'Tăng số lượng'
                  "
                >
                  +
                </button>
              </div>

              <button class="ss-trash" type="button" title="Xóa" @click="removeItem(it.id)" :disabled="!hasPermission">
                <span class="material-icons-outlined">delete</span>
              </button>
            </div>

            <div class="ss-cart-total">
              <div class="ss-cart-total-label">Tổng tiền</div>
              <div class="ss-cart-total-val">
                {{ formatMoney(tongTienHang) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom: chỉ hiện khi đã có sản phẩm -->
        <div v-if="cartItems.length > 0" class="ss-bottom-grid">
          <!-- Customer card -->
          <div class="ss-panel ss-border">
            <div class="ss-panel-head">
              <div class="ss-panel-title">Thông tin khách hàng</div>

              <div class="ss-panel-actions">
                <button class="btn ss-btn-outline" type="button" @click="openKhModal">
                  Chọn khách hàng
                </button>

                <button
                  class="btn ss-btn-outline"
                  type="button"
                  :disabled="!isCounter || !selectedKh"
                  @click="chonKhachVangLai"
                  title="Chuyển về khách vãng lai (không cần tạo đơn mới)"
                >
                  Khách vãng lai
                </button>

                <button
                  class="btn ss-btn-outline"
                  type="button"
                  :disabled="!isCounter || !selectedKh || diaChiList.length <= 1"
                  @click="openDiaChiModal"
                  title="Chỉ bật khi giao hàng và khách có nhiều địa chỉ"
                >
                  Chọn địa chỉ
                </button>
              </div>
            </div>

            <div class="ss-panel-body">
              <!-- ✅ TẠI QUẦY (OFF) -->
              <template v-if="!isCounter">
                <div class="ss-kv">
                  <div class="ss-k">Tên khách hàng</div>
                  <div class="ss-v">
                    {{ selectedKh ? getKhName(selectedKh) : "Khách lẻ" }}
                  </div>
                </div>
                <div class="ss-hint">Tại quầy: chỉ cần chọn sản phẩm và thanh toán.</div>
              </template>

              <!-- ✅ GIAO HÀNG (ON) -->
              <template v-else>
                <!-- ĐÃ CHỌN KH -->
                <template v-if="selectedKh">
                  <div class="ss-kv">
                    <div class="ss-k">Tên khách hàng</div>
                    <div class="ss-v">{{ getKhName(selectedKh) }}</div>
                  </div>

                  <div class="ss-kv">
                    <div class="ss-k">Số điện thoại</div>
                    <div class="ss-v">{{ getKhPhone(selectedKh) || "—" }}</div>
                  </div>

                  <div class="ss-kv">
                    <div class="ss-k">Email</div>
                    <div class="ss-v">{{ getKhEmail(selectedKh) || "—" }}</div>
                  </div>

                  <div class="ss-kv">
                    <div class="ss-k">Địa chỉ giao hàng</div>
                    <div class="ss-v">
                      <span v-if="selectedDiaChi">{{ renderDiaChi(selectedDiaChi) }}</span>
                      <span v-else>Chưa chọn địa chỉ.</span>
                    </div>
                  </div>
                </template>

                <!-- KHÁCH VÃNG LAI -->
                <template v-else>
                  <div class="ss-guest-hint">Khách vãng lai (không cần tạo tài khoản)</div>

                  <div class="ss-guest-grid">
                    <div class="ss-field">
                      <div class="ss-filter-label">Tên khách hàng</div>
                      <input
                        v-model.trim="guest.tenKhachHang"
                        class="form-control ss-input"
                        placeholder="Nhập tên khách..."
                        :disabled="!hasPermission"
                      />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Số điện thoại</div>
                      <input
                        v-model="guest.soDienThoai"
                        class="form-control ss-input"
                        placeholder="Nhập số điện thoại..."
                        @input="onGuestPhoneInput"
                        :disabled="!hasPermission"
                      />
                    </div>

                    <div class="ss-field ss-guest-full">
                      <div class="ss-filter-label">Địa chỉ cụ thể</div>
                      <input
                        v-model.trim="guest.diaChiCuThe"
                        class="form-control ss-input"
                        placeholder="Số nhà, ngõ, đường..."
                        :disabled="!hasPermission"
                      />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Tỉnh/Thành phố</div>
                      <input
                        v-model.trim="guest.tinhThanh"
                        class="form-control ss-input"
                        list="ss-tinh-list"
                        placeholder="Chọn Tỉnh/Thành phố..."
                        :disabled="!hasPermission"
                      />
                      <datalist id="ss-tinh-list">
                        <option v-for="x in tinhOptions" :key="x" :value="x" />
                      </datalist>
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Huyện/Quận</div>
                      <input
                        v-model.trim="guest.huyenQuan"
                        class="form-control ss-input"
                        list="ss-huyen-list"
                        placeholder="Chọn Huyện/Quận..."
                        :disabled="!hasPermission"
                      />
                      <datalist id="ss-huyen-list">
                        <option v-for="x in huyenOptions" :key="x" :value="x" />
                      </datalist>
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Xã/Phường</div>
                      <input
                        v-model.trim="guest.xaPhuong"
                        class="form-control ss-input"
                        list="ss-xa-list"
                        placeholder="Chọn Xã/Phường..."
                        :disabled="!hasPermission"
                      />
                      <datalist id="ss-xa-list">
                        <option v-for="x in xaOptions" :key="x" :value="x" />
                      </datalist>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <!-- Payment card -->
          <div class="ss-panel ss-border">
            <div class="ss-panel-head">
              <div class="ss-panel-title">Thông tin thanh toán</div>

              <!-- ✅ Switch: OFF = tại quầy, ON = giao hàng -->
              <div class="ss-ship-toggle">
                <span class="ss-toggle-label">{{ isCounter ? "Giao hàng" : "Tại quầy" }}</span>
                <label class="ss-switch">
                  <input type="checkbox" v-model="isCounter" :disabled="!hasPermission" />
                  <span class="ss-slider"></span>
                </label>
              </div>
            </div>

            <div class="ss-panel-body">
              <!-- Voucher input -->
              <div class="ss-voucher-row">
                <div class="ss-field grow">
                  <div class="ss-filter-label">Mã phiếu giảm giá</div>
                  <input
                    v-model.trim="voucherCode"
                    class="form-control ss-input"
                    placeholder="Nhập mã (Enter để áp dụng)"
                    @keyup.enter="applyVoucherCode"
                    :disabled="!hasPermission"
                  />
                </div>

                <div class="ss-field ss-voucher-val">
                  <div class="ss-filter-label">Giá trị</div>
                  <input class="form-control ss-input" :value="voucherValueText" disabled />
                </div>
              </div>

              <div v-if="effectiveVoucher && tongTienHang > 0" class="ss-voucher-auto">
                <div class="ss-voucher-auto-line">
                  Áp dụng thành công phiếu giảm giá
                  <span class="ss-voucher-strong">{{ getVoucherLabel(effectiveVoucher) }}</span>
                </div>
                <div class="ss-voucher-auto-sub">
                  Giảm {{ formatMoney(giamGia) }}
                  <span v-if="voucherManual" class="ss-voucher-tag">Đã nhập mã</span>
                </div>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Tiền hàng</div>
                <div class="ss-pay-v">{{ formatMoney(tongTienHang) }}</div>
              </div>

              <!-- ✅ Phí vận chuyển: chỉ hiện khi GIAO HÀNG -->
              <div v-if="isCounter" class="ss-pay-kv">
                <div class="ss-pay-k">Phí vận chuyển</div>
                <div class="ss-pay-v ss-pay-inline">
                  <input
                    class="form-control ss-input ss-ship-fee"
                    type="text"
                    :value="phiVanChuyenText"
                    @input="onShipFeeInput"
                    placeholder="0"
                    :disabled="!hasPermission"
                  />
                  <span class="ss-currency">đ</span>
                </div>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Giảm giá</div>
                <div class="ss-pay-v ss-red">- {{ formatMoney(giamGia) }}</div>
              </div>

              <div class="ss-pay-kv ss-pay-total">
                <div class="ss-pay-k">Tổng số tiền</div>
                <div class="ss-pay-v">{{ formatMoney(tongPhaiTra) }}</div>
              </div>

              <!-- ✅ Thanh toán (tại quầy + giao hàng) -->
              <div class="ss-pay-kv">
                <div class="ss-pay-k ss-pay-k-strong">
                  Khách thanh toán
                  <button
                    class="ss-icon-btn ss-icon-inline"
                    type="button"
                    title="Nhập thanh toán"
                    @click="openPayModal"
                  >
                    <span class="material-icons-outlined">payments</span>
                  </button>
                </div>

                <div class="ss-pay-v">{{ formatMoney(khachThanhToan) }}</div>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Tiền thiếu</div>
                <div class="ss-pay-v">{{ formatMoney(tienThieu) }}</div>
              </div>

              <button
                class="btn ss-btn-primary ss-confirm"
                type="button"
                :disabled="!canSubmit"
                @click="openSubmitConfirm"
              >
                XÁC NHẬN ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========================= MODAL: CHỌN CTSP ========================= -->
    <div v-if="showCtspModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-lg" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Chọn biến thể để thêm vào đơn</div>
          <button class="ss-x" type="button" @click="closeCtspModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-filter">
            <div class="ss-field grow">
              <div class="ss-filter-label">Tìm kiếm</div>
              <input
                v-model.trim="ctspFilter.keyword"
                class="form-control ss-input"
                placeholder="Tìm mã, tên, màu, kích cỡ..."
                :disabled="!hasPermission"
              />
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Màu sắc</div>
              <select v-model="ctspFilter.mauSac" class="form-select ss-input" :disabled="!hasPermission">
                <option value="">Tất cả màu</option>
                <option v-for="m in ctspMauSacOptions" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Kích cỡ</div>
              <select v-model="ctspFilter.kichCo" class="form-select ss-input" :disabled="!hasPermission">
                <option value="">Tất cả kích cỡ</option>
                <option v-for="k in ctspKichCoOptions" :key="k" :value="k">
                  {{ k }}
                </option>
              </select>
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Sản phẩm</div>
              <select v-model="ctspFilter.tenSanPham" class="form-select ss-input" :disabled="!hasPermission">
                <option value="">Tất cả sản phẩm</option>
                <option v-for="p in ctspSanPhamOptions" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </div>

            <button class="btn ss-btn-outline ss-reset" type="button" @click="resetCtspFilter" :disabled="!hasPermission">
              Đặt lại
            </button>
          </div>

          <div class="ss-table-wrap">
            <table class="table ss-table mb-0">
              <thead>
                <tr>
                  <th class="col-stt">STT</th>
                  <th class="col-code">Mã</th>
                  <th class="col-img">Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Màu sắc</th>
                  <th>Kích cỡ</th>
                  <th class="col-qty">Số lượng</th>
                  <th class="col-price">Giá bán</th>
                  <th class="col-action">Hành động</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(row, idx) in pagedCtsp" :key="row.id">
                  <td class="col-stt">
                    {{ (ctspPage - 1) * ctspPageSize + idx + 1 }}
                  </td>
                  <td class="col-code">{{ row.maCtsp }}</td>
                  <td class="col-img">
                    <div class="ss-thumb thumb-wrap">
                      <img
                        v-if="resolveImage(row.anhUrl)"
                        :src="resolveImage(row.anhUrl)"
                        class="ss-thumb-img"
                        alt=""
                        @error="onImgErr"
                      />
                      <div v-else class="ss-thumb-ph"></div>

                      <span
                        v-if="getPhanTramGiamDisplay(row) > 0"
                        class="discount-badge sm"
                        :title="getGiamGiaTitle(row)"
                      >
                        -{{ getPhanTramGiamDisplay(row) }}%
                      </span>
                    </div>
                  </td>
                  <td>{{ row.tenSanPham }}</td>
                  <td>{{ row.mauSac }}</td>
                  <td>{{ row.kichCo }}</td>

                  <!-- đúng: hiển thị tồn còn lại theo phiên (local) + tooltip tồn DB -->
                  <td class="col-qty" :title="`Tồn kho DB: ${Number(row.soLuong || 0)}`">
                    {{ Number(row.__available || 0) }}
                  </td>

                  <td class="col-price">
                    <div v-if="showGiaGoc(row)" class="ss-price-old">
                      {{ formatMoney(getGiaGoc(row)) }}
                    </div>
                    <div class="ss-price-now">
                      {{ formatMoney(getGiaThucTe(row)) }}
                    </div>
                  </td>

                  <td class="col-action">
                    <div class="ss-pick-wrap">
                      <input
                        class="form-control ss-input ss-pick-qty"
                        type="text"
                        :value="String(ctspPickQty[row.id] ?? 1)"
                        :disabled="Number(row.__available || 0) <= 0 || !hasPermission"
                        @input="onCtspPickQtyInput(row, $event)"
                        :title="`Tối đa có thể thêm: ${Number(row.__available || 0)}`"
                      />

                      <button
                        class="btn ss-btn-outline ss-btn-mini"
                        type="button"
                        @click="pickCtsp(row, ctspPickQty[row.id] ?? 1)"
                        :disabled="Number(row.__available || 0) <= 0 || !hasPermission"
                        :title="Number(row.__available || 0) <= 0 ? 'Hết hàng' : 'Thêm vào đơn'"
                      >
                        Thêm
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="pagedCtsp.length === 0">
                  <td colspan="9" class="ss-empty-row">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ss-pagi">
            <div class="ss-pageinfo">
              Trang {{ ctspPage }} / {{ ctspTotalPages }} ·
              {{ filteredCtsp.length }} biến thể
            </div>
            <div class="ss-pagebtns">
              <button
                class="btn ss-btn-outline ss-btn-mini"
                type="button"
                :disabled="ctspPage <= 1"
                @click="ctspPage--"
              >
                Trước
              </button>
              <button
                class="btn ss-btn-outline ss-btn-mini"
                type="button"
                :disabled="ctspPage >= ctspTotalPages"
                @click="ctspPage++"
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="closeCtspModal">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: QR ========================= -->
    <div v-if="showQrModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Quét QR sản phẩm</div>
          <button class="ss-x" type="button" @click="closeQrModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-qr-hint">Đưa QR vào khung, hệ thống sẽ tự nhận và thêm CTSP vào đơn.</div>

          <div class="ss-qr-wrap">
            <div id="ss-qr-reader" class="ss-qr-reader"></div>
          </div>

          <div v-if="qrError" class="ss-api-hint">{{ qrError }}</div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="restartQr">Quét lại</button>
          <button class="btn ss-btn-primary" type="button" @click="closeQrModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CHỌN KH ========================= -->
    <div v-if="showKhModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-kh" role="dialog" aria-modal="true">
        <div class="ss-modal-head ss-kh-head">
          <div class="ss-modal-title">Chọn khách hàng</div>
          <button class="ss-x" type="button" @click="closeKhModal">×</button>
        </div>

        <div class="ss-modal-body ss-kh-body">
          <div class="ss-kh-top">
            <input
              v-model.trim="khFilter.keyword"
              class="form-control ss-kh-search"
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
            />
            <button class="btn ss-kh-reload" type="button" @click="reloadKh">Tải lại</button>
          </div>

          <div v-if="khErr" class="ss-api-hint">{{ khErr }}</div>

          <div v-else class="ss-kh-tablewrap">
            <table class="table ss-kh-table mb-0">
              <thead>
                <tr>
                  <th class="kh-col-stt">#</th>
                  <th class="kh-col-name">Tên khách</th>
                  <th class="kh-col-phone">Số điện thoại</th>
                  <th class="kh-col-addr">Địa chỉ</th>
                  <th class="kh-col-act">Hành động</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(k, idx) in filteredKh" :key="k.id">
                  <td class="kh-col-stt">{{ idx + 1 }}</td>
                  <td class="kh-col-name">{{ getKhName(k) }}</td>
                  <td class="kh-col-phone">{{ getKhPhone(k) }}</td>
                  <td class="kh-col-addr">
                    {{ khAddrCache[k.id] || renderKhDiaChi(k) || "—" }}
                  </td>
                  <td class="kh-col-act">
                    <button class="btn ss-kh-pick" type="button" @click="pickKh(k)" :disabled="!hasPermission">Chọn</button>
                  </td>
                </tr>

                <tr v-if="filteredKh.length === 0">
                  <td colspan="5" class="ss-empty-row">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ss-kh-foot">
            <button class="btn ss-kh-close" type="button" @click="closeKhModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CHỌN ĐỊA CHỈ ========================= -->
    <div v-if="showDiaChiModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Chọn địa chỉ</div>
          <button class="ss-x" type="button" @click="closeDiaChiModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div v-if="dcErr" class="ss-api-hint">{{ dcErr }}</div>

          <div v-else class="ss-dc-list">
            <button
              v-for="dc in diaChiList"
              :key="dc.id"
              class="ss-dc-item"
              :class="{ active: selectedDiaChi && selectedDiaChi.id === dc.id }"
              type="button"
              @click="pickDiaChi(dc)"
              :disabled="!hasPermission"
            >
              <div class="ss-dc-line">
                <span class="ss-dc-name">{{
                  dc.hoTenNguoiNhan || getKhName(selectedKh) || "Khách"
                }}</span>
                <span v-if="dc.macDinh" class="ss-badge">Mặc định</span>
              </div>
              <div class="ss-dc-text">{{ renderDiaChi(dc) }}</div>
            </button>

            <div v-if="diaChiList.length === 0" class="ss-empty-row">Khách hàng chưa có địa chỉ.</div>
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="closeDiaChiModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: THANH TOÁN ========================= -->
    <div v-if="showPayModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-pay" role="dialog" aria-modal="true">
        <div class="ss-modal-head ss-pay-head">
          <div class="ss-modal-title">Thanh toán</div>
          <button class="ss-x" type="button" @click="closePayModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-paybox">
            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tổng số tiền</div>
              <div class="ss-paybox-v ss-paybox-red">{{ formatMoney(tongPhaiTra) }}</div>
            </div>

            <div class="ss-paygrid">
              <div class="ss-field">
                <div class="ss-label-row">
                  <div class="ss-label">Tiền mặt</div>
                  <button class="ss-link" type="button" @click="fillPayConLai('TIEN_MAT')" :disabled="!hasPermission">
                    Còn lại
                  </button>
                </div>
                <input
                  :value="payTienMatText"
                  type="text"
                  class="form-control ss-input"
                  placeholder="Nhập tiền mặt..."
                  @input="onPayTienMatInput"
                  :disabled="!hasPermission"
                />
              </div>

              <div class="ss-field">
                <div class="ss-label-row">
                  <div class="ss-label">Chuyển khoản</div>
                  <button class="ss-link" type="button" @click="fillPayConLai('CHUYEN_KHOAN')" :disabled="!hasPermission">
                    Còn lại
                  </button>
                </div>
                <input
                  :value="payChuyenKhoanText"
                  type="text"
                  class="form-control ss-input"
                  placeholder="Nhập chuyển khoản..."
                  @input="onPayChuyenKhoanInput"
                  :disabled="!hasPermission"
                />
              </div>
            </div>

            <div v-if="payChuyenKhoanNum > 0" class="ss-field ss-mt-8">
              <div class="ss-label">Mã tham chiếu</div>
              <input
                v-model.trim="payMaThamChieu"
                type="text"
                class="form-control ss-input"
                placeholder="VD: CK123..."
                :disabled="!hasPermission"
              />
            </div>

            <div class="ss-paybox-row ss-mt-8">
              <div class="ss-paybox-k">Đã nhập</div>
              <div class="ss-paybox-v">{{ formatMoney(payTotalNum) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tiền thiếu</div>
              <div class="ss-paybox-v">{{ formatMoney(Math.max(0, tongPhaiTra - payTotalNum)) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tiền thừa</div>
              <div class="ss-paybox-v">{{ formatMoney(Math.max(0, payTotalNum - tongPhaiTra)) }}</div>
            </div>

            <div class="ss-pay-note">
              <div class="ss-pay-note-line" v-if="payTienMatNum > 0 && payChuyenKhoanNum > 0">
                Hình thức: Kết hợp (tiền mặt + chuyển khoản)
              </div>
              <div class="ss-pay-note-line" v-else-if="payChuyenKhoanNum > 0">
                Hình thức: Chuyển khoản
              </div>
              <div class="ss-pay-note-line" v-else-if="payTienMatNum > 0">
                Hình thức: Tiền mặt
              </div>
            </div>
          </div>
        </div>

        <div class="ss-modal-actions ss-pay-actions">
          <button class="btn ss-btn-outline" type="button" @click="closePayModal">Đóng</button>
          <button class="btn ss-btn-primary" type="button" @click="confirmPay" :disabled="!hasPermission">Xong</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CONFIRM ĐẶT HÀNG ========================= -->
    <div v-if="showSubmitConfirmModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Xác nhận đặt hàng</div>
          <button class="ss-x" type="button" @click="closeSubmitConfirm">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-paybox">
            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Loại đơn</div>
              <div class="ss-paybox-v">{{ isCounter ? "Giao hàng" : "Tại quầy" }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tiền hàng</div>
              <div class="ss-paybox-v">{{ formatMoney(tongTienHang) }}</div>
            </div>

            <div v-if="isCounter" class="ss-paybox-row">
              <div class="ss-paybox-k">Phí vận chuyển</div>
              <div class="ss-paybox-v">{{ formatMoney(phiVanChuyenNum) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Giảm giá</div>
              <div class="ss-paybox-v">- {{ formatMoney(giamGia) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tổng phải trả</div>
              <div class="ss-paybox-v ss-paybox-red">{{ formatMoney(tongPhaiTra) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Khách thanh toán</div>
              <div class="ss-paybox-v">{{ formatMoney(khachThanhToan) }}</div>
            </div>
          </div>

          <div class="ss-api-hint" style="margin-top: 10px">
            Bạn có chắc muốn xác nhận? Sau khi xác nhận, hệ thống sẽ lưu/chốt đơn và cập nhật tồn kho.
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="closeSubmitConfirm">Hủy</button>
          <button
            class="btn ss-btn-primary"
            type="button"
            :disabled="submitting || !hasPermission"
            @click="confirmSubmitOrder"
          >
            {{ submitting ? "Đang xử lý..." : "Xác nhận" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import SalesService from "@/services/sales/salesService.js";
import apiClient from "@/services/apiClient";

import { useBanHangHoaDonSubmit } from "./composables/useBanHangHoaDonSubmit";
import { useBanHangKhachHang } from "./composables/useBanHangKhachHang";
import { useBanHangQr } from "./composables/useBanHangQr";
import { useBanHangSanPham } from "./composables/useBanHangSanPham";
import { useBanHangTabs } from "./composables/useBanHangTabs";
import { useBanHangTienIch } from "./composables/useBanHangTienIch";
import { useBanHangToast } from "./composables/useBanHangToast";
import { useBanHangTonKho } from "./composables/useBanHangTonKho";
import { useBanHangVoucherThanhToan } from "./composables/useBanHangVoucherThanhToan";
import { useBanHangQuyenCaLam } from "./composables/useBanHangQuyenCaLam";

defineOptions({ name: "SalesPage" });

const router = useRouter();

/* =========================
   TOAST + TIỆN ÍCH
========================= */
const { toast, showToast, hideToast } = useBanHangToast();
const tienIch = useBanHangTienIch();

/* =========================
   QUYỀN CA LÀM (CHỈ XEM / THAO TÁC)
========================= */
const quyenCaLam = useBanHangQuyenCaLam();
const hasPermission = quyenCaLam.hasPermission;

/* =========================
   CORE STATE
========================= */
const nguoiBan = ref(null);
const isCounter = ref(false); // OFF=tại quầy | ON=giao hàng
const cartItems = ref([]);

/* =========================
   TỒN KHO LOCAL
========================= */
const tonKho = useBanHangTonKho({ safeParse: tienIch.safeParse });

/* =========================
   PLACEHOLDER callbacks (tránh vòng phụ thuộc)
========================= */
let scheduleAutoVoucher = () => {};
let scheduleSyncHoaDon = () => {};
let persistActiveTab = () => {};
let persistTabs = () => {};
let applyTabState = () => {};

/* =========================
   KHÁCH HÀNG
========================= */
const kh = useBanHangKhachHang({
  SalesService,
  isCounter,
  showToast,
  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  persistActiveTab: () => persistActiveTab(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
  blurActive: tienIch.blurActive,
});

/* =========================
   SẢN PHẨM / GIỎ HÀNG
========================= */
const sp = useBanHangSanPham({
  SalesService,
  apiClient,
  cartItems,

  // tồn local
  getAvailableQtyByCtspId: tonKho.getAvailableQtyByCtspId,
  getBaseQtyByCtspId: tonKho.getBaseQtyByCtspId,
  capNhatTonLocal: tonKho.capNhatTonLocal,
  dongBoTonKhoTuApi: tonKho.dongBoTonKhoTuApi,
  persistCtspBaseQtyMap: tonKho.persistCtspBaseQtyMap,

  // helpers + toast
  showToast,
  clampInt: tienIch.clampInt,
  safeParse: tienIch.safeParse,
  resolveImage: tienIch.resolveImage,
  normalizePercent: tienIch.normalizePercent,
  toNumberSafe: tienIch.toNumberSafe,

  // callbacks
  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
  blurActive: tienIch.blurActive,
});

/* =========================
   TỔNG TIỀN HÀNG
========================= */
const tongTienHang = computed(() => {
  let s = 0;
  for (const it of cartItems.value) {
    const price = Number(sp.getGiaThucTe(it) || 0);
    const qty = Number(it.qty || 0);
    s += price * qty;
  }
  return s;
});

/* =========================
   VOUCHER + THANH TOÁN + SHIP
========================= */
const pay = useBanHangVoucherThanhToan({
  SalesService,
  isCounter,
  selectedKh: kh.selectedKh,
  tongTienHang,

  // helpers
  todayYmd: tienIch.todayYmd,
  toYmd: tienIch.toYmd,
  formatMoney: tienIch.formatMoney,
  parseMoneyText: tienIch.parseMoneyText,
  formatNumberText: tienIch.formatNumberText,

  // callbacks
  showToast,
  persistActiveTab: () => persistActiveTab(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
});

// gán scheduleAutoVoucher thật
scheduleAutoVoucher = pay.scheduleAutoVoucher;

/* =========================
   TABS + AUTO CLEAR
========================= */
function dongTatCaModal() {
  sp.showCtspModal.value = false;
  qr.showQrModal.value = false;
  kh.showKhModal.value = false;
  kh.showDiaChiModal.value = false;
  pay.showPayModal.value = false;
  hd.showSubmitConfirmModal.value = false;
}

const tabsApi = useBanHangTabs({
  // state
  isCounter,
  cartItems,

  selectedKh: kh.selectedKh,
  diaChiList: kh.diaChiList,
  selectedDiaChi: kh.selectedDiaChi,

  autoVoucher: pay.autoVoucher,
  voucherManual: pay.voucherManual,
  voucherCode: pay.voucherCode,

  khachThanhToan: pay.khachThanhToan,
  payMethod: pay.payMethod,
  payTienMat: pay.payTienMat,
  payChuyenKhoan: pay.payChuyenKhoan,
  payMaThamChieu: pay.payMaThamChieu,
  payTienMatText: pay.payTienMatText,
  payChuyenKhoanText: pay.payChuyenKhoanText,

  guest: kh.guest,

  phiVanChuyen: pay.phiVanChuyen,
  phiVanChuyenText: pay.phiVanChuyenText,

  // deps
  apiClient,
  showToast,
  capNhatTonLocal: tonKho.capNhatTonLocal,

  // callbacks
  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
  ensureBaseQtyIfCartHasItems: sp.ensureBaseQtyIfCartHasItems,
  capNhatDotGiamGiaChoGioHang: sp.capNhatDotGiamGiaChoGioHang,
  loadDiaChiAndPickDefault: kh.loadDiaChiAndPickDefault,

  // clear helpers
  xoaTonKhoLocal: tonKho.xoaTonKhoLocal,
  dongTatCaModal,
  blurActive: tienIch.blurActive,
  formatNumberText: tienIch.formatNumberText,
});

const tabs = tabsApi.tabs;
const activeTab = tabsApi.activeTab;

persistActiveTab = tabsApi.persistActiveTab;
persistTabs = tabsApi.persistTabs;
applyTabState = tabsApi.applyTabState;

/* =========================
   ĐỒNG BỘ DB + SUBMIT
========================= */
const hd = useBanHangHoaDonSubmit({
  apiClient,
  router,

  tabs,
  activeTab,

  isCounter,
  cartItems,

  selectedKh: kh.selectedKh,
  selectedDiaChi: kh.selectedDiaChi,
  diaChiList: kh.diaChiList,
  guest: kh.guest,

  nguoiBan,

  effectiveVoucher: pay.effectiveVoucher,
  phiVanChuyenNum: pay.phiVanChuyenNum,
  tongTienHang,
  tongPhaiTra: pay.tongPhaiTra,

  // sản phẩm
  ctspList: sp.ctspList,
  loadCtspForPos: sp.loadCtspForPos,
  ensureBaseQtyIfCartHasItems: sp.ensureBaseQtyIfCartHasItems,
  capNhatDotGiamGiaChoGioHang: sp.capNhatDotGiamGiaChoGioHang,

  // callbacks
  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  persistActiveTab: () => persistActiveTab(),
  persistTabs: () => persistTabs(),
  applyTabState: (t) => applyTabState(t),

  showToast,

  // helper dùng trong payload
  getKhName: kh.getKhName,
  getKhPhone: kh.getKhPhone,
  getKhEmail: kh.getKhEmail,
  renderDiaChi: kh.renderDiaChi,

  blurActive: tienIch.blurActive,
  getMaxQtyForItem: sp.getMaxQtyForItem,
});

// gán scheduleSyncHoaDon thật
scheduleSyncHoaDon = hd.scheduleSyncHoaDon;

const submitting = hd.submitting;

/* =========================
   QR
========================= */
const qr = useBanHangQr({
  ctspList: sp.ctspList,
  loadCtspForPos: sp.loadCtspForPos,
  pickCtsp: sp.pickCtsp,
  getAvailableQtyByCtspId: tonKho.getAvailableQtyByCtspId,
  blurActive: tienIch.blurActive,
});

/* =========================
   COMPUTED HIỂN THỊ
========================= */
const nguoiBanTen = computed(() => {
  const u = nguoiBan.value || {};
  return u.hoTen || u.tenNhanVien || u.ten || u.username || "";
});

const hasOrders = computed(() => Array.isArray(tabs.value) && tabs.value.length > 0);

/* ✅ FIX: Giao hàng cũng bắt buộc nhập thanh toán */
const canSubmit = computed(() => {
  if (!hasOrders.value) return false;
  if (cartItems.value.length === 0) return false;
  if (submitting.value) return false;

  // validate qty
  for (const it of cartItems.value) {
    const qty = Number(it?.qty || 0);
    if (!Number.isFinite(qty) || qty < 1) return false;
    const max = sp.getMaxQtyForItem(it);
    if (qty > max) return false;
  }

  // validate giao hàng (địa chỉ/SDT)
  if (isCounter.value) {
    if (kh.selectedKh.value) {
      if (!kh.selectedDiaChi.value) return false;
    } else {
      const sdt = String(kh.guest.soDienThoai || "").replace(/\D/g, "");
      const dc = (kh.guest.diaChiCuThe || "").trim();
      const tinh = (kh.guest.tinhThanh || "").trim();
      const huyen = (kh.guest.huyenQuan || "").trim();
      const xa = (kh.guest.xaPhuong || "").trim();

      if (!/^\d{9,11}$/.test(sdt)) return false;
      if (!dc || !tinh || !huyen || !xa) return false;
    }
  }

  // ✅ validate thanh toán (áp dụng cho cả 2 loại)
  const payNum = Number(pay.khachThanhToan.value || 0);
  const total = Number(pay.tongPhaiTra.value || 0);
  if (!Number.isFinite(payNum) || payNum <= 0) return false;

  if (pay.payMethod.value === "CHUYEN_KHOAN" || pay.payMethod.value === "KET_HOP") {
    if (payNum !== total) return false;
  } else {
    if (payNum < total) return false;
  }

  return true;
});

const anyModalOpen = computed(() => {
  return !!(
    sp.showCtspModal.value ||
    qr.showQrModal.value ||
    kh.showKhModal.value ||
    kh.showDiaChiModal.value ||
    pay.showPayModal.value ||
    hd.showSubmitConfirmModal.value
  );
});

/* =========================
   BODY LOCK MODAL
========================= */
watch(anyModalOpen, (val) => {
  try {
    document.body.style.overflow = val ? "hidden" : "";
  } catch (e) {}
});

/* =========================
   WATCH (giữ hành vi như file cũ)
========================= */
watch(tongTienHang, () => {
  scheduleAutoVoucher();
  persistActiveTab();
});

watch(
  cartItems,
  () => {
    persistActiveTab();
  },
  { deep: true },
);

watch(kh.selectedKh, () => {
  scheduleAutoVoucher();
  persistActiveTab();
});

watch(kh.selectedDiaChi, () => {
  persistActiveTab();
});

watch(pay.khachThanhToan, () => {
  persistActiveTab();
});

watch(pay.payMethod, () => {
  persistActiveTab();
});

// OFF=tại quầy | ON=giao hàng
watch(isCounter, async (val) => {
  if (val) {
    // ✅ giao hàng: vẫn cần thanh toán => KHÔNG reset các biến thanh toán nữa
    const khId = kh.selectedKh.value?.id;
    if (khId) {
      if (!Array.isArray(kh.diaChiList.value) || kh.diaChiList.value.length === 0) {
        await kh.loadDiaChiAndPickDefault(khId);
      } else if (!kh.selectedDiaChi.value) {
        let def = kh.diaChiList.value.find((x) => x.macDinh === true || x.macDinh === 1);
        if (!def && kh.diaChiList.value.length > 0) def = kh.diaChiList.value[0];
        kh.selectedDiaChi.value = def || null;
      }
    }
  } else {
    // sang tại quầy: bỏ địa chỉ + ship
    kh.selectedDiaChi.value = null;
    kh.diaChiList.value = [];
    pay.phiVanChuyen.value = 0;
    pay.phiVanChuyenText.value = "0";
  }

  persistActiveTab();
  scheduleSyncHoaDon();
});

/* =========================
   LOGIN USER
========================= */
function normalizeNguoiBan(u) {
  if (!u || typeof u !== "object") return null;
  const id = u.idNhanVien || u.nhanVienId || u.id || u.userId || u.nhanVien?.id || null;
  const hoTen = u.hoTen || u.tenNhanVien || u.ten || u.fullName || u.name || u.username || "";
  return { id, hoTen, role: u.role || u.quyen || null };
}

function getNguoiBanDangNhap() {
  const tryParse = (raw) => tienIch.safeParse(raw || "null", null);

  const prefer = tryParse(localStorage.getItem("ss_nguoi_ban"));
  if (prefer) return prefer;

  const u1 = tryParse(localStorage.getItem("user"));
  if (u1) return normalizeNguoiBan(u1);

  const u2 = tryParse(sessionStorage.getItem("ss_nguoi_ban"));
  if (u2) return u2;

  const u3 = tryParse(sessionStorage.getItem("user"));
  if (u3) return normalizeNguoiBan(u3);

  return null;
}

/* =========================
   MOUNT / UNMOUNT
========================= */
onMounted(async () => {
  // sync lại permission khi vào trang
  try {
    quyenCaLam.reloadPermission?.();
  } catch (e) {}

  tabsApi.khoiTaoAutoClearVaSyncStorage();

  nguoiBan.value = getNguoiBanDangNhap();

  // restore tồn local
  tonKho.restoreCtspBaseQtyMap();

  // restore tabs
  tabsApi.khoiPhucTabsTuLocal();

  await sp.ensureBaseQtyIfCartHasItems();
  await sp.capNhatDotGiamGiaChoGioHang();
  scheduleAutoVoucher();

  if (hasOrders.value) scheduleSyncHoaDon();
});

onBeforeUnmount(() => {
  try {
    qr.stopQr?.();
  } catch (e) {}
  try {
    document.body.style.overflow = "";
  } catch (e) {}
});

/* =========================
   HÀM PHỤ CHO TEMPLATE
========================= */
function getVoucherLabel(v) {
  if (!v) return "";

  const code = v.maPhieuGiamGia || v.ma || v.code || "";
  const giaTriRaw = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);

  // ✅ dùng đúng rule giống composable:
  // false/0 => % ; true/1 => tiền
  const isPercent = typeof pay?.isVoucherPercent === "function" ? pay.isVoucherPercent(v) : (() => {
    const raw = v?.loaiPhieuGiamGia;
    if (raw === false || raw === 0 || raw === "0") return true;
    if (raw === true || raw === 1 || raw === "1") return false;
    const s = String(raw ?? "").trim().toLowerCase();
    if (s === "false" || s === "0") return true;
    if (s === "true" || s === "1") return false;
    const n = Number(giaTriRaw || 0);
    if (Number.isFinite(n) && n > 100) return false;
    return true;
  })();

  const normalizePct = (x) => {
    let n = Number(x ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (n > 0 && n <= 1) n = n * 100;
    n = Math.round(n);
    return Math.max(0, Math.min(100, n));
  };

  if (code && isPercent) return `${code} (${normalizePct(giaTriRaw)}%)`;
  if (code && !isPercent) return `${code} (${tienIch.formatMoney(giaTriRaw)})`;
  if (code) return code;

  if (isPercent) return `${normalizePct(giaTriRaw)}%`;
  return tienIch.formatMoney(giaTriRaw);
}

/* =========================
   ALIAS ĐÚNG TÊN TEMPLATE (để khỏi sửa template)
========================= */
// money
const formatMoney = tienIch.formatMoney;

// tabs
const tabItemCount = tabsApi.tabItemCount;
const createOrderTab = quyenCaLam.guard(tabsApi.createOrderTab);
const switchTab = tabsApi.switchTab;
const closeTab = quyenCaLam.guard(tabsApi.closeTab);

// sản phẩm
const showCtspModal = sp.showCtspModal;
const openCtspModal = quyenCaLam.guard(sp.openCtspModal);
const closeCtspModal = sp.closeCtspModal;

const ctspFilter = sp.ctspFilter;
const filteredCtsp = sp.filteredCtsp;
const ctspPage = sp.ctspPage;
const ctspPageSize = sp.ctspPageSize;
const ctspTotalPages = sp.ctspTotalPages;
const pagedCtsp = sp.pagedCtsp;

const ctspMauSacOptions = sp.ctspMauSacOptions;
const ctspKichCoOptions = sp.ctspKichCoOptions;
const ctspSanPhamOptions = sp.ctspSanPhamOptions;

const ctspPickQty = sp.ctspPickQty;

const resolveImage = sp.resolveImage;
const onImgErr = sp.onImgErr;

const getGiaGoc = sp.getGiaGoc;
const getGiaThucTe = sp.getGiaThucTe;
const showGiaGoc = sp.showGiaGoc;

const getPhanTramGiamDisplay = sp.getPhanTramGiamDisplay;
const getGiamGiaTitle = sp.getGiamGiaTitle;

const getMaxQtyForItem = sp.getMaxQtyForItem;
const incQty = sp.incQty;
const decQty = sp.decQty;
const onQtyInput = sp.onQtyInput;
const onQtyBlur = sp.onQtyBlur;
const removeItem = sp.removeItem;

const onCtspPickQtyInput = sp.onCtspPickQtyInput;
const pickCtsp = sp.pickCtsp;
const resetCtspFilter = sp.resetCtspFilter;

// QR
const showQrModal = qr.showQrModal;
const qrError = qr.qrError;
const openQrModal = quyenCaLam.guard(qr.openQrModal);
const closeQrModal = qr.closeQrModal;
const restartQr = qr.restartQr;

// khách hàng
const showKhModal = kh.showKhModal;
const khLoading = kh.khLoading;
const khErr = kh.khErr;
const khList = kh.khList;
const khFilter = kh.khFilter;
const filteredKh = kh.filteredKh;

const selectedKh = kh.selectedKh;
const guest = kh.guest;
const tinhOptions = kh.tinhOptions;
const huyenOptions = kh.huyenOptions;
const xaOptions = kh.xaOptions;

const showDiaChiModal = kh.showDiaChiModal;
const dcLoading = kh.dcLoading;
const dcErr = kh.dcErr;
const diaChiList = kh.diaChiList;
const selectedDiaChi = kh.selectedDiaChi;

const khAddrCache = kh.khAddrCache;

const getKhName = kh.getKhName;
const getKhPhone = kh.getKhPhone;
const getKhEmail = kh.getKhEmail;
const renderDiaChi = kh.renderDiaChi;
const renderKhDiaChi = kh.renderKhDiaChi;

const onGuestPhoneInput = kh.onGuestPhoneInput;
const chonKhachVangLai = quyenCaLam.guard(kh.chonKhachVangLai);

const openKhModal = quyenCaLam.guard(kh.openKhModal);
const closeKhModal = kh.closeKhModal;
const reloadKh = kh.reloadKh;
const pickKh = quyenCaLam.guard(kh.pickKh);

const openDiaChiModal = quyenCaLam.guard(kh.openDiaChiModal);
const closeDiaChiModal = kh.closeDiaChiModal;
const pickDiaChi = quyenCaLam.guard(kh.pickDiaChi);

// voucher + thanh toán
const voucherCode = pay.voucherCode;
const voucherManual = pay.voucherManual;
const effectiveVoucher = pay.effectiveVoucher;
const voucherValueText = pay.voucherValueText;
const giamGia = pay.giamGia;

const phiVanChuyenText = pay.phiVanChuyenText;
const phiVanChuyenNum = pay.phiVanChuyenNum;
const onShipFeeInput = pay.onShipFeeInput;

const tongPhaiTra = pay.tongPhaiTra;
const khachThanhToan = pay.khachThanhToan;
const tienThieu = pay.tienThieu;

const applyVoucherCode = pay.applyVoucherCode;

const showPayModal = pay.showPayModal;
const payMethod = pay.payMethod;

const payTienMatText = pay.payTienMatText;
const payChuyenKhoanText = pay.payChuyenKhoanText;
const payTienMatNum = pay.payTienMatNum;
const payChuyenKhoanNum = pay.payChuyenKhoanNum;
const payTotalNum = pay.payTotalNum;

const payMaThamChieu = pay.payMaThamChieu;

const openPayModal = quyenCaLam.guard(pay.openPayModal);
function closePayModal() {
  pay.closePayModal(tienIch.blurActive);
}
const confirmPay = quyenCaLam.guard(() => {
  pay.confirmPay(tienIch.blurActive);
});
const onPayTienMatInput = pay.onPayTienMatInput;
const onPayChuyenKhoanInput = pay.onPayChuyenKhoanInput;
const fillPayConLai = pay.fillPayConLai;

// submit confirm modal
const showSubmitConfirmModal = hd.showSubmitConfirmModal;
const openSubmitConfirm = quyenCaLam.guard(() => {
  hd.openSubmitConfirm(canSubmit);
});
const closeSubmitConfirm = hd.closeSubmitConfirm;
const confirmSubmitOrder = quyenCaLam.guard(async () => {
  await hd.confirmSubmitOrder(() => hd.submitOrder(canSubmit, pay));
});
</script>

<style scoped>
/* ======= base ======= */
.ss-pos {
  padding-bottom: 18px;
}

/* Dập chữ in đậm nếu có */
.ss-pos :deep(b),
.ss-pos :deep(strong) {
  font-weight: 400 !important;
}

/* ======= Badge giảm giá (đồng bộ) ======= */
.thumb-wrap {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  overflow: visible;
}

.discount-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 999px;
  border: 1.5px solid #fff;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  pointer-events: none;
  white-space: nowrap;
  line-height: 1.3;
  z-index: 2;
}

.discount-badge.sm {
  font-size: 8px;
  padding: 1px 3px;
  top: -3px;
  right: -3px;
}

.ss-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ss-head-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ss-title {
  font-size: 20px;
  font-weight: 500;
}

.ss-subtitle {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-seller-name {
  color: rgba(17, 24, 39, 0.82);
  font-weight: 500;
}

/* Toast */
.ss-toast {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 9999;
  min-width: 280px;
  max-width: 440px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
  display: grid;
  grid-template-columns: 20px 1fr 34px;
  gap: 10px;
  align-items: center;
  padding: 12px 12px;
}
.ss-toast-left {
  display: grid;
  place-items: center;
}
.ss-toast-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.9);
}
.ss-toast.success .ss-toast-dot {
  background: rgba(34, 197, 94, 0.9);
}
.ss-toast.error .ss-toast-dot {
  background: rgba(239, 68, 68, 0.9);
}
.ss-toast.info .ss-toast-dot {
  background: rgba(59, 130, 246, 0.9);
}
.ss-toast-msg {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-toast-x {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  font-size: 18px;
  color: rgba(17, 24, 39, 0.72);
}

/* Tabs */
.ss-tabs {
  margin-bottom: 10px;
}
.ss-tab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ss-tab {
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-tab-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(153, 27, 27, 0.92);
  color: #fff;
  font-size: 11px;
  display: inline-grid;
  place-items: center;
  font-weight: 500;
}
.ss-tab.active {
  border-color: rgba(153, 27, 27, 0.35);
  background: rgba(153, 27, 27, 0.04);
}
.ss-tab-x {
  font-size: 16px;
  line-height: 1;
  opacity: 0.6;
}
.ss-tab-x:hover {
  opacity: 1;
}

/* Buttons */
.ss-btn-primary {
  background: linear-gradient(90deg, rgba(153, 27, 27, 0.95), rgba(17, 24, 39, 0.95));
  border: none;
  color: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
}

.ss-btn-outline {
  background: #fff;
  border: 1px solid rgba(153, 27, 27, 0.28);
  color: rgba(153, 27, 27, 0.92);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 400;
}

.ss-btn-mini {
  padding: 7px 10px;
  border-radius: 10px;
}

.ss-card-main {
  padding: 14px;
}

/* EMPTY */
.ss-empty-wrap {
  min-height: 320px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 10px;
}
.ss-empty-cart {
  min-height: 260px;
}
.ss-empty-icon {
  opacity: 0.95;
}
.ss-empty-text {
  font-size: 14px;
  color: rgba(17, 24, 39, 0.62);
  font-weight: 500;
}
.ss-empty-eng {
  font-weight: 400;
  color: rgba(17, 24, 39, 0.55);
}

/* Section head */
.ss-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.ss-section-title {
  font-size: 14px;
  font-weight: 500;
}
.ss-section-actions {
  display: flex;
  gap: 10px;
}

/* Cart */
.ss-cart-box {
  border-radius: 14px;
  padding: 10px;
  margin-bottom: 12px;
  min-height: 92px;
}

.ss-cart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ss-cart-item {
  display: grid;
  grid-template-columns: 24px 48px 1fr 140px 140px 40px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
}
.ss-cart-check {
  width: 16px;
  height: 16px;
}
.ss-cart-thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: rgba(17, 24, 39, 0.03);
}
.ss-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px !important;
}
.ss-thumb-ph {
  width: 100%;
  height: 100%;
  background: rgba(153, 27, 27, 0.06);
  border-radius: 12px;
}

.ss-cart-thumb.thumb-wrap,
.ss-thumb.thumb-wrap {
  overflow: visible;
}

.ss-cart-name {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-cart-sub {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.6);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.ss-cart-code {
  color: rgba(17, 24, 39, 0.72);
}
.ss-dot {
  opacity: 0.5;
}
.ss-cart-price {
  text-align: right;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-price-old {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.45);
  text-decoration: line-through;
}
.ss-price-now {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}

.ss-cart-qty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.ss-qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-qty-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-qty-input {
  width: 56px;
  height: 32px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  text-align: center;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
  outline: none;
}

.ss-trash {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(153, 27, 27, 0.18);
  background: rgba(153, 27, 27, 0.04);
  color: rgba(153, 27, 27, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-trash .material-icons-outlined {
  font-size: 20px;
}
.ss-cart-total {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 6px 4px 2px;
}
.ss-cart-total-label {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-cart-total-val {
  font-size: 13px;
  color: rgba(153, 27, 27, 0.92);
  font-weight: 500;
}

/* Bottom grid */
.ss-bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
}

.ss-panel {
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}

.ss-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.ss-panel-title {
  font-size: 14px;
  font-weight: 500;
}
.ss-panel-actions {
  display: flex;
  gap: 10px;
}
.ss-panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ss-kv {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  font-size: 13px;
}
.ss-k {
  color: rgba(17, 24, 39, 0.62);
}
.ss-v {
  color: rgba(17, 24, 39, 0.82);
}
.ss-hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.55);
}

/* Guest */
.ss-guest-hint {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
  font-weight: 500;
  margin-bottom: 2px;
}
.ss-guest-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ss-guest-full {
  grid-column: 1 / -1;
}

/* Payment */
.ss-pay-kv {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-top: 1px dashed rgba(17, 24, 39, 0.08);
}
.ss-pay-kv:first-of-type {
  border-top: none;
}
.ss-pay-total {
  border-top: 1px solid rgba(17, 24, 39, 0.12);
  margin-top: 4px;
  padding-top: 10px;
}
.ss-pay-total .ss-pay-k,
.ss-pay-total .ss-pay-v {
  color: rgba(153, 27, 27, 0.92);
  font-weight: 500;
}
.ss-red {
  color: rgba(153, 27, 27, 0.92);
}
.ss-pay-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.ss-pay-k-strong {
  font-weight: 500;
  color: rgba(17, 24, 39, 0.82);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-icon-inline {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}
.ss-icon-btn .material-icons-outlined {
  font-size: 20px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-confirm {
  width: 100%;
  margin-top: 10px;
  height: 46px;
  border-radius: 14px;
}

/* Voucher input row */
.ss-voucher-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 10px;
  align-items: end;
}
.ss-voucher-val {
  max-width: 180px;
}

/* Voucher auto hint */
.ss-voucher-auto {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
}
.ss-voucher-auto-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ss-voucher-strong {
  color: rgba(17, 24, 39, 0.82);
  font-weight: 500;
}
.ss-voucher-auto-sub {
  font-size: 12px;
  margin-top: 4px;
  color: rgba(17, 24, 39, 0.6);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-voucher-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(153, 27, 27, 0.18);
  background: rgba(153, 27, 27, 0.06);
  color: rgba(153, 27, 27, 0.92);
}

/* Switch */
.ss-ship-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-toggle-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 26px;
}
.ss-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.ss-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(17, 24, 39, 0.14);
  transition: 0.2s;
  border-radius: 99px;
}
.ss-slider:before {
  content: "";
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  top: 3px;
  background: #fff;
  transition: 0.2s;
  border-radius: 50%;
}
.ss-switch input:checked + .ss-slider {
  background: rgba(153, 27, 27, 0.55);
}
.ss-switch input:checked + .ss-slider:before {
  transform: translateX(18px);
}

/* ======= Modal ======= */
.ss-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 20px;
}
.ss-modal {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}
.ss-modal-lg {
  max-width: 980px;
}
.ss-modal-md {
  max-width: 720px;
}
.ss-modal-pay {
  max-width: 560px;
}
.ss-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.1);
}
.ss-pay-head {
  background: linear-gradient(90deg, rgba(153, 27, 27, 0.08), rgba(17, 24, 39, 0.05));
}
.ss-modal-title {
  font-size: 14px;
  font-weight: 500;
}
.ss-x {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  font-size: 20px;
  color: rgba(17, 24, 39, 0.72);
}
.ss-modal-body {
  padding: 20px;
}
.ss-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(17, 24, 39, 0.1);
}
.ss-pay-actions {
  background: rgba(17, 24, 39, 0.02);
}

/* Filter row inside modal */
.ss-filter {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  margin-bottom: 12px;
}
.ss-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ss-field.grow {
  flex: 1;
}
.ss-filter-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-input {
  font-size: 13px;
  border-radius: 12px;
}
.ss-reset {
  height: 42px;
}

/* Table wrap */
.ss-table-wrap {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  overflow: hidden;
}
.ss-empty-row {
  text-align: center;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
  padding: 18px 8px;
}

.col-stt {
  width: 70px;
}
.col-code {
  width: 120px;
}
.col-img {
  width: 90px;
}
.col-qty {
  width: 110px;
  text-align: center;
}
.col-price {
  width: 140px;
  text-align: right;
}
.col-action {
  width: 180px;
  text-align: center;
}

/* Thumb in table */
.ss-thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: rgba(17, 24, 39, 0.03);
  margin: 0 auto;
}

/* pick qty input */
.ss-pick-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ss-pick-qty {
  width: 70px;
  height: 32px;
  text-align: center;
  border-radius: 10px;
  font-size: 12px;
}

/* Pagination */
.ss-pagi {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
}
.ss-pageinfo {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-pagebtns {
  display: flex;
  gap: 10px;
}

/* QR */
.ss-qr-hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
  margin-bottom: 10px;
}
.ss-qr-wrap {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  display: grid;
  place-items: center;
  padding: 10px;
}
.ss-qr-reader {
  width: 280px;
  height: 280px;
}

/* API hint */
.ss-api-hint {
  margin-top: 10px;
  background: rgba(153, 27, 27, 0.06);
  border: 1px solid rgba(153, 27, 27, 0.14);
  color: rgba(17, 24, 39, 0.72);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
}

/* Address list */
.ss-dc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ss-dc-item {
  text-align: left;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 14px;
  padding: 10px 12px;
  background: #fff;
}
.ss-dc-item.active {
  border-color: rgba(153, 27, 27, 0.35);
  background: rgba(153, 27, 27, 0.04);
}
.ss-dc-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ss-dc-name {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-badge {
  font-size: 12px;
  border-radius: 999px;
  padding: 3px 8px;
  border: 1px solid rgba(153, 27, 27, 0.22);
  background: rgba(153, 27, 27, 0.06);
  color: rgba(153, 27, 27, 0.92);
  font-weight: 400;
}
.ss-dc-text {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
  margin-top: 6px;
}

/* ship fee input */
.ss-ship-fee {
  max-width: 140px;
  text-align: right;
}
.ss-currency {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
}

/* Pay modal */
.ss-paybox {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  padding: 12px;
  background: rgba(17, 24, 39, 0.02);
}
.ss-paybox-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
}
.ss-paybox-red {
  color: rgba(153, 27, 27, 0.92);
  font-weight: 500;
}
.ss-paygrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
.ss-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ss-link {
  border: none;
  background: transparent;
  font-size: 12px;
  color: rgba(153, 27, 27, 0.92);
  padding: 0;
  cursor: pointer;
}
.ss-link:hover {
  text-decoration: underline;
}
.ss-mt-8 {
  margin-top: 8px;
}
.ss-pay-note {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(17, 24, 39, 0.6);
}
.ss-pay-note-line {
  padding-top: 2px;
}

/* ===== Modal Chọn khách hàng ===== */
.ss-modal-kh {
  max-width: 900px;
}
.ss-kh-body {
  padding: 20px;
}
.ss-kh-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.ss-kh-search {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  font-size: 13px;
}
.ss-kh-reload {
  height: 36px;
  border-radius: 4px;
  font-size: 13px;
  padding: 0 12px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
}
.ss-kh-tablewrap {
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 4px;
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;
}
.ss-kh-table {
  width: 100%;
  font-size: 13px;
}
.ss-kh-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(17, 24, 39, 0.03);
  border-bottom: 1px solid rgba(17, 24, 39, 0.12);
  font-weight: 500;
}
.ss-kh-table td,
.ss-kh-table th {
  vertical-align: middle;
  padding: 10px 12px;
}
.kh-col-stt {
  width: 48px;
  text-align: center;
}
.kh-col-name {
  width: 180px;
}
.kh-col-phone {
  width: 140px;
}
.kh-col-act {
  width: 120px;
  text-align: center;
}
.ss-kh-pick {
  height: 28px;
  min-width: 64px;
  border-radius: 4px;
  font-size: 12px;
  padding: 0 10px;
  border: none;
  background: rgba(153, 27, 27, 0.92);
  color: #fff;
  font-weight: 400;
}
.ss-kh-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.ss-kh-close {
  height: 32px;
  border-radius: 4px;
  font-size: 13px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
}

/* Responsive */
@media (max-width: 1100px) {
  .ss-bottom-grid {
    grid-template-columns: 1fr;
  }
  .ss-filter {
    grid-template-columns: 1fr 1fr;
  }
  .ss-guest-grid {
    grid-template-columns: 1fr;
  }
  .ss-voucher-row {
    grid-template-columns: 1fr;
  }
  .ss-paygrid {
    grid-template-columns: 1fr;
  }
}
</style>