<template>
  <div class="wrapper">
    <panel-view />
  </div>
  <div class="filing-container" style="display: none;">
    <span class="item" id="busuanzi_container_site_pv">
      本站总访问量<span id="busuanzi_value_site_pv"></span>次
    </span>
    <span class="item" id="busuanzi_container_site_uv">
      本站访客数<span id="busuanzi_value_site_uv"></span>人
    </span>
    <span class="item" id="busuanzi_container_page_pv">
      本文总阅读量<span id="busuanzi_value_page_pv"></span>次
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PanelView from "./views/PanelView.vue";

export default defineComponent({
  name: "overView",
  components: {
    PanelView,
  },
});
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}

.wrapper {
  display: flex;
  flex-flow: column;
  background-color: #fffffe;
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
