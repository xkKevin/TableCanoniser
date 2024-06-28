<template>
  <div class="wrapper">
    <panel-view />
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
