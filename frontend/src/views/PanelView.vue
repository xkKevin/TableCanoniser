<template>
  <div id="panel">
    <div class="system-name">TableTidier</div>
    <!-- <ChatBot /> -->
    <div class="main-views">
      <!-- Column 1 -->
      <div class="column left">
        <InOutTable />
      </div>

      <!-- Column 2 -->
      <div class="column center">
        <div class="view">
          <h2 class="view-title">Mapping Template Visualization</h2>
          <div class="view-content"></div>
        </div>
        <Minimap />
      </div>

      <!-- Column 3 -->
      <div class="column right">
        <div class="view">
          <div class="view-title">
            <span>Code Panel</span>
            <span style="float: right; margin-right: 50px">
              <a-button size="small" :loading="loading" @click="transformTablebyCode">Run</a-button>
            </span>
          </div>
          <div class="view-content">
            <a-tabs v-model:activeKey="codePanel" type="card">
              <a-tab-pane key="1">
                <template #tab>
                  <span>
                    <!-- <apple-outlined /> -->
                    Mapping Specification
                  </span>
                </template>
                <CodeView codeType="mapping_spec" />
              </a-tab-pane>
              <a-tab-pane key="2">
                <template #tab>
                  <span>
                    <!-- <android-outlined /> -->
                    Transformation Script
                  </span>
                </template>
                <CodeView codeType="transform_script" />
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import InOutTable from "@/components/InOutTable.vue";
import CodeView from "@/components/CodeView.vue";
import Minimap from "@/components/Minimap.vue";
import ChatBot from "@/components/ChatBot.vue";

import { useTableStore } from "@/store/table";
const tableStore = useTableStore();

const codePanel = ref("1");
const loading = ref<boolean>(false);

function transformTablebyCode() {
  loading.value = true;
  tableStore.transformTablebyCode();
  loading.value = false;
}

</script>

<style lang="less">
#panel {
  font-family: "Arial", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
  /* Background color for the whole panel */
}

.system-name {
  font-size: 23px;
  font-weight: bold;
  width: calc(100vw - 50px);
  margin-top: 3px;
  //   margin: 20px 0;
  padding: 10px 16px;
  background-color: #3498db;
  /* System name background color */
  color: white;
  /* System name text color */
  //   border-radius: 8px;
}

.main-views {
  display: flex;
  justify-content: space-between;
  width: calc(100vw - 15px);
  padding: 1px;
  box-sizing: border-box;

  .column {
    height: calc(100vh - 54px);
  }

  .left {
    flex: 6;

    .view {
      flex: 1;
    }
  }

  .center {
    flex: 5;

    .view {
      flex: 1;
    }
  }

  .right {
    flex: 5;

    .view {
      flex: 1;

      // // height: calc(100vh - 80px);
      .ant-tabs {
        height: 100%;

        .ant-tabs-content {
          height: 100%;
        }
      }
    }
  }
}

.column {
  display: flex;
  flex-direction: column;
}

.view {
  //   margin: 8px 2px 2px 8px;
  padding: 10px;
  border: 1px solid #ccc;
  //   border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  /* View background color */
}

.view-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  /* View title text color */
}

.view-content {
  // overflow-y: auto;
  overflow: hidden;
  height: calc(100% - 40px);
}

.mapping-details {
  display: flex;
  flex-direction: column;
}

.sub-view {
  margin-bottom: 5px;
  flex: 1;
}

.sub-view-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #e67e22;
  /* Sub-view title text color */
}
</style>
