// File: src/pages/sales/composables/useBanHangToast.js
import { onBeforeUnmount, reactive, ref } from "vue";

export function useBanHangToast() {
  const toast = reactive({ show: false, msg: "", type: "success" });
  const toastTimer = ref(null);

  function showToast(msg, type = "success") {
    if (toastTimer.value) clearTimeout(toastTimer.value);
    toast.show = true;
    toast.msg = msg;
    toast.type = type;

    toastTimer.value = setTimeout(() => {
      toast.show = false;
    }, 2600);
  }

  function hideToast() {
    toast.show = false;
  }

  onBeforeUnmount(() => {
    try {
      if (toastTimer.value) clearTimeout(toastTimer.value);
    } catch (e) {}
  });

  return { toast, showToast, hideToast };
}