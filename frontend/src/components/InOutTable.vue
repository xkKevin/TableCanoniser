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
          :manualColumnResize="true" :renderer="renderTblCell" licenseKey="non-commercial-and-evaluation"></hot-table>
      </div>
    </div>
  </div>
  <div class="view">
    <div class="view-title">Output Table</div>
    <div class="view-content">
      <div id="output-tbl">
        <hot-table ref="outputTbl" :data="caseData.output_tbl" :rowHeaders="true" :colHeaders="output_col"
          :manualColumnResize="true" :renderer="renderTblCell" :contextMenu="true"
          licenseKey="non-commercial-and-evaluation"></hot-table>
      </div>
    </div>
  </div>
</template>

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

function renderTblCell(instance: Handsontable,
  td: HTMLElement,
  row: number,
  col: number,
  prop: any,
  value: any,
  cellProperties: any) {
  // @ts-ignore
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.innerHTML = `<div class="truncated">${value}</div>`
}

onMounted(() => {

  const proxy = getCurrentInstance()?.proxy as ComponentPublicInstance;
  inHotInst = (proxy.$refs.inputTbl as any).hotInstance as Handsontable;
  outHotInst = (proxy.$refs.outputTbl as any).hotInstance as Handsontable;

  tableStore.input_tbl.instance = inHotInst;
  tableStore.output_tbl.instance = outHotInst;

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

<style lang="less">
.handsontable {
  .truncated {
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  td.htRight {
    background-color: #3498db;
  }

  td.posi-mapping {
    color: #fff !important;
    background-color: #37bc6c;
  }

  td.ambiguous-cell {
    color: #e91010 !important;
    background-color: #83e4aa;
  }

  td.determined-cell {
    color: #e91010 !important;
    font-weight: bold;
    background-color: #37bc6c;
  }
}
</style>
