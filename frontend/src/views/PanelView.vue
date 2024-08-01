<template>
  <div id="panel">
    <div class="system-name">
      <span id="system_name">TableTidier</span>
      <!--
      <span style="left: 20px; position: absolute;">
        <el-button type="success" plain :disabled="!mode">Select Area</el-button>
        <el-button type="success" plain :disabled="!mode">Add Constrs</el-button>
        <span style="margin: 0 10px">
          <el-dropdown @command="chooseTargetType" :trigger="mode ? 'hover' : 'click'">
            <el-button type="success" plain :disabled="!mode">
              Target Cols
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="1">Position Based</el-dropdown-item>
                <el-dropdown-item command="2">Context Based</el-dropdown-item>
                <el-dropdown-item command="3">Value Based</el-dropdown-item>
              </el-dropdown-menu>
            </template>
</el-dropdown>
</span>
<el-button type="success" plain :disabled="!mode">Add Childen</el-button>
</span>
<span style="right: 20px; position: absolute;">
  <el-switch v-model="mode" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #13ce66"
    active-text="Specification Mode" inactive-text="Presentation Mode" @change="changeMode" />
</span>
-->
    </div>
    <!-- <ChatBot /> -->
    <div class="main-views">
      <!-- Column 1 -->
      <div class="column left">
        <InOutTable />
      </div>

      <!-- Column 2 -->
      <div class="column center">
        <TemplateVis />
        <Minimap />
      </div>

      <!-- Column 3 -->
      <div class="column right">
        <div class="view">
          <div class="view-title">
            <span>Code Panel</span>
            <span style="float: right; margin-right: 30px">
              <a-button size="small" :loading="loading" @click="transformTablebyCode">
                <v-icon name="la-rocket-solid" scale="0.85"></v-icon>
                <span>Run</span>
              </a-button>
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
                <CodeView codeType="mappingSpec" />
              </a-tab-pane>
              <a-tab-pane key="2">
                <template #tab>
                  <span>
                    Root Area
                  </span>
                </template>
                <CodeView codeType="rootArea" />
              </a-tab-pane>
              <a-tab-pane key="3">
                <template #tab>
                  <span>
                    <!-- <android-outlined /> -->
                    Transformation Script
                  </span>
                </template>
                <CodeView codeType="transformScript" />
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </div>
    </div>
    <DraggableModal />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import InOutTable from "@/components/InOutTable.vue";
import CodeView from "@/components/CodeView.vue";
import Minimap from "@/components/Minimap.vue";
import TemplateVis from "@/components/TemplateVis.vue";
import DraggableModal from "@/components/DraggableModal.vue";
// import ChatBot from "@/components/ChatBot.vue";

import { useTableStore } from "@/store/table";
const tableStore = useTableStore();

const codePanel = ref("1");
const loading = ref<boolean>(false);

const mode = ref(false);

function chooseTargetType(a: any) { // 选择目标类型
  console.log(a);
}

function changeMode() {
  tableStore.specMode = mode.value;
}

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
  text-align: center;

  .el-switch__label {
    color: #fff;
    // font-size: 30px;
  }

  .el-switch__label.is-active {
    color: #7bed9f;
  }
}

.main-views {
  display: flex;
  justify-content: space-between;
  width: calc(100vw - 15px);
  padding: 1px;
  box-sizing: border-box;

  // 这是用来让图标和文字有一定间距
  svg.ov-icon+span {
    margin-left: 5px;
  }

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
  overflow: auto;
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


.ant-message-notice-content {
  white-space: pre-wrap;
  /* 使 \n 换行符生效 */
  text-align: left;
  /* 左对齐 */
  max-width: 700px;
}
</style>
