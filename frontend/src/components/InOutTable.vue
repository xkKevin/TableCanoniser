<template>
  <div class="view left1">
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
  <div class="view left2">
    <div class="view-title">Output Table</div>
    <div class="view-content">
      <div id="output-tbl">
        <hot-table ref="outputTbl" :data="caseData.output_tbl" :rowHeaders="true" :colHeaders="output_col"
          :manualColumnResize="true" :contextMenu="true" licenseKey="non-commercial-and-evaluation"></hot-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { HotTable } from "@handsontable/vue3";
import "handsontable/dist/handsontable.full.css";

export default defineComponent({
  name: "InOutTable",
  components: { HotTable },
});
</script>

<script setup lang="ts">
import {
  getCurrentInstance,
  ComponentPublicInstance,
  ref,
  onMounted,
} from "vue";
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

function startPoint(points: [number, number][]) {
  let topLeft = points[0];

  for (let i = 1; i < points.length; i++) {
    let current = points[i];
    if (
      current[0] < topLeft[0] ||
      (current[0] === topLeft[0] && current[1] < topLeft[1])
    ) {
      topLeft = current;
    }
  }

  return topLeft;
}

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
      return true;
    },
  });
  outHotInst.addHook("afterOnCellMouseUp", (event, coords) => {
    let cell: Handsontable.GridSettings["cell"] = [];
    let cell_posi: [number, number][] = [];
    if (coords.row < 0) {
      if (caseData.out2in.cols[coords.col]) {
        caseData.out2in.cols[coords.col].forEach((posi) => {
          if (posi.startsWith("[") && posi.endsWith("]")) {
            let pi_n = JSON.parse(posi) as [number, number];
            cell.push({
              row: pi_n[0],
              col: pi_n[1],
              className: "posi-mapping",
            });
            cell_posi.push(pi_n);
          }
        });
      }
    } else if (coords.col < 0) {
      caseData.out2in.rows[coords.row].forEach((posi) => {
        if (posi.startsWith("[") && posi.endsWith("]")) {
          // posi = JSON.parse(posi);
          let pi_n = JSON.parse(posi) as [number, number];
          cell.push({
            row: pi_n[0],
            col: pi_n[1],
            className: "posi-mapping",
          });
          cell_posi.push(pi_n);
        }
      });
    } else {
      let output_posi = `[${coords.row},${coords.col}]`;
      let posi = caseData.out2in.cells[output_posi];
      if (posi.startsWith("[") && posi.endsWith("]")) {
        let pi_n = JSON.parse(posi) as [number, number];
        if (caseData.ambiguous_posi && output_posi in caseData.ambiguous_posi) {
          caseData.ambiguous_posi[output_posi].forEach((in_posi) => {
            cell.push({
              row: in_posi[0],
              col: in_posi[1],
              className: "ambiguous-cell",
            });
          });
          cell.push({
            row: pi_n[0],
            col: pi_n[1],
            className: "determined-cell",
          });
        } else {
          cell.push({
            row: pi_n[0],
            col: pi_n[1],
            className: "posi-mapping",
          });
        }
        cell_posi.push(pi_n);
      }
    }
    inHotInst.updateSettings({ cell });
    if (cell_posi.length) {
      let start_point = startPoint(cell_posi);

      inHotInst.scrollViewportTo({
        row: start_point[0],
        col: start_point[1],
        verticalSnap: "top",
        horizontalSnap: "start",
      });
    }
  });

  inHotInst.updateSettings({
    outsideClickDeselects: (event) => {
      outHotInst.updateSettings({ cell: [] });
      return true;
    },
  });
  inHotInst.addHook("afterOnCellMouseUp", (event, coords, TD) => {
    let cell: Handsontable.GridSettings["cell"] = [];
    let posi = caseData.in2out[`[${coords.row},${coords.col}]`];
    if (posi) {
      posi.forEach((pi) => {
        let pi_n = JSON.parse(pi) as [number, number];
        cell.push({ row: pi_n[0], col: pi_n[1], className: "posi-mapping" });
        outHotInst.scrollViewportTo({
          row: pi_n[0],
          col: pi_n[1],
          verticalSnap: "top",
          horizontalSnap: "start",
        });
      });
    }
    outHotInst.updateSettings({ cell });
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
