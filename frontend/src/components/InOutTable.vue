<template>
  <div class="view">
    <div class="view-title">
      <span class="head-text"> Input Table </span>
      <span class="toolbar" style="float: right; margin-right: 50px">
        <span class="controller">
          <a-select ref="select" :value="currentCase" :options="caseOption" size="small" @change="handleCaseChange"
            @mouseenter="showDropdown" @mouseleave="hideDropdown"></a-select>
        </span>
      </span>
    </div>
    <div class="view-content">
      <div id="input-tbl">
        <hot-table ref="inputTbl" :data="caseData.input_tbl" :rowHeaders="true" :colHeaders="true"
          :manualColumnResize="true" licenseKey="non-commercial-and-evaluation"></hot-table>
      </div>
    </div>
  </div>
  <div class="view">
    <div class="view-title">Output Table</div>
    <div class="view-content">
      <div id="output-tbl">
        <hot-table ref="outputTbl" :data="caseData.output_tbl" :rowHeaders="true" :colHeaders="output_col"
          :manualColumnResize="true" :contextMenu="true" licenseKey="non-commercial-and-evaluation"></hot-table>
      </div>
    </div>
  </div>
</template>

<!-- <script lang="ts">
import { defineComponent } from "vue";
import { HotTable } from "@handsontable/vue3";
import "handsontable/dist/handsontable.full.css";

export default defineComponent({
  name: "InOutTable",
  components: { HotTable },
});
</script> -->

<script setup lang="ts">
import {
  getCurrentInstance,
  ComponentPublicInstance,
  ref,
  onMounted,
} from "vue";
import { HotTable } from "@handsontable/vue3";
import "handsontable/dist/handsontable.full.css";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import { useTableStore, TblVisData } from "@/store/table";

// register Handsontable's modules
registerAllModules();

const tableStore = useTableStore();
// const tblCases: { [key: string]: TblVisData } = tableStore.cases;
let caseData: TblVisData = tableStore.caseData;
let output_col = ref(caseData.output_col);

// let caseOption: Ref<{ value: string; label: string; }[]> = ref([]);
let caseOption = ref<{ value: string; label: string }[]>([]);

caseOption.value = tableStore.caseList.map((v) => {
  return { value: v, label: v };
});

let currentCase = ref(tableStore.caseList[0]);

// let caseData = ref(tblCases[currentCase.value]);
// let caseData = tblCases[currentCase.value];

let inHotInst: Handsontable;
let outHotInst: Handsontable;

// onBeforeMount(async () => { // if onBeforeMount is async, it may execute after onMounted
//   console.log("1");
//   let prompt = await tableStore.loadCaseData();
//   caseData = tableStore.caseData;
//   console.log(prompt, caseData, tableStore.mapping_spec);
//   console.log("3", caseData);
// });

// let prompt = async () => await tableStore.loadCaseData();
// prompt();
// caseData = tableStore.caseData;
// console.log("prompt", prompt, caseData);

// async () => {
//   let prompt = await tableStore.loadCaseData();
//   caseData = tableStore.caseData;
//   loading.value = true;
// }

onMounted(() => {

  const proxy = getCurrentInstance()?.proxy as ComponentPublicInstance;
  inHotInst = (proxy.$refs.inputTbl as any).hotInstance as Handsontable;
  outHotInst = (proxy.$refs.outputTbl as any).hotInstance as Handsontable;

  tableStore.input_tbl.instance = inHotInst;
  tableStore.output_tbl.instance = outHotInst;

  // console.log("96", proxy.$refs.inputTbl, proxy.$refs.testTbl, proxy.$refs.Chat);

  // const inputTbl = ref();
  // console.log("sdfsdf", inputTbl);
  // const outputTbl = ref();

  // inHotInst = inputTbl.value.hotInstance;
  // outHotInst = outputTbl.value.hotInstance;
  // console.log("sdfsdf", inputTbl);

  outHotInst.updateSettings({
    outsideClickDeselects: () => {
      inHotInst.updateSettings({ cell: [] });
      tableStore.highlightMinimapCells([])
      return true;
    },
  });
  outHotInst.addHook("afterOnCellMouseDown", () => {
    inHotInst.updateSettings({ cell: [] });
  });
  outHotInst.addHook("afterOnCellMouseUp", (event, coords, grid) => {
    const cells = tableStore.out2in_mapping(coords);
    tableStore.highlightTblCells("input_tbl", cells);
    tableStore.highlightMinimapCells(cells);
  });

  inHotInst.updateSettings({
    outsideClickDeselects: (event) => {
      outHotInst.updateSettings({ cell: [] });
      return true;
    },
  });
  inHotInst.addHook("afterOnCellMouseDown", () => {
    outHotInst.updateSettings({ cell: [] });
  });
  inHotInst.addHook("afterOnCellMouseUp", (event, coords, TD) => {
    const cells = tableStore.in2out_mapping(coords);
    tableStore.highlightTblCells("output_tbl", cells);
    tableStore.highlightMinimapCells([{ ...coords, className: "posi-mapping" }]);
  });
  handleCaseChange(currentCase.value);
});

function showDropdown() {
  //   isOpen = true;
}
function hideDropdown() {
  //   isOpen = false;
}
async function handleCaseChange(value: string) {
  currentCase.value = value;
  // tableStore.currentCase = value;
  // caseData = tblCases[currentCase.value];
  await tableStore.loadCaseData(value);
  caseData = tableStore.caseData;
  output_col.value = caseData.output_col;
  inHotInst.updateData(caseData.input_tbl);
  outHotInst.updateData(caseData.output_tbl);
}
</script>

<style scoped></style>
