<template>
  <div class="thong-ke-page container-fluid p-4">

    <h4 class="title mb-4">Bộ Lọc Thống Kê</h4>

    <!-- Filter Bar -->
    <div class="card p-3 mb-4 filter-bar">
      <div class="row align-items-center">
        <div class="col-md-6 text-muted">
          Chọn khoảng thời gian và kiểu biểu đồ để xem nhanh số liệu
        </div>

        <div class="col-md-6 text-end">
          <input type="date" class="form-control d-inline w-auto me-2" />
          <select class="form-select d-inline w-auto me-2">
            <option>Tháng này</option>
            <option>Tuần này</option>
            <option>Hôm nay</option>
          </select>

          <button class="btn btn-outline-success me-2">Đường</button>
          <button class="btn btn-outline-success">Cột</button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="card p-3 mb-4">
      <div class="row text-center">
        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Số đơn hàng</div>
            <div class="stat-value">0</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Tổng doanh thu</div>
            <div class="stat-value text-success">0 đ</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Doanh thu thực tế</div>
            <div class="stat-value text-primary">0 đ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Cards -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="i in 4" :key="i">
        <div class="card p-3 mini-card">
          <div class="mini-title">Hôm nay</div>
          <div class="mini-value">0 đ</div>
          <div class="mini-desc">Sản phẩm: 0 | Đơn hàng: 0</div>
        </div>
      </div>
    </div>

    <!-- Chart Area -->
    <div class="row">
      <div class="col-md-8">
        <div class="card p-3 chart-card">
          <h6>Biểu đồ doanh thu</h6>

          <div class="chart-placeholder">
            <span>CHART DOANH THU (chỉ giao diện)</span>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card p-3 chart-card">
          <h6>Phân bố trạng thái đơn hàng</h6>

          <div class="chart-placeholder">
            <span>CHART TRẠNG THÁI</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Table -->
    <div class="row mt-4">
      <div class="col-md-8">
        <div class="card p-3">
          <h6>Bảng Thống Kê Chi Tiết</h6>

          <table class="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Doanh thu</th>
                <th>Số đơn</th>
                <th>Giá trị TB/đơn</th>
                <th>Tăng trưởng</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="i in 4" :key="i">
                <td>Hôm nay</td>
                <td>0 đ</td>
                <td>0</td>
                <td>0 đ</td>
                <td class="text-success">0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card p-3">
          <h6>Top sản phẩm bán chạy</h6>

          <table class="table table-bordered mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên SP</th>
                <th>Số lượng</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="i in 5" :key="i">
                <td>{{ i }}</td>
                <td>Sản phẩm {{ i }}</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// Tạm thời chỉ hiển thị giao diện
</script>

<style scoped>
.thong-ke-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.title {
  font-weight: bold;
  color: #2c3e50;
}

.filter-bar {
  border-radius: 10px;
}

.stat-box {
  padding: 15px;
  border-radius: 10px;
  background: #f9fafc;
  transition: 0.3s;
}

.stat-box:hover {
  background: #eef2f7;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.mini-card {
  border-radius: 10px;
  transition: 0.3s;
  cursor: pointer;
}

.mini-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.mini-title {
  font-size: 14px;
  color: #555;
}

.mini-value {
  font-size: 20px;
  font-weight: bold;
  margin-top: 5px;
}

.mini-desc {
  font-size: 12px;
  color: #888;
}

.chart-card {
  border-radius: 10px;
}

.chart-placeholder {
  height: 260px;
  background: #f1f3f7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.table {
  background: white;
}

.table thead {
  background: #f1f3f7;
}

@media (max-width: 768px) {
  .mini-card {
    margin-bottom: 10px;
  }
}
</style>