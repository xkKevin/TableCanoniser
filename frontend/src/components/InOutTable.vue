<template>
  <div class="view">
    <div class="view-title">
      <span class="head-text"> Input Table </span>
      <span class="toolbar" style="float: right; margin-right: 5px">
        <span class="controller">
          <a-space>
            <a-select ref="select" :value="currentCase" :options="caseOption" size="small"
              @change="handleCaseChange"></a-select>
            <a-upload v-model:file-list="fileList" :max-count="1" accept=".csv, .txt, .xls, .xlsx"
              :customRequest="handleUpload" @remove="handleRemove">
              <a-button size="small">
                <v-icon name="bi-upload" scale="0.85" />
                <span>Upload</span>
              </a-button>
            </a-upload>
          </a-space>
        </span>
      </span>
    </div>
    <div class="view-content">
      <div id="input-tbl">
        <hot-table ref="inputTbl" :data="caseData.input_tbl" :rowHeaders="true" :colHeaders="true"
          :manualColumnResize="true" :renderer="renderTblCell" :contextMenu="true"
          licenseKey="non-commercial-and-evaluation"></hot-table>
      </div>
    </div>
  </div>
  <div class="view">
    <div class="view-title">
      <span>Output Table</span>
      <span style="float: right; margin-right: 30px">
        <a-button size="small" @click="handleDownload">
          <v-icon name="bi-download" scale="0.85"></v-icon>
          <span>Download</span>
        </a-button>
      </span>
    </div>
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
// import Papa from 'papaparse';  // parse csv data
import * as XLSX from 'xlsx';  // parse excel data
import { Table2D } from "@/grammar/grammar"
import { message } from "ant-design-vue";

// import { ArrowUpTrayIcon } from '@heroicons/vue/24/solid'

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

// const handleUploadChange = (info: any) => {
//   if (info.file.status === 'done') {
//     message.success(`${info.file.name} file uploaded successfully`);
//   } else if (info.file.status === 'error') {
//     message.error(`${info.file.name} file upload failed.`);
//   }
// };

const fileList = ref([]);
// const fileList = ref<UploadProps['fileList']>([{
//     uid: '1',
//     name: 'xxx.png',
//     status: 'done',
//     response: 'Server Error 500', // custom error message to show
//     url: 'http://www.baidu.com/xxx.png',
//   },]);

const handleUpload = (request: any) => {
  // console.log(request.file);
  // setTimeout(() => {
  //   request.onSuccess("ok");
  // }, 0);
  try {
    const reader = new FileReader();
    // if (request.file.type === 'text/csv' || request.file.type === 'text/plain') {
    //   reader.onload = (e) => {
    //     console.log(e);
    //     const data = e.target?.result;
    //     parseCsvData(data as string);
    //   }
    //   reader.readAsText(request.file);
    // } else if (request.file.type.endsWith('sheet') || request.file.type.endsWith('excel')) {

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData: Table2D = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Determine the maximum number of columns
      const maxColumns = Math.max(...rawData.map(row => row.length));

      // Ensure all rows have the same number of columns
      const tblData = rawData.map(row => {
        while (row.length < maxColumns) {
          row.push(undefined); // Fill missing cells with an empty string or a placeholder
        }
        return row;
      });
      tableStore.initTblInfo()
      tableStore.input_tbl.tbl = tblData;
      tableStore.input_tbl.instance.updateData(tblData);
      request.onSuccess("ok");
      // message.success(`${request.file.name} file uploaded successfully`);
    };
    reader.readAsArrayBuffer(request.file);
  } catch (error) {
    message.error({
      content: `${request.file.name} file uploaded failed.\n${error}`,
      style: { whiteSpace: 'pre-line' },
    });
  }
};

const handleRemove = () => {
  tableStore.initTblInfo()
};

// const handlePreview = (file: any) => {
//   console.log(file.name);
// };

// const parseCsvData = (csv: string) => {
//   Papa.parse(csv, {
//     complete: (results) => {
//       console.log("parseCsvData", results.data);
//     },
//     header: false,
//     skipEmptyLines: false
//   });
// };

// 函数用于将二维数组转换为 CSV 格式
function arrayToCSV(array: Table2D) {
  return array.map(row => row.map(cell => `${cell === undefined ? '' : cell}`).join(',')).join('\n');
}

const handleDownload = () => {
  if (tableStore.output_tbl.cols.length === 0) {
    message.warning('The output table is empty.');
    return;
  }
  const csv = arrayToCSV([tableStore.output_tbl.cols, ...tableStore.output_tbl.tbl]);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tidy table.csv'; // 下载文件的名称
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // 释放内存

  message.success('The output table has been downloaded successfully.');
};

function initEventsForTbl(tbl: "input_tbl" | "output_tbl") {
  let tblInst1: Handsontable, tblInst2: Handsontable;
  const tbl2 = tbl === "input_tbl" ? "output_tbl" : "input_tbl";
  if (tbl === "input_tbl") {
    tblInst1 = inHotInst;
    tblInst2 = outHotInst;
  } else {
    tblInst1 = outHotInst;
    tblInst2 = inHotInst;
  }
  tblInst1.updateSettings({
    outsideClickDeselects: (targetEle) => {
      if (targetEle?.className === "wtHolder") {
        return false;
      } else {
        tblInst2.updateSettings({ cell: [] });
        if (tbl === "output_tbl") {
          tableStore.highlightMinimapCells([])
        }
        return true;
      }
    },
  });
  tblInst1.addHook("afterOnCellMouseDown", () => {
    tblInst2.updateSettings({ cell: [] });
  });
  tblInst1.addHook("afterOnCellMouseUp", (event, coords, TD) => {
    const selected = tblInst1.getSelected() || [];
    // key 表示所选区域，value 表示所选区域所有单元格的坐标
    let selectedCoords: { [key: string]: [number, number][] } = {};
    let hightedCells: { row: number, col: number, className: string }[] = [];
    // 遍历选定区域
    selected.forEach(range => {
      let startRow = range[0];
      let startCol = range[1];
      let endRow = range[2];
      let endCol = range[3];

      if (startRow > endRow) {
        [startRow, endRow] = [endRow, startRow];
      }
      if (startCol > endCol) {
        [startCol, endCol] = [endCol, startCol];
      }

      selectedCoords[range.toString()] = [];
      // 遍历行
      for (let row = startRow; row <= endRow; row++) {
        // 遍历列
        for (let col = startCol; col <= endCol; col++) {
          // 将坐标添加到数组中
          selectedCoords[range.toString()].push([row, col]);
          hightedCells.push({ row, col, className: "posi-mapping" });
        }
      }
    });

    // 打印所有坐标
    // console.log(selectedCoords);

    const cells = tableStore.in_out_mapping(selectedCoords, tbl);
    tableStore.highlightTblCells(tbl2, cells);
    // tableStore.highlightMinimapCells([{ ...coords, className: "posi-mapping" }]);
    if (tbl === "output_tbl") {
      tableStore.highlightMinimapCells(cells);
    } else {
      tableStore.highlightMinimapCells(hightedCells);
    }

    /*
    let data = [];
    if (selected.length === 1) {
      data = inHotInst.getData(...selected[0]);

    } else {
      for (let i = 0; i < selected.length; i += 1) {
        data.push(inHotInst.getData(...selected[i]));
      }
    }
    console.log(selected, data, coords);  // 打印所选区域的坐标及数据
    */

  });
}

onMounted(() => {

  const proxy = getCurrentInstance()?.proxy as ComponentPublicInstance;
  inHotInst = (proxy.$refs.inputTbl as any).hotInstance as Handsontable;
  outHotInst = (proxy.$refs.outputTbl as any).hotInstance as Handsontable;

  tableStore.input_tbl.instance = inHotInst;
  tableStore.output_tbl.instance = outHotInst;

  initEventsForTbl("input_tbl");
  initEventsForTbl("output_tbl");

  handleCaseChange(currentCase.value);

});

// function showDropdown() {
//   //   isOpen = true;
// }
// function hideDropdown() {
//   //   isOpen = false;
// }

function handleCaseChange(value: string) {
  currentCase.value = value;
  // tableStore.currentCase = value;
  // caseData = tblCases[currentCase.value];
  fileList.value = [];
  tableStore.loadCaseData(value);
  // handleRemove();
  // inHotInst.updateData(tableStore.input_tbl.tbl);
  // outHotInst.updateData(tableStore.output_tbl.tbl);
  // output_col.value = caseData.output_col;

  // caseData.output_tbl && outHotInst.updateData(caseData.output_tbl);
}
</script>

<style lang="less">
.ant-upload-wrapper {
  position: relative;

  .ant-upload {
    display: inline-block;
    margin-right: 60px;
  }

  .ant-upload-list {
    position: absolute;
    top: -11px;
    right: -2px;
    cursor: pointer;
  }

  .ant-upload-list-item-name {
    color: #1677ff;
    padding: 0 0 0 2px !important;
    max-width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

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
