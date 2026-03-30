<template>
  <div class="thong-ke-page container-fluid p-4">
    <div class="mb-2">
      <small class="text-muted">Thống kê doanh thu</small>
    </div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">Thống kê doanh thu</h4>
      <button class="btn btn-outline-secondary btn-sm" @click="sendReport">
        Gửi báo cáo
      </button>
    </div>

    <div class="mb-3">
      <span v-if="filterType === 'TODAY'" class="text-muted small">
        <i class="bi bi-info-circle me-1"></i> Đang hiển thị dữ liệu của HÔM NAY
        ({{ todayString }})
      </span>
      <span v-else class="text-muted small">
        <i class="bi bi-info-circle me-1"></i> Khoảng thời gian đang xem:
        {{ currentRange.from }} → {{ currentRange.to }}
      </span>
    </div>

    <div class="card border-0 shadow-sm p-4 mb-4 filter-bar">
      <div class="row align-items-end mb-4">
        <div class="col-md-5">
          <label class="form-label text-muted small mb-2"
            >Khoảng thời gian</label
          >
          <div class="d-flex align-items-center gap-2">
            <input
              type="date"
              class="form-control"
              v-model="fromDate"
              @change="filterType = 'CUSTOM'"
            />
            <span class="text-muted">→</span>
            <input
              type="date"
              class="form-control"
              v-model="toDate"
              @change="filterType = 'CUSTOM'"
            />
          </div>
        </div>

        <div class="col-md-7 text-end">
          <button class="btn btn-primary px-4 me-2" @click="handleCustomFilter">
            Lọc dữ liệu
          </button>
          <button
            class="btn btn-light border px-4 me-2"
            @click="loadStatistics"
          >
            Tải lại
          </button>
          <button
            class="btn me-2"
            :class="chartType === 'line' ? 'btn-primary' : 'btn-light border'"
            @click="chartType = 'line'"
          >
            Biểu đồ đường
          </button>
          <button
            class="btn"
            :class="chartType === 'bar' ? 'btn-primary' : 'btn-light border'"
            @click="chartType = 'bar'"
          >
            Biểu đồ cột
          </button>
        </div>
      </div>

      <div class="d-flex gap-2">
        <button
          class="btn px-4"
          :class="filterType === 'TODAY' ? 'btn-primary' : 'btn-light border'"
          @click="filterType = 'TODAY'"
        >
          Theo ngày
        </button>
        <button
          class="btn px-4"
          :class="filterType === 'WEEK' ? 'btn-primary' : 'btn-light border'"
          @click="filterType = 'WEEK'"
        >
          Theo tuần
        </button>
        <button
          class="btn px-4"
          :class="filterType === 'MONTH' ? 'btn-primary' : 'btn-light border'"
          @click="filterType = 'MONTH'"
        >
          Theo tháng
        </button>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm p-3 h-100 stat-card text-center">
          <div class="text-muted small mb-2">Tổng đơn hàng</div>
          <div class="fs-4 text-dark">{{ totalOrders }}</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm p-3 h-100 stat-card text-center">
          <div class="text-muted small mb-2">Tổng doanh thu</div>
          <div class="fs-4 text-dark">{{ formatMoney(totalRevenue) }}</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm p-3 h-100 stat-card text-center">
          <div class="text-muted small mb-2">Doanh thu thực tế</div>
          <div class="fs-4 text-dark">{{ formatMoney(realRevenue) }}</div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm p-3 h-100 stat-card text-center">
          <div class="text-muted small mb-2">Doanh thu dự kiến</div>
          <div class="fs-4 text-dark">{{ formatMoney(expectedRevenue) }}</div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3" v-for="(card, index) in miniCards" :key="index">
        <div class="card border-0 shadow-sm p-3 mini-card text-center">
          <div class="text-muted small fw-bold mb-1">{{ card.label }}</div>
          <div class="fs-5 mb-1">{{ formatMoney(card.revenue) }}</div>
          <div class="small text-muted">
            Sản phẩm: {{ card.totalProducts }} | Đơn: {{ card.totalOrders }}
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h6 class="fw-bold mb-0">Biểu đồ doanh thu theo thời gian</h6>
        <span class="text-muted small"
          >Bấm vào 1 điểm trên biểu đồ để xem doanh thu</span
        >
      </div>
      <div style="height: 350px">
        <RevenueChart :chart="revenueChart" :type="chartType" />
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-xl-8 col-lg-12">
        <div class="card border-0 shadow-sm p-4 h-100">
          <h6 class="fw-bold mb-4">Bảng thống kê chi tiết theo thời gian</h6>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th class="text-muted fw-normal">Thời gian</th>
                  <th class="text-muted fw-normal">Doanh thu</th>
                  <th class="text-muted fw-normal">Số đơn</th>
                  <th class="text-muted fw-normal">Giá trị trung bình/đơn</th>
                  <th class="text-muted fw-normal">Tăng trưởng (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in detailTable" :key="index">
                  <td>{{ item.time }}</td>
                  <td>{{ formatMoney(item.revenue) }}</td>
                  <td>{{ item.totalOrders }}</td>
                  <td>{{ formatMoney(item.avgPerOrder) }}</td>
                  <td
                    :class="item.growth >= 0 ? 'text-success' : 'text-danger'"
                  >
                    {{ item.growth.toFixed(2) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-xl-4 col-lg-12">
        <div class="card border-0 shadow-sm p-4 h-100">
          <h6 class="fw-bold mb-4">Phân bố trạng thái đơn hàng</h6>
          <div
            style="height: 250px"
            class="d-flex align-items-center justify-content-center"
          >
            <OrderStatusChart :statusData="orderStatus" />
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-1 mb-4">
      <div class="col-12">
    <div class="card border-0 shadow-sm p-4">
      <h6 class="fw-bold mb-1">Top sản phẩm bán chạy (30 ngày)</h6>
      <small class="text-muted mb-4 d-block">Từ {{ lastMonthRange.from }} đến {{ lastMonthRange.to }}</small>
      <div class="table-responsive">
        <table class="table table-hover align-middle" style="font-size: 14px">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>Thuộc tính</th>
              <th>Giá</th>
              <th class="text-center">Tồn kho</th>
              <th class="text-center">Đã bán</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in topProducts" :key="index">
              <td>{{ index + 1 }}</td>
              <td style="width: 30%">
                <div class="d-flex align-items-center gap-3">
                  <img 
                    :src="item.imageUrl || 'https://via.placeholder.com/50'" 
                    class="rounded border shadow-sm" 
                    style="width: 50px; height: 50px; object-fit: cover;" 
                    @error="(e) => e.target.src = 'https://via.placeholder.com/50'"
                  />
                  <div>
                    <div class="fw-bold">{{ item.productDetailCode }}</div>
                    <div class="text-muted small text-truncate" style="max-width: 300px" :title="item.productName">
                      {{ item.productName }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <span v-if="item.color" class="badge bg-light text-dark border">{{ item.color }}</span>
                  <span v-if="item.size" class="badge bg-light text-dark border">Size {{ item.size }}</span>
                  <span v-if="item.surface" class="badge bg-light text-dark border">{{ item.surface }}</span>
                </div>
              </td>
              <td class="text-nowrap">{{ formatMoney(item.price) }}</td>
              
              <td class="text-center fw-bold" :class="item.stockQuantity <= 5 ? 'text-danger' : 'text-dark'">
                {{ item.stockQuantity }}
              </td>

              <td class="text-center fw-bold text-success">{{ item.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

      <div class="col-12">
        <div class="card border-0 shadow-sm p-4">
          <div class="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h6 class="fw-bold mb-1">
                Thống kê tồn kho Quý {{ quarterInfo.quarter }}
              </h6>
              <small class="text-muted"
                >Từ {{ quarterInfo.from }} → {{ quarterInfo.to }}</small
              >
            </div>
            <div class="d-flex gap-2">
              <select
                v-model="brandFilter"
                class="form-select border-0 bg-light form-select-sm"
              >
                <option value="">Thương hiệu</option>
                <option v-for="b in brands" :key="b">{{ b }}</option>
              </select>
              <select
                v-model="surfaceFilter"
                class="form-select border-0 bg-light form-select-sm"
              >
                <option value="">Loại sân</option>
                <option v-for="s in surfaces" :key="s">{{ s }}</option>
              </select>
              <select
                v-model="statusFilter"
                class="form-select border-0 bg-light form-select-sm"
              >
                <option value="">Trạng thái</option>
                <option value="TON_KHO">Tồn kho nhiều</option>
                <option value="BAN_ON">Bán ổn</option>
                <option value="BAN_CHAY">Bán chạy</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table
              class="table table-hover align-middle"
              style="font-size: 14px"
            >
              <thead class="table-light">
                <tr>
                  <th class="text-muted fw-normal">Mã SP</th>
                  <th class="text-muted fw-normal">Sản phẩm</th>
                  <th class="text-muted fw-normal">Thuộc tính</th>
                  <th class="text-muted fw-normal text-center">Nhập/Bán/Tồn</th>
                  <th class="text-muted fw-normal">Tỷ lệ</th>
                  <th class="text-muted fw-normal text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredInventory" :key="index">
                  <td class="fw-bold" style="padding: 1rem 0.5rem">
                    {{ item.productDetailCode }}
                  </td>
                  <td style="padding: 1rem 0.5rem; width: 30%">
                    <div class="d-flex align-items-center gap-3">
                      <img 
                        :src="item.imageUrl || 'https://via.placeholder.com/40'" 
                        class="rounded border shadow-sm" 
                        style="width: 40px; height: 40px; object-fit: cover;"
                        @error="(e) => e.target.src = 'https://via.placeholder.com/40'"
                      />
                      <div>
                        <div
                          class="text-truncate fw-bold"
                          style="max-width: 250px"
                          :title="item.productName"
                        >
                          {{ item.productName }}
                        </div>
                        <div class="text-muted small">
                          {{ formatMoney(item.price) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 1rem 0.5rem">
                    <div class="d-flex flex-wrap gap-1">
                      <span
                        v-if="item.color"
                        class="badge bg-light text-dark border"
                        >{{ item.color }}</span
                      >
                      <span
                        v-if="item.size"
                        class="badge bg-light text-dark border"
                        >Size {{ item.size }}</span
                      >
                      <span
                        v-if="item.surface"
                        class="badge bg-light text-dark border"
                        >{{ item.surface }}</span
                      >
                    </div>
                  </td>
                  <td class="text-center" style="padding: 1rem 0.5rem">
                    {{ item.importQuarter }} / {{ item.soldQuarter }} /
                    <strong class="text-danger">{{
                      item.stockQuantity
                    }}</strong>
                  </td>
                  <td style="padding: 1rem 0.5rem">{{ item.sellRate }}%</td>
                  <td class="text-center" style="padding: 1rem 0.5rem">
                    <span
                      v-if="item.importQuarter == 0"
                      class="badge badge-outline-secondary"
                      >Hết hàng</span
                    >
                    <span
                      v-else-if="item.sellRate < 30"
                      class="badge badge-outline-danger"
                      >Tồn kho</span
                    >
                    <span
                      v-else-if="item.sellRate < 70"
                      class="badge badge-outline-warning"
                      >Bán ổn</span
                    >
                    <span v-else class="badge badge-outline-success"
                      >Bán chạy</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showReportModal" class="report-modal">
    <div class="report-modal-content card border-0 shadow">
      <h5 class="fw-bold mb-3">Chọn loại báo cáo</h5>
      <select class="form-select bg-light border-0 mb-4" v-model="reportType">
        <option disabled value="">-- Chọn loại báo cáo --</option>
        <option value="DAY">Hôm nay</option>
        <option value="WEEK">Tuần</option>
        <option value="MONTH">Tháng</option>
        <option value="QUARTER">Quý</option>
        <option value="YEAR">Năm</option>
      </select>
      <div class="text-end">
        <button
          class="btn btn-light border me-2"
          @click="showReportModal = false"
        >
          Hủy
        </button>
        <button
          v-if="reportType"
          class="btn btn-primary"
          @click="confirmSendReport"
        >
          Xác nhận gửi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import RevenueChart from "./RevenueChart.vue";
import OrderStatusChart from "./OrderStatusChart.vue";

const totalOrders = ref(0);
const totalRevenue = ref(0);
const realRevenue = ref(0);

const showReportModal = ref(false);
const reportType = ref("");

const revenueChart = ref([]);
const orderStatus = ref([]);
const topProducts = ref([]);
const miniCards = ref([]);
const detailTable = ref([]);

const filterType = ref("TODAY");
const fromDate = ref("");
const toDate = ref("");

const today = ref(new Date());

const expectedRevenue = ref(0);

const chartType = ref("line");

const sendReport = () => {
  reportType.value = "";
  showReportModal.value = true;
};

const quarterInfo = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  let quarter = Math.ceil(month / 3);

  let startMonth = (quarter - 1) * 3;
  let endMonth = startMonth + 2;

  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0);

  return {
    quarter,
    from: formatDate(startDate),
    to: formatDate(endDate),
  };
});

const inventoryStatus = ref([]);

const brandFilter = ref("");
const surfaceFilter = ref("");
const statusFilter = ref("");

const brands = ref([]);
const surfaces = ref([]);

const loadInventoryStatus = async () => {
  try {
    const inventoryRes = await axios.get(
      "http://localhost:8080/api/statistic/product-inventory-status",
    );

    inventoryStatus.value = inventoryRes.data || [];

    brands.value = [
      ...new Set(inventoryStatus.value.map((i) => i.productName.split(" ")[0])),
    ];

    surfaces.value = [...new Set(inventoryStatus.value.map((i) => i.surface))];
  } catch (error) {
    console.error("Lỗi load tồn kho:", error);
  }
};

const filteredInventory = computed(() => {
  return inventoryStatus.value.filter((item) => {
    const brandMatch =
      !brandFilter.value || item.productName.includes(brandFilter.value);

    const surfaceMatch =
      !surfaceFilter.value || item.surface === surfaceFilter.value;

    let status = "";

    if (item.importQuarter == 0) status = "HET_HANG";
    else if (item.sellRate < 30) status = "TON_KHO";
    else if (item.sellRate < 70) status = "BAN_ON";
    else status = "BAN_CHAY";

    const statusMatch = !statusFilter.value || status === statusFilter.value;

    return brandMatch && surfaceMatch && statusMatch;
  });
});

const confirmSendReport = async () => {
  const type = reportType.value;
  showReportModal.value = false;
  reportType.value = "";

  try {
    await axios.post("http://localhost:8080/api/statistic/send-report", {
      type,
    });
    alert("Đã gửi báo cáo cho ADMIN");
  } catch (error) {
    console.error(error);
    alert("Gửi báo cáo thất bại");
  }
};

setInterval(() => {
  today.value = new Date();
}, 60000);

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayString = computed(() => formatDate(today.value));

const formatMoney = (money) => {
  if (!money) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(money) + " đ";
};

const handleCustomFilter = () => {
  // 1. Xóa trắng 2 ô chọn ngày
  fromDate.value = "";
  toDate.value = "";

  // 2. Chuyển trạng thái về HÔM NAY (Vue sẽ tự động load lại dữ liệu ngay lập tức)
  filterType.value = "TODAY";
};

const currentRange = computed(() => {
  let from = "";
  let to = "";
  const now = today.value;

  if (filterType.value === "CUSTOM") {
    return { from: fromDate.value, to: toDate.value };
  }

  if (filterType.value === "TODAY") {
    from = to = formatDate(now);
  } else if (filterType.value === "WEEK") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    from = formatDate(start);
    to = formatDate(end);
  } else if (filterType.value === "MONTH") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    from = formatDate(firstDay);
    to = formatDate(lastDay);
  }

  return { from, to };
});

const lastMonthRange = computed(() => {
  const current = today.value;
  const to = formatDate(current);
  const fromDateObj = new Date(current);
  fromDateObj.setDate(current.getDate() - 30);
  const from = formatDate(fromDateObj);
  return { from, to };
});

const loadStatistics = async () => {
  try {
    const params = {
      fromDate: currentRange.value.from,
      toDate: currentRange.value.to,
    };

    const [
      ordersRes,
      revenueRes,
      realRevenueRes,
      expectedRevenueRes,
      chartRes,
      statusRes,
    ] = await Promise.all([
      axios.get("http://localhost:8080/api/statistic/total-orders", { params }),
      axios.get("http://localhost:8080/api/statistic/total-revenue", {
        params,
      }),
      axios.get("http://localhost:8080/api/statistic/real-revenue", { params }),
      axios.get("http://localhost:8080/api/statistic/expected-revenue", {
        params,
      }),
      axios.get("http://localhost:8080/api/statistic/revenue-chart", {
        params,
      }),
      axios.get("http://localhost:8080/api/statistic/order-status", { params }),
    ]);

    totalOrders.value = ordersRes.data || 0;
    totalRevenue.value = revenueRes.data || 0;
    realRevenue.value = realRevenueRes.data || 0;
    expectedRevenue.value = expectedRevenueRes.data || 0;
    revenueChart.value = chartRes.data || [];
    orderStatus.value = statusRes.data || [];

    const topRes = await axios.get(
      "http://localhost:8080/api/statistic/top-products",
      {
        params: {
          fromDate: lastMonthRange.value.from,
          toDate: lastMonthRange.value.to,
        },
      },
    );

    topProducts.value = (topRes.data || []).slice(0, 3);

    const detailRes = await axios.get(
      "http://localhost:8080/api/statistic/detail-table",
      { params },
    );
    detailTable.value = detailRes.data || [];

    const miniCardRes = await axios.get(
      "http://localhost:8080/api/statistic/mini-cards",
      { params },
    );
    miniCards.value = miniCardRes.data || [];
  } catch (error) {
    console.error("Lỗi load thống kê:", error);
  }
};

watch([filterType, fromDate, toDate], loadStatistics);

onMounted(() => {
  loadStatistics();
  loadInventoryStatus();
});
</script>

<style scoped>
/* Reset nền tổng quan để làm nổi bật thẻ trắng */
.thong-ke-page {
  background: #f4f7f6;
  min-height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}

/* Kiểu dáng chung cho các thẻ Card */
.card {
  border-radius: 12px;
}

/* Các chỉ số lớn */
.stat-card {
  transition: transform 0.2s ease-in-out;
}
.stat-card:hover {
  transform: translateY(-2px);
}

/* Custom Table gọn, sạch sẽ */
.table {
  margin-bottom: 0;
}
.table th {
  border-bottom-width: 1px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.table td {
  border-bottom: 1px solid #f1f3f5;
  vertical-align: middle;
}

/* Các nút button màu cơ bản */
.btn-primary {
  background-color: #1a73e8;
  border-color: #1a73e8;
}
.btn-primary:hover {
  background-color: #155db1;
  border-color: #155db1;
}

/* Custom form elements */
.form-control,
.form-select {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: none;
}
.form-control:focus,
.form-select:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 0.2rem rgba(26, 115, 232, 0.1);
}

/* Report Modal */
.report-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.report-modal-content {
  background: white;
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

/* Badge Thuộc tính (Màu, Size, Loại Sân) */
.badge {
  font-weight: 500;
  padding: 0.4em 0.6em;
  border-radius: 6px;
}

/* Custom Badges (Outline) cho cột Trạng Thái */
.badge-outline-secondary {
  color: #6c757d;
  background-color: transparent;
  border: 1px solid #6c757d;
}
.badge-outline-danger {
  color: #dc3545;
  background-color: transparent;
  border: 1px solid #dc3545;
}
.badge-outline-warning {
  color: #d97706; /* Vàng sậm dễ đọc hơn trên nền trắng */
  background-color: transparent;
  border: 1px solid #f59e0b;
}
.badge-outline-success {
  color: #15803d;
  background-color: transparent;
  border: 1px solid #22c55e;
}
</style>
