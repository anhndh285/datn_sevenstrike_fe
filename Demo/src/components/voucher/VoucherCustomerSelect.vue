<!-- File: src/components/voucher/VoucherCustomerSelect.vue -->
<template>
  <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
    <h3 class="h6 fw-bold mb-3">Chọn khách hàng</h3>

    <input
      v-if="!disabled"
      v-model="search"
      type="text"
      class="form-control mb-3 bg-light border-0"
      placeholder="Tìm kiếm khách hàng..."
    />

    <div class="table-responsive" style="max-height: 500px">
      <table class="table align-middle small">
        <thead class="bg-light sticky-top">
          <tr>
            <th v-if="!disabled">
              <input type="checkbox" @change="onToggleAll" :checked="isAllSelected" />
            </th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in paginated" :key="c.id">
            <td v-if="!disabled">
              <input type="checkbox" :value="Number(c.id)" v-model="selectedIds" />
            </td>
            <td>{{ c.tenKhachHang }}</td>
            <td>{{ c.email }}</td>
            <td>{{ c.soDienThoai }}</td>
          </tr>

          <tr v-if="paginated.length === 0">
            <td :colspan="disabled ? 3 : 4" class="text-center text-secondary py-4">
              Không có khách hàng phù hợp
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="small text-secondary">Đã chọn: {{ selectedIds.length }}</div>

      <nav v-if="totalPages > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" type="button" @click="prevPage" :disabled="page === 1">
              <span class="material-icons fs-6">chevron_left</span>
            </button>
          </li>

          <li class="page-item" :class="{ disabled: page === totalPages }">
            <button class="page-link" type="button" @click="nextPage" :disabled="page === totalPages">
              <span class="material-icons fs-6">chevron_right</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  customers: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const search = ref("");
const page = ref(1);
const pageSize = 5;

const normalizeIds = (arr) =>
  [...new Set((arr || []).map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);

const sameArray = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

// ✅ local state
const selectedIds = ref(normalizeIds(props.modelValue));

// ✅ emit khi THỰC SỰ đổi
watch(
  selectedIds,
  (newVal) => {
    const cleaned = normalizeIds(newVal);
    const currentProps = normalizeIds(props.modelValue);

    if (sameArray(cleaned, currentProps)) return; // ✅ chống loop
    emit("update:modelValue", cleaned);
  },
  { deep: true }
);

// ✅ nhận từ cha: chỉ set khi khác
watch(
  () => props.modelValue,
  (newVal) => {
    const incoming = normalizeIds(newVal);
    const currentLocal = normalizeIds(selectedIds.value);

    if (sameArray(incoming, currentLocal)) return; // ✅ chống loop
    selectedIds.value = incoming;
  },
  { deep: true }
);

const filtered = computed(() => {
  const s = (search.value || "").toLowerCase().trim();
  const list = Array.isArray(props.customers) ? props.customers : [];
  if (!s) return list;

  return list.filter(
    (c) =>
      c?.tenKhachHang?.toLowerCase().includes(s) ||
      String(c?.soDienThoai || "").includes(s)
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));

const paginated = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value);
  const start = (safePage - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

watch(
  () => filtered.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
    if (page.value < 1) page.value = 1;
  }
);

const isAllSelected = computed(() => {
  if (filtered.value.length === 0) return false;
  const set = new Set(selectedIds.value.map(Number));
  return filtered.value.every((c) => set.has(Number(c.id)));
});

const onToggleAll = (e) => {
  const checked = e.target.checked;

  if (checked) {
    const ids = new Set(selectedIds.value);
    filtered.value.forEach((c) => ids.add(Number(c.id)));
    selectedIds.value = normalizeIds(Array.from(ids));
  } else {
    const removeSet = new Set(filtered.value.map((c) => Number(c.id)).filter((n) => Number.isFinite(n) && n > 0));
    selectedIds.value = normalizeIds(selectedIds.value.filter((id) => !removeSet.has(Number(id))));
  }
};

const prevPage = () => {
  if (page.value > 1) page.value--;
};

const nextPage = () => {
  if (page.value < totalPages.value) page.value++;
};
</script>
