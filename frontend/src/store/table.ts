import { defineStore } from 'pinia'
import Handsontable from "handsontable";
import * as d3 from 'd3';
import { shallowRef, ref } from 'vue';

import { Table2D, TableTidierTemplate, ValueType, CellInfo, CellValueType, completeSpecification } from "@/grammar/grammar"
import { transformTable, sortWithCorrespondingArray } from "@/grammar/handleSpec"

import { CustomError } from "@/types";

import { message } from 'ant-design-vue';

import * as monaco from "monaco-editor";
import * as ts from "typescript";

// export interface TblVisData {
//   input_tbl: string[][];
//   output_tbl: string[][];
//   output_col: string[];
//   in2out: { [key: string]: string[] }
//   out2in: {
//     cells: { [key: string]: string },
//     cols: string[][],
//     rows: string[][]
//   },
//   ambiguous_posi?: { [key: string]: number[][] },
//   [key: string]: any  // Index signature, allowing other fields
// }

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
      specMode: false,
      caseList: ["case1", "case2", "case3", "case4", "case5"],
      currentCase: '', // caseList[0],
      specification: shallowRef<{ "id": string, "children": TableTidierTemplate[] }>({ "id": "root", "children": [] }),
      selectNodeSpec: shallowRef<any>(null),
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
        out2in: shallowRef<{ [key: string]: string[] }>({}),
      },
      tree: {
        contextMenuVisible: false,
        menuAllList: [{
          key: "0",
          label: "Select Area",
          title: "Select Area",
          // icon: () => h(MailOutlined),
        }, {
          key: "1",
          label: "Add Constraints",
          title: "Add Constraints",
          // icon: () => h(MailOutlined),
          // disabled: true
        }, {
          key: "2",
          label: "Set Target Cols",
          title: "Set Target Cols",
          children: [{
            key: "2-0",
            label: "Position Based",
            title: "Position Based",
          }, {
            key: "2-1",
            label: "Context Based",
            title: "Context Based",
          }, {
            key: "2-2",
            label: "Value Based",
            title: "Value Based",
          }],
        }, {
          key: "3",
          label: "Add Sub-Template",
          title: "Add Sub-Template",
          // disabled: true
          // icon: () => h(MailOutlined),
        }, {
          key: "4",
          label: "Delete Template",
          title: "Delete Template",
          // disabled: true
          // icon: () => h(MailOutlined),
        }],
        menuList: []
      }
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
          this.input_tbl.tbl = JSON.parse(dataText).input_tbl;
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

    in_out_mapping(selectedCoords: { [key: string]: [number, number][] }, type: "input_tbl" | "output_tbl") {
      const posi_mapping = type === "input_tbl" ? this.input_tbl.in2out : this.output_tbl.out2in;
      if (Object.keys(posi_mapping).length === 0) {
        return [];
      }
      let cells: TblCell[] = [];
      let posi: string[] = [];
      for (let range in selectedCoords) {
        selectedCoords[range].forEach((pi) => {
          posi = posi.concat(posi_mapping[`[${pi[0]},${pi[1]}]`]);
        });
      }
      // console.log(posi, posi_mapping);
      if (posi) {
        posi.forEach((pi) => {
          if (pi && pi.startsWith("[") && pi.endsWith("]")) {
            let pi_n = JSON.parse(pi) as [number, number];
            cells.push({ row: pi_n[0], col: pi_n[1], className: "posi-mapping" });
          }
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

    getSpec() {
      try {
        // let code = this.editor.mapping_spec.instance!.getValue();
        let code = this.editor.mapping_spec.code;
        if (code.trim() === "") return false;
        code += '\nreturn option;';
        const result = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2015,
            module: ts.ModuleKind.CommonJS
          }
        })
        // console.log(result.outputText);
        // const specification: TableTidierTemplate = eval(code);
        const evalFunction = new Function('ValueType', 'sortWithCorrespondingArray', result.outputText);
        const specs: TableTidierTemplate[] = evalFunction(ValueType, sortWithCorrespondingArray);
        specs.forEach((spec) => {
          if (!spec.hasOwnProperty('children')) {
            spec.children = [];
          }
        })
        return specs
        // const specWithDefaults = specs.map((spec) => completeSpecification(spec));
        // return specWithDefaults;
      }
      catch (e) {
        const messageContent = `Failed to parse the specification:\n ${e}`;
        message.error({
          content: messageContent,
          style: { whiteSpace: 'pre-line' },
        });
        return false
      }
    },

    transformTablebyCode() {
      try {
        // const specWithDefaults = this.getSpec();
        const specs = this.getSpec();
        if (specs === false) return;
        // console.log(this.input_tbl.tbl);
        const { rootArea, tidyData } = transformTable(this.input_tbl.tbl, specs);
        console.log(rootArea);
        if (Object.keys(tidyData).length === 0) {
          message.warning({
            content: 'The output table is empty based on the specification.',
            style: { whiteSpace: 'pre-line' },
          });
          return;
        }
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
      // const numRows = outTbl[cols[0]].length;
      const numRows = Math.max(...cols.map(col => outTbl[col].length));

      // Create the in_out mapping
      for (let i = 0; i < numRows; i++) {
        const row: CellValueType[] = [];
        // this.output_tbl.out2in.rows.push([]);
        for (let j = 0; j < cols.length; j++) {
          const col = cols[j];
          let cell: CellInfo;
          if (outTbl[col].length <= i) {
            cell = { x: -1, y: -1, value: undefined };
          } else {
            cell = outTbl[col][i];
          }
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

          if (this.output_tbl.out2in.hasOwnProperty(outPosi)) {
            this.output_tbl.out2in[outPosi].push(inPosi);
          } else {
            this.output_tbl.out2in[outPosi] = [inPosi];
          }
        }
        this.output_tbl.tbl.push(row);
      }
    },

    initTblInfo(inputFlag = true) {
      if (inputFlag) {
        this.input_tbl.tbl = []
        this.input_tbl.instance.updateData(this.input_tbl.tbl);
      }

      this.input_tbl.cells = [];
      this.input_tbl.in2out = {};

      this.output_tbl.tbl = [];
      this.output_tbl.cols = [];
      this.output_tbl.cells = [];
      this.output_tbl.out2in = {};
      this.output_tbl.instance.updateData(this.output_tbl.tbl);
      this.output_tbl.instance.updateSettings({ colHeaders: this.output_tbl.cols });
    },

    deleteChildrenByPath(path: number[]) {
      if (path.length === 0) {
        // 如果路径为空，不做任何处理
        return;
      }

      // 获取目标节点的父节点
      const parentPath = path.slice(0, -1);
      const lastIndex = path[path.length - 1];

      if (parentPath.length === 0) {
        // 如果父路径为空，说明是根节点
        this.specification.children = [];
        return;
      }

      const parentNode = this.getSpecbyPath(parentPath);

      // 删除目标节点
      if (parentNode && parentNode.children) {
        parentNode.children.splice(lastIndex, 1);
        // 如果父节点的子节点删除后为空数组，则删除children属性
        if (parentNode.children.length === 0) {
          delete parentNode.children;
        }
      }
    },

    getSpecbyPath(path: number[]) {
      if (path.length === 0) {
        // 如果路径为空，返回根节点
        return this.specification;
      }
      let currentNodes = this.specification.children;
      for (let i = 0; i < path.length; i++) {
        const index = path[i];
        // 确保路径下的节点存在
        if (!currentNodes[index]) {
          return null; // 或者抛出错误
        }
        // 如果是最后一个路径元素，返回目标节点
        if (i === path.length - 1) {
          return currentNodes[index];
        }
        // 更新当前节点为子节点
        currentNodes = currentNodes[index].children || [];
      }
      // 如果路径遍历完仍然没有找到目标节点，返回 null
      return null;
    },

  },
  // computed
  getters: {}
})