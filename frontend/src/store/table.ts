import { defineStore } from 'pinia'
import Handsontable from "handsontable";
import * as d3 from 'd3';
import { shallowRef } from 'vue';

import { Table2D, TableTidierTemplate, ValueType, CellInfo } from "@/grammar/grammar"
import { transformTable, sortWithCorrespondingArray } from "@/grammar/handleSpec"

import { CustomError } from "@/types";

import { message } from 'ant-design-vue';

import * as monaco from "monaco-editor";
import * as ts from "typescript";

// import caseData from "../../public/cases.json";
// import case1Data from "../../public/case1/data.json";

// type Posi = [number, number];

// const caseList = ["case1", "case2", "case3"]

export interface TblVisData {
  input_tbl: string[][];
  output_tbl: string[][];
  output_col: string[];
  in2out: { [key: string]: string[] }
  out2in: {
    cells: { [key: string]: string },
    cols: string[][],
    rows: string[][]
  },
  ambiguous_posi?: { [key: string]: number[][] },
  [key: string]: any  // Index signature, allowing other fields
}

export interface TblCell {
  row: number;
  col: number;
  className?: string;
}

const color_config: { [key: string]: { [key: string]: string } } = {
  "posi-mapping": {
    fill: '#37bc6c',
    stroke: '#37bc6c',
    text: '#fff',
  },
  "ambiguous-cell": {
    fill: '#83e4aa',
    stroke: '#83e4aa',
    text: '#e91010',
  },
  "determined-cell": {
    fill: '#37bc6c',
    stroke: '#37bc6c',
    text: '#e91010',
    weight: 'bold',
  },
  "default": {
    fill: '#f9f7ff',
    stroke: '#cccccc',
    text: '#000',
  },
}

// define and expose a store
export const useTableStore = defineStore('table', {
  // data
  state() {
    return {
      // cases: caseData as { [key: string]: TblVisData },
      caseList: ["case1", "case2", "case3", "case4", "case5"],
      currentCase: '', // caseList[0],
      caseData: {} as TblVisData, //case1Data as TblVisData,
      editor: {
        mapping_spec: {
          code: '',
          instance: shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
        },
        transform_script: {
          code: '',
          instance: shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
        }
      },
      input_tbl: {
        instance: {} as Handsontable,
        cells: [] as [number, number][],  // highlighted cells
        tbl: shallowRef<Table2D>([]),
        in2out: shallowRef<{ [key: string]: string[] }>({}),
      },
      output_tbl: {
        instance: {} as Handsontable,
        cells: [] as [number, number][], // highlighted cells
        tbl: shallowRef<Table2D>([]),
        cols: shallowRef<string[]>([]),
        out2in: shallowRef<{
          cells: { [key: string]: string },
          cols: string[][],
          rows: string[][]
        }>({
          cells: {},
          cols: [],
          rows: [],
        }),
      },
    }
  },
  // methods
  actions: {
    async loadCaseData(caseN: string) {
      let prompt: string[] = [];
      let case_path = `./${caseN}/`;
      // const begin = Date.now();
      try {
        // Parallel processing of all fetch requests ==> faster: 0.678s vs 0.275s
        const [data_res, spec_res, script_res] = await Promise.all([
          fetch(case_path + 'data.json'),
          fetch(case_path + 'spec.js'),
          fetch(case_path + 'script.py')
        ]);

        // Parallel processing of all text extraction
        const [dataText, specText, scriptText] = await Promise.all([
          data_res.ok ? data_res.text() : Promise.resolve(null),
          spec_res.ok ? spec_res.text() : Promise.resolve(null),
          script_res.ok ? script_res.text() : Promise.resolve(null)
        ]);

        this.initTblInfo();

        if (dataText !== null) {
          this.caseData = JSON.parse(dataText);
          this.input_tbl.tbl = this.caseData.input_tbl;
          this.input_tbl.instance.updateData(this.input_tbl.tbl);
        } else {
          prompt.push(`Failed to load data from ${caseN}`);
        }

        if (specText !== null) {
          this.editor.mapping_spec.code = specText;
        } else {
          prompt.push(`Failed to load spec from ${caseN}`);
        }

        if (scriptText !== null) {
          this.editor.transform_script.code = scriptText;
        } else {
          prompt.push(`Failed to load script from ${caseN}`);
        }
      } catch (error) {
        prompt.push(`Error loading data: ${error}`);
      }
      // const end = Date.now();
      // console.log(`Loaded case ${caseN} in seconds: ${(end - begin) / 1000}`);
      this.currentCase = caseN;
      return prompt;
    },

    async loadCaseSpec(caseN: string) {
      let status = false;
      let spec = '';
      try {
        const response = await fetch(`/caseSpecs/${caseN}.js`);
        if (response.ok) {
          status = true;
          spec = await response.text();
        } else {
          status = false;
          spec = `Failed to load script from ${caseN}`;
        }
      } catch (error) {
        status = false;
        spec = `Error loading script: ${error}`;
      }
      return { status, spec };
    },

    highlightTblCells(tbl: "input_tbl" | "output_tbl", cells: TblCell[]) {
      this[tbl].instance.updateSettings({ cell: cells });
      this[tbl].cells = cells!.map((c) => [c.row, c.col] as [number, number]);
      if (this[tbl].cells.length) {
        let start_point = this.startPoint(this[tbl].cells);
        this[tbl].instance.scrollViewportTo({
          row: start_point[0],
          col: start_point[1],
          verticalSnap: "top",
          horizontalSnap: "start",
        });
      }
    },

    highlightMinimapCells(cells: TblCell[]) {
      d3.selectAll('g.matrix rect.grid-cell').attr('fill', color_config.default.fill).attr('stroke', color_config.default.stroke);
      d3.selectAll('g.matrix text.grid-text').attr('fill', color_config.default.text).attr('font-weight', 'normal');
      cells.forEach((cell) => {
        if (cell.className) {
          d3.select(`g.matrix #grid-${cell.row}-${cell.col}`)
            .attr('fill', color_config[cell.className].fill).attr('stroke', color_config[cell.className].stroke);
          d3.select(`g.matrix #text-${cell.row}-${cell.col}`).attr('fill', color_config[cell.className].text).attr('font-weight', color_config[cell.className].weight || 'normal');
        }

      });

    },

    out2in_mapping(cell: TblCell) {
      const caseData = this.caseData;
      let cells: TblCell[] = [];
      if (cell.row < 0) {
        if (this.output_tbl.out2in.cols[cell.col]) {
          this.output_tbl.out2in.cols[cell.col].forEach((posi) => {
            if (posi.startsWith("[") && posi.endsWith("]")) {
              let pi_n = JSON.parse(posi) as [number, number];
              cells.push({
                row: pi_n[0],
                col: pi_n[1],
                className: "posi-mapping",
              });
            }
          });
        }
      } else if (cell.col < 0) {
        this.output_tbl.out2in.rows[cell.row].forEach((posi) => {
          if (posi.startsWith("[") && posi.endsWith("]")) {
            let pi_n = JSON.parse(posi) as [number, number];
            cells.push({
              row: pi_n[0],
              col: pi_n[1],
              className: "posi-mapping",
            });
          }
        });
      } else {
        let output_posi = `[${cell.row},${cell.col}]`;
        let posi = this.output_tbl.out2in.cells[output_posi];
        if (posi.startsWith("[") && posi.endsWith("]")) {
          let pi_n = JSON.parse(posi) as [number, number];
          cells.push({
            row: pi_n[0],
            col: pi_n[1],
            className: "posi-mapping",
          });
          /*
          if (caseData.ambiguous_posi && output_posi in caseData.ambiguous_posi) {
            caseData.ambiguous_posi[output_posi].forEach((in_posi) => {
              cells.push({
                row: in_posi[0],
                col: in_posi[1],
                className: "ambiguous-cell",
              });
            });
            cells.push({
              row: pi_n[0],
              col: pi_n[1],
              className: "determined-cell",
            });
          } else {
            cells.push({
              row: pi_n[0],
              col: pi_n[1],
              className: "posi-mapping",
            });
          }*/
        }
      }
      return cells;
    },

    in2out_mapping(cell: TblCell) {
      let cells: TblCell[] = [];
      // let posi = this.caseData.in2out[`[${cell.row},${cell.col}]`];
      let posi = this.input_tbl.in2out[`[${cell.row},${cell.col}]`];
      if (posi) {
        posi.forEach((pi) => {
          let pi_n = JSON.parse(pi) as [number, number];
          cells.push({ row: pi_n[0], col: pi_n[1], className: "posi-mapping" });
        });
      }
      return cells;
    },

    grid_cell_click(cell: TblCell) {
      const tbl_cell = this.input_tbl.instance.getCell(cell.row, cell.col);
      if (tbl_cell) {
        let cells: TblCell[] = [{ ...cell, className: "posi-mapping" }];
        this.highlightTblCells("input_tbl", cells);
        tbl_cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
    },

    startPoint(points: [number, number][]) {
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
    },

    transformTablebyCode() {
      try {
        let code = this.editor.mapping_spec.instance!.getValue() + '\nreturn option;';
        const result = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2015,
            module: ts.ModuleKind.CommonJS
          }
        })
        // console.log(result.outputText);
        // const specification: TableTidierTemplate = eval(code);
        const evalFunction = new Function('ValueType', 'sortWithCorrespondingArray', result.outputText);
        const specification: TableTidierTemplate = evalFunction(ValueType, sortWithCorrespondingArray);

        // console.log(this.input_tbl.tbl);
        const { rootArea, tidyData } = transformTable(this.input_tbl.tbl, specification!);
        // console.log(tidyData);
        // 将tidyData转换为output_tbl.tbl，注意数据格式
        this.derivePosiMapping(tidyData);
        // console.log(this.output_tbl.tbl, this.output_tbl.cols);
        this.output_tbl.instance.updateData(this.output_tbl.tbl);
        this.output_tbl.instance.updateSettings({ colHeaders: this.output_tbl.cols });
      } catch (e) {
        let messageContent;
        console.log(e);
        if (e instanceof CustomError) {
          messageContent = `Failed to transform the table based on the specification:\n ${e}`
        } else {
          messageContent = `Failed to parse the specification:\n ${e}`
        }
        message.error({
          content: messageContent,
          style: { whiteSpace: 'pre-line' },
        });
      }
    },

    derivePosiMapping(outTbl: { [key: string]: CellInfo[] }) {

      this.initTblInfo(false);

      const cols = Object.keys(outTbl);
      this.output_tbl.cols = cols;
      const numRows = outTbl[cols[0]].length;

      // Create the out2in mapping
      for (let i = 0; i < numRows; i++) {
        const row = [];
        this.output_tbl.out2in.rows.push([]);
        for (let j = 0; j < cols.length; j++) {
          const col = cols[j];
          const cell = outTbl[col][i];
          row.push(cell.value);
          let inPosi = `[${cell.y},${cell.x}]`;
          const outPosi = `[${i},${j}]`;
          // console.log(inPosi, outPosi);
          if (cell.x < 0 || cell.y < 0) {
            inPosi = '';
          } else {
            if (this.input_tbl.in2out.hasOwnProperty(inPosi)) {
              this.input_tbl.in2out[inPosi].push(outPosi);
            } else {
              this.input_tbl.in2out[inPosi] = [outPosi];
            }
          }
          this.output_tbl.out2in.cells[outPosi] = inPosi;
          this.output_tbl.out2in.rows[i].push(inPosi);
          if (this.output_tbl.out2in.cols.length <= j) {
            this.output_tbl.out2in.cols.push([inPosi]);
          } else {
            this.output_tbl.out2in.cols[j].push(inPosi);
          }
        }
        this.output_tbl.tbl.push(row);
      }
      // console.log(outTbl);
      // console.log(this.output_tbl.out2in, this.input_tbl.in2out);
    },

    initTblInfo(inputFlag = true) {
      if (inputFlag) {
        this.input_tbl.tbl = []
        this.input_tbl.cells = [];
        this.input_tbl.in2out = {};
        this.input_tbl.instance.updateData(this.input_tbl.tbl);
      }

      this.output_tbl.tbl = [];
      this.output_tbl.cols = [];
      this.output_tbl.cells = [];
      this.output_tbl.out2in = { cells: {}, cols: [], rows: [] };
      this.output_tbl.instance.updateData(this.output_tbl.tbl);
      this.output_tbl.instance.updateSettings({ colHeaders: this.output_tbl.cols });
    },

  },
  // computed
  getters: {}
})