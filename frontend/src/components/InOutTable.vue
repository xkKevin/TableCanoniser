<template>
  <div class="view left1">
    <div class="view-title">
      <span class="head-text"> Input Table </span>
      <span class="toolbar" style="float: right; margin-right: 50px">
        <span class="controller">
          <a-select
            ref="select"
            :value="currentCase"
            :options="caseOption"
            size="small"
            @change="handleCaseChange"
            @mouseenter="showDropdown"
            @mouseleave="hideDropdown"
          ></a-select>
        </span>
      </span>
    </div>
    <div class="view-content">
      <div id="input-tbl">
        <hot-table
          ref="inputTbl"
          :data="caseData.input_tbl"
          :rowHeaders="true"
          :colHeaders="true"
          :manualColumnResize="true"
          licenseKey="non-commercial-and-evaluation"
        ></hot-table>
      </div>
    </div>
  </div>
  <div class="view left2">
    <div class="view-title">Output Table</div>
    <div class="view-content">
      <div id="output-tbl">
        <hot-table
          ref="outputTbl"
          :data="caseData.output_tbl"
          :rowHeaders="true"
          :colHeaders="caseData.output_col"
          :manualColumnResize="true"
          :contextMenu="true"
          licenseKey="non-commercial-and-evaluation"
        ></hot-table>
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
import { getCurrentInstance, ref, ComponentPublicInstance } from "vue";
import { registerAllModules } from "handsontable/registry";
import { useTableStore } from "@/store/table";

// register Handsontable's modules
registerAllModules();

const proxy = getCurrentInstance()?.proxy as ComponentPublicInstance;

const inHotInst = (proxy.$refs.inputTbl as any).hotInstance;
const outHotInst = (proxy.$refs.outputTbl as any).hotInstance;
outHotInst.updateSettings({
  outsideClickDeselects: (event) => {
    inHotInst.updateSettings({ cell: [] });
    return true;
  },
});
outHotInst.addHook("afterOnCellMouseUp", (event, coords, TD) => {
  let cell = [];
  //   console.log(coords);
  let cell_posi = [];
  if (coords.row < 0) {
    if (this.caseData.out2in.cols[coords.col]) {
      this.caseData.out2in.cols[coords.col].forEach((posi) => {
        if (posi.startsWith("[") && posi.endsWith("]")) {
          posi = JSON.parse(posi);
          cell.push({
            row: posi[0],
            col: posi[1],
            className: "posi-mapping",
          });
          cell_posi.push(posi);
        }
      });
    }
  } else if (coords.col < 0) {
    this.caseData.out2in.rows[coords.row].forEach((posi) => {
      if (posi.startsWith("[") && posi.endsWith("]")) {
        posi = JSON.parse(posi);
        cell.push({
          row: posi[0],
          col: posi[1],
          className: "posi-mapping",
        });
        cell_posi.push(posi);
      }
    });
  } else {
    let output_posi = `[${coords.row},${coords.col}]`;
    let posi = this.caseData.out2in.cells[output_posi];
    console.log(222, output_posi, posi);
    if (posi.startsWith("[") && posi.endsWith("]")) {
      if (
        this.caseData.ambiguous_posi &&
        output_posi in this.caseData.ambiguous_posi
      ) {
        this.caseData.ambiguous_posi[output_posi].forEach((in_posi) => {
          cell.push({
            row: in_posi[0],
            col: in_posi[1],
            className: "ambiguous-cell",
          });
        });
        posi = JSON.parse(posi);
        cell.push({
          row: posi[0],
          col: posi[1],
          className: "determined-cell",
        });
      } else {
        posi = JSON.parse(posi);
        cell.push({
          row: posi[0],
          col: posi[1],
          className: "posi-mapping",
        });
      }
      cell_posi.push(posi);
    }
  }
  inHotInst.updateSettings({ cell });
  if (cell_posi.length) {
    let start_point = this.startPoint(cell_posi);
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
  let cell = [];
  let posi = this.caseData.in2out[`[${coords.row},${coords.col}]`];
  if (posi) {
    posi.forEach((pi) => {
      pi = JSON.parse(pi);
      cell.push({ row: pi[0], col: pi[1], className: "posi-mapping" });
      outHotInst.scrollViewportTo({
        row: pi[0],
        col: pi[1],
        verticalSnap: "top",
        horizontalSnap: "start",
      });
    });
  }
  outHotInst.updateSettings({ cell });
});
</script>

<style scoped lang="less">
</style>
