<template>
  <div id="panel">
    <div class="system-name">
      <span id="system_name">TableTidier</span>
      <span style="left: 20px; position: absolute;">
        <span style="font-size: 16px; font-weight: normal; margin-right: 5px">Cases:</span>
        <a-select ref="select" :value="currentCase" :options="caseOption" size="small" @change="handleCaseChange"
          style="width: 124px;"></a-select>
      </span>
      <span style="right: 20px; position: absolute;">
        <a-button-group>
          <a-button size="small" @click="undo" :disabled="undoFlag">
            <v-icon name="io-arrow-undo-outline" scale="0.9"></v-icon>
            <span style="margin-left: 5px">Undo</span>
          </a-button>
          <a-button size="small" @click="redo" :disabled="redoFlag">
            <v-icon name="io-arrow-redo-outline" scale="0.9"></v-icon>
            <span style="margin-left: 5px">Redo</span>
          </a-button>
        </a-button-group>
      </span>
    </div>
    <!-- <ChatBot /> -->
    <div class="main-views">
      <div class="column" style="flex: 12">
        <div style="flex: 1; display: flex;">
          <InOutTable />
        </div>

        <div style="flex: 1; display: flex;">
          <Minimap />
          <PatternVis />
        </div>
      </div>

      <div class="column" style="flex: 5;">
        <div class="view">
          <div class="view-title">
            <span>Code Panel</span>
            <span style="float: right; margin-right: 20px">
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
                    Specification
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
              <!-- <a-tab-pane key="3">
                <template #tab>
                  <span>
                    Transformation Script
                  </span>
                </template>
                <CodeView codeType="transformScript" />
              </a-tab-pane> -->
            </a-tabs>
          </div>
        </div>
      </div>
    </div>
    <DraggableModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import InOutTable from "@/components/InOutTable.vue";
import CodeView from "@/components/CodeView.vue";
import Minimap from "@/components/Minimap.vue";
import PatternVis from "@/components/PatternVis.vue";
import DraggableModal from "@/components/DraggableModal.vue";
// import ChatBot from "@/components/ChatBot.vue";

import { typeMapColor, TypeColor } from '@/tree/style';
for (const key in typeMapColor) {
  document.documentElement.style.setProperty(`--color-${key}`, typeMapColor[key as TypeColor]);
}

import { useTableStore } from "@/store/table";
const tableStore = useTableStore();

// let caseOption: Ref<{ value: string; label: string; }[]> = ref([]);
let caseOption = ref<{ value: string; label: string }[]>([]);

caseOption.value = tableStore.caseList.map((v) => {
  return { value: v, label: v };
});

let currentCase = ref(tableStore.caseList[0]);

const codePanel = ref("1");
const loading = ref<boolean>(false);

const undoFlag = computed(() => tableStore.spec.undoHistory.length === 0);
const redoFlag = computed(() => tableStore.spec.redoHistory.length === 0);

// 撤销操作
function undo() {
  const lastSpec = tableStore.spec.undoHistory.pop();
  if (lastSpec !== undefined) {
    tableStore.spec.redoHistory.push(tableStore.editor.mappingSpec.code);
    tableStore.editor.mappingSpec.code = lastSpec;
  }
}

// 重做操作
function redo() {
  const lastUndo = tableStore.spec.redoHistory.pop();
  if (lastUndo !== undefined) {
    tableStore.spec.undoHistory.push(tableStore.editor.mappingSpec.code);
    tableStore.editor.mappingSpec.code = lastUndo;
  }
}

function transformTablebyCode() {
  loading.value = true;
  tableStore.transformTablebyCode();
  loading.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    // 按下 ESC 键时清除所有高亮、选中等
    tableStore.editor.mappingSpec.decorations?.clear();
    tableStore.input_tbl.instance.deselectCell();
    tableStore.output_tbl.instance.deselectCell();
    tableStore.input_tbl.instance.updateSettings({ cell: [] });
    tableStore.output_tbl.instance.updateSettings({ cell: [] });
    tableStore.highlightMinimapCells([]);

    const typeNodes = document.querySelectorAll('.type-node');
    typeNodes.forEach((node) => {
      (node as HTMLElement).classList.remove('selection');
    });
  }
}

function handleCaseChange(value: string) {
  currentCase.value = value;
  // fileList.value = [];
  tableStore.loadCaseData(value);
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  handleCaseChange(currentCase.value);
});

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


.ant-message-notice-content {
  white-space: pre-wrap;
  /* 使 \n 换行符生效 */
  text-align: left;
  /* 左对齐 */
  max-width: 700px;
}

.ant-btn-default {
  transition: 0s;
}

.ant-btn-default:hover {
  svg path {
    stroke: #4494fc;
  }
}

.ant-btn-default:disabled {
  background-color: #ffffff;
  border-color: #d9d9d9;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.25);

  svg path {
    stroke: rgba(0, 0, 0, 0.25);
  }
}
</style>
