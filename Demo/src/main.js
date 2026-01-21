import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "material-icons/iconfont/material-icons.css";
import "@/assets/styles/admin.css";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

const app = createApp(App);

app.use(router);
app.component("v-select", vSelect);

app.mount("#app");
