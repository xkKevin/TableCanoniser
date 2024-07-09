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
      transform_script: '',
    }
  },
  // methods
  actions: {
    async loadCaseData(caseN: string) {
      let prompt: string[] = [];
      let case_path = `/${caseN}/`;
      try {
        // Parallel processing of all fetch requests
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