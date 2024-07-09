import { defineStore } from 'pinia'

// import caseData from "../../public/cases.json";
// import case1Data from "../../public/case1/data.json";

// type Posi = [number, number];

const caseList = ["case1", "case2", "case3"]

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

// define and expose a store
export const useTableStore = defineStore('table', {
  // data
  state() {
    return {
      // cases: caseData as { [key: string]: TblVisData },
      caseList: caseList,
      currentCase: '', // caseList[0],
      caseData: {} as TblVisData, //case1Data as TblVisData,
      mapping_spec: '',
      transformation_script: '',
    }
  },
  // methods
  actions: {
    async loadCaseData(caseN: string) {
      let prompt: string[] = [];
      let case_path = `/${caseN}/`;
      try {
        const data_res = await fetch(case_path + 'data.json');
        if (data_res.ok) {
          this.caseData = JSON.parse(await data_res.text());
        } else {
          prompt.push(`Failed to load data from ${caseN}`);
        }
        const spec_res = await fetch(case_path + 'spec.js');
        if (spec_res.ok) {
          this.mapping_spec = await spec_res.text();
        } else {
          prompt.push(`Failed to load spec from ${caseN}`);
        }
        const script_res = await fetch(case_path + 'script.py');
        if (script_res.ok) {
          this.transformation_script = await script_res.text();
        } else {
          prompt.push(`Failed to load script from ${caseN}`);
        }
      } catch (error) {
        prompt.push(`Error loading data: ${error}`);
      }
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
    }
  },
  // computed
  getters: {}
})