import { defineStore } from 'pinia'

import caseData from "@/assets/data/case.json";


interface TblVisData {
  input_tbl: string[][];
  output_tbl: string[][];
  output_col: string[];
  in2out: { [key: string]: string[] }
  out2in: {
    cells: { [key: string]: string },
    cols: string[][],
    rows: string[][]
  },
  [key: string]: any  // Index signature, allowing other fields
}

// define and expose a store
export const useTableStore = defineStore('table', {
  // data
  state() {
    return {
      cases: caseData as { [key: string]: TblVisData }
    }
  },
  // methods
  actions: {},
  // computed
  getters: {}
})