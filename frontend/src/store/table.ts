import { defineStore } from 'pinia'
import Handsontable from "handsontable";
import * as d3 from 'd3';

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
      caseList: ["case1", "case2", "case3", "case5"],
      currentCase: '', // caseList[0],
      caseData: {} as TblVisData, //case1Data as TblVisData,
      mapping_spec: '',
      transform_script: '',
      input_tbl: {
        instance: {} as Handsontable,
        cells: [] as [number, number][],
      },
      output_tbl: {
        instance: {} as Handsontable,
        cells: [] as [number, number][],
      },
    }
  },
  // methods
  actions: {
    async loadCaseData(caseN: string) {
      let prompt: string[] = [];
      let case_path = `/${caseN}/`;
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

        if (dataText !== null) {
          this.caseData = JSON.parse(dataText);
        } else {
          prompt.push(`Failed to load data from ${caseN}`);
        }

        if (specText !== null) {
          this.mapping_spec = specText;
        } else {
          prompt.push(`Failed to load spec from ${caseN}`);
        }

        if (scriptText !== null) {
          this.transform_script = scriptText;
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
        if (caseData.out2in.cols[cell.col]) {
          caseData.out2in.cols[cell.col].forEach((posi) => {
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
        caseData.out2in.rows[cell.row].forEach((posi) => {
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
        let posi = caseData.out2in.cells[output_posi];
        if (posi.startsWith("[") && posi.endsWith("]")) {
          let pi_n = JSON.parse(posi) as [number, number];
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
          }
        }
      }
      return cells;
    },

    in2out_mapping(cell: TblCell) {
      let cells: TblCell[] = [];
      let posi = this.caseData.in2out[`[${cell.row},${cell.col}]`];
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
    }

  },
  // computed
  getters: {}
})