import { defineStore } from 'pinia'
import Handsontable from "handsontable";
import * as d3 from 'd3';
import { shallowRef } from 'vue';

import { Table2D, TableTidierTemplate, ValueType, CellInfo, CellValueType, AreaInfo } from "@/grammar/grammar"
import { transformTable, serialize, sortWithCorrespondingArray } from "@/grammar/handleSpec"
import { TreeChart } from '@/tree/drawTree';
import { CustomError } from "@/types";

import { message } from 'ant-design-vue';

import * as monaco from "monaco-editor";
import * as ts from "typescript";
import { colorConfig } from '@/tree/style';
// import { cloneDeep } from 'lodash';

function replaceEvenSpaces(str: string) {
  // 使用正则表达式匹配连续的空格
  return str.replace(/ {2,}/g, (match) => {
    // 获取连续空格的数量
    const length = match.length;

    // 计算一半的空格数量
    const halfLength = length / 2;

    // 返回一半数量的空格
    return ' '.repeat(halfLength);
  });
}

// 去除所有空格
function removeWhitespace(str: string) {
  return str.replace(/ /g, '') // .replace(/\s+/g, '');  这个会把换行符也去掉
}

const removeSpaceType = {
  even: replaceEvenSpaces,
  all: removeWhitespace,
}

export interface TblCell {
  row: number;
  col: number;
  className?: string;
}

interface TreeNode {
  [key: string]: any,
  children?: TreeNode[];
}

interface AreaBox {
  width: number,
  height: number,
  x: number,
  y: number,
}

export interface VisTreeNode extends TableTidierTemplate, AreaBox {
  matchs?: AreaBox[]
  children?: VisTreeNode[]
}

export interface AreaForm {
  referenceAreaLayer: any,
  referenceAreaPosi: any,
  position: {
    x: any,
    y: any
  },
  traverse: {
    xDirection: any,
    yDirection: any
  },
  size: {
    width: any,
    height: any
  }
}

// define and expose a store
export const useTableStore = defineStore('table', {
  // data
  state() {
    return {
      specMode: false,
      caseList: ["case1", "case2", "case3", "case4", "case5"],
      currentCase: '', // caseList[0],
      spec: {
        undoHistory: [] as string[],  // 这里不能是 shallowRef，要不然 computed 计算不会被更新
        redoHistory: [] as string[],
        rawSpecs: shallowRef<TableTidierTemplate[]>([]),
        visTree: shallowRef<VisTreeNode>({ width: 0, height: 0, x: 0, y: 0, children: [] }),
        visTreeMatchPath: shallowRef<{ [key: string]: VisTreeNode }>({}),
        selectNode: shallowRef<any>(null),
        /** 1表示add area, 2表示edit area, 3表示add constraint, 4表示edit constraint */
        selectAreaFlag: 0 as 0 | 1 | 2 | 3 | 4,
        dragConfigOpen: false,
        areaConfig: shallowRef<TableTidierTemplate>({
          startCell: {},
          size: {},
          traverse: {},
          transform: null,
          constraints: [],
          fill: '',
          children: [],
        }),
        areaFormData: shallowRef<AreaForm>({
          referenceAreaLayer: null,
          referenceAreaPosi: null,
          position: {
            x: null,
            y: null
          },
          traverse: {
            xDirection: null,
            yDirection: null
          },
          size: {
            width: null,
            height: null
          }
        }),
      },
      editor: {
        mappingSpec: {
          code: '',
          codePref: 'const option: TableTidierTemplate[] = ',
          codeSuff: '\nreturn option;',
          errorMark: null as monaco.editor.IMarker | null,
          decorations: shallowRef<monaco.editor.IEditorDecorationsCollection | null>(null),
          // highlightCode: null as [number, number] | null,
          language: 'typescript',
          instance: shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
        },
        rootArea: {
          code: '',
          // codePref: 'const rootArea: AreaInfo = ',
          object: shallowRef<AreaInfo | null>(null),
          language: 'json',
          instance: shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
        },
        transformScript: {
          code: '',
          language: 'python',
          instance: shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
        }
      },
      input_tbl: {
        instance: {} as Handsontable,
        // cells: [] as [number, number][],  // highlighted cells
        tbl: shallowRef<Table2D>([]),
        in2out: shallowRef<{ [key: string]: string[] }>({}),
      },
      output_tbl: {
        instance: {} as Handsontable,
        // cells: [] as [number, number][], // highlighted cells
        tbl: shallowRef<Table2D>([]),
        cols: shallowRef<string[]>([]),
        out2in: shallowRef<{ [key: string]: string[] }>({}),
      },
      tree: {
        contextMenuVisible: false,
        visInst: shallowRef<TreeChart | null>(null),
        menuAllList: [{
          key: "0",
          label: "Reset Area",
          title: "Reset Area",
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
        menuList: [] as Array<{ [key: string]: any }>,
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
          // 每次都是页面刷新后，所有单元格/列的宽度为50，只有点击一下界面之后，才会突然自动列大小，变成有的列width大一点，有的列width小一点，这是为什么呢
          // 通常是由于Handsontable在初始化时还没有正确计算出表格容器的尺寸，或者在Vue组件生命周期的某个阶段，Handsontable的重新渲染没有正确触发。这个问题可能与表格渲染的时机有关。
          this.input_tbl.instance.render();
          // document.getElementById('system_name')?.click();
          this.transformTblUpdateRootArea()
        } else {
          prompt.push(`Failed to load data from ${caseN}`);
        }

        if (specText !== null) {
          this.spec.undoHistory = [];
          this.spec.redoHistory = [];
          this.editor.mappingSpec.code = specText;
        } else {
          prompt.push(`Failed to load spec from ${caseN}`);
        }

        if (scriptText !== null) {
          this.editor.transformScript.code = scriptText;
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

    traverseTree(nodes: AreaInfo[]) {
      let visNode: VisTreeNode | null = null;
      nodes.forEach((node) => {
        const path = node.templateRef.toString()
        if (!this.spec.visTreeMatchPath.hasOwnProperty(path)) {
          visNode = this.getNodebyPath(this.spec.visTree.children!, node.templateRef) as VisTreeNode;
          if (visNode === null) return;
          this.spec.visTreeMatchPath[path] = visNode;
          visNode.matchs = [{
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
          }];
        } else {
          this.spec.visTreeMatchPath[path].matchs!.push({
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
          });
        }
        this.traverseTree(node.children)
      })
    },

    transformTblUpdateRootArea(specs: TableTidierTemplate[] = []) {
      const { rootArea, tidyData } = transformTable(this.input_tbl.tbl, specs);
      // this.editor.rootArea.codePref + JSON.stringify(rootArea)
      this.editor.rootArea.object = rootArea;
      this.editor.rootArea.code = serialize(rootArea);
      // this.editor.rootArea.instance!.setValue(this.editor.rootArea.code);
      this.traverseTree(rootArea.children);
      return tidyData;
    },

    highlightTblCells(tbl: "input_tbl" | "output_tbl", cells: TblCell[], coords: [number, number][] | null = null) {
      this[tbl].instance.updateSettings({ cell: cells });
      if (coords === null) {
        coords = cells!.map((c) => [c.row, c.col] as [number, number]);
      }
      if (coords.length) {
        let { topLeft, rowSize, colSize } = this.startPoint(coords);
        // 滚动到中间位置
        const visibleRows = this[tbl].instance.countVisibleRows();
        const visibleCols = this[tbl].instance.countVisibleCols();
        this[tbl].instance.scrollViewportTo({
          row: rowSize === 1 ? Math.max(0, topLeft[0] - Math.floor(visibleRows / 2)) : Math.max(0, topLeft[0] - 2),
          col: colSize === 1 ? Math.max(0, topLeft[1] - Math.floor(visibleCols / 2)) : Math.max(0, topLeft[1] - 1),
          verticalSnap: "top",
          horizontalSnap: "start",
        });
      }
    },

    highlightMinimapCells(cells: TblCell[]) {
      d3.selectAll('g.matrix rect.grid-cell').attr('fill', colorConfig.default.fill).attr('stroke', colorConfig.default.stroke);
      d3.selectAll('g.matrix text.grid-text').attr('fill', colorConfig.default.text).attr('font-weight', 'normal');
      cells.forEach((cell) => {
        if (cell.className) {
          d3.select(`g.matrix #grid-${cell.row}-${cell.col}`).raise()
            // @ts-ignore
            .attr('fill', colorConfig[cell.className].fill).attr('stroke', colorConfig[cell.className].stroke);
          // @ts-ignore
          d3.select(`g.matrix #text-${cell.row}-${cell.col}`).attr('fill', colorConfig[cell.className].text).attr('font-weight', colorConfig[cell.className].weight || 'normal');
        }

      });

    },

    in_out_mapping(selectedCoords: { [key: string]: [number, number][] }, type: "input_tbl" | "output_tbl", className: string = "posi-mapping") {
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
            cells.push({ row: pi_n[0], col: pi_n[1], className });
          }
        });
      }
      return cells;
    },

    getHightlightedCells(selected: Array<[number, number, number, number]>, className: string = "posi-mapping") {
      let selectedCoords: { [key: string]: [number, number][] } = {};
      let hightedCells: { row: number, col: number, className: string }[] = [];
      // 遍历选定区域
      selected.forEach(range => {
        let startRow = range[0] < 0 ? 0 : range[0];
        let startCol = range[1] < 0 ? 0 : range[1];
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
            hightedCells.push({ row, col, className });
          }
        }
      });
      return { selectedCoords, hightedCells };
    },

    grid_cell_click(cell: TblCell, className: string = "posi-mapping") {
      let cells: TblCell[] = [{ ...cell, className }];
      this.highlightTblCells("input_tbl", cells);
      let outTblCells = this.in_out_mapping({ "0": [[cell.row, cell.col]] }, "input_tbl", className);
      this.highlightTblCells("output_tbl", outTblCells);
      // const tbl_cell = this.input_tbl.instance.getCell(cell.row, cell.col);
      // console.log(381, tbl_cell);
      // if (tbl_cell) {
      //   let cells: TblCell[] = [{ ...cell, className }];
      //   this.highlightTblCells("input_tbl", cells);
      //   tbl_cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      // }
    },

    startPoint(points: [number, number][]) {
      let topLeft = points[0];
      const rows = new Set([topLeft[0]]);
      const cols = new Set([topLeft[1]]);

      for (let i = 1; i < points.length; i++) {
        let current = points[i];
        rows.add(current[0]);
        cols.add(current[1]);
        if (
          current[0] < topLeft[0] ||
          (current[0] === topLeft[0] && current[1] < topLeft[1])
        ) {
          topLeft = current;
        }
      }

      return {
        topLeft,
        rowSize: rows.size,
        colSize: cols.size,
      };
    },

    setSpec() {
      try {
        // let code = this.editor.mappingSpec.instance!.getValue();
        let code = this.editor.mappingSpec.code;
        if (code.trim() === "") return false;
        code += this.editor.mappingSpec.codeSuff;
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
        this.spec.rawSpecs = specs;
        this.spec.visTree.children = JSON.parse(JSON.stringify(specs)); // cloneDeep(specs);
        // this.spec.visTree.children!.forEach((spec) => {
        //   if (!spec.hasOwnProperty('children')) {
        //     spec.children = [];
        //   }
        // })
        return true
      }
      catch (e) {
        message.error(`Failed to parse the specification:\n ${e}`);
        return false
      }
    },

    transformTablebyCode() {
      if (this.editor.mappingSpec.errorMark != null) {
        const marker = this.editor.mappingSpec.errorMark;
        message.error(`Invalid syntax at Line ${marker.startLineNumber}, Column ${marker.startColumn}:\n ${marker.message}`);
        return;
      }
      try {
        const specs = this.spec.rawSpecs;
        // this.stringifySpec(); // 更新(格式化) editor.mappingSpec.code
        this.spec.visTreeMatchPath = {};
        const tidyData = this.transformTblUpdateRootArea(specs);
        this.initTblInfo(false);

        if (Object.keys(tidyData).length === 0) {
          message.warning('The output table is empty based on the specification.');
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
        message.error(messageContent);
      }
    },

    derivePosiMapping(outTbl: { [key: string]: CellInfo[] }) {
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

      this.input_tbl.in2out = {};

      this.output_tbl.tbl = [];
      this.output_tbl.cols = [];
      this.output_tbl.out2in = {};
      this.output_tbl.instance.updateData(this.output_tbl.tbl);
      this.output_tbl.instance.updateSettings({ colHeaders: this.output_tbl.cols });
    },

    deleteChildByPath(nodes: TreeNode[], path: number[]) {
      if (path.length === 0) {
        // 如果路径为空，不做任何处理
        return;
      }

      // 获取目标节点的父节点
      const parentPath = path.slice(0, -1);
      const lastIndex = path[path.length - 1];

      if (parentPath.length === 0) {
        // 如果父路径为空，说明父节点是根节点
        nodes.splice(lastIndex, 1);
        return;
      }

      const parentNode = this.getNodebyPath(nodes, parentPath);

      // 删除目标节点
      if (parentNode && parentNode.children) {
        parentNode.children.splice(lastIndex, 1);
        // 如果父节点的子节点删除后为空数组，则删除children属性
        if (parentNode.children.length === 0) {
          delete parentNode.children;
        }
      }
    },

    getNodebyPath(nodes: TreeNode[], path: number[]) {
      if (path.length === 0) return null; // 如果路径为空，返回null

      let currentNodes = nodes
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
    /**
     * 默认根据rawSpecs更新editor.mappingSpec.code
     */
    stringifySpec(specs: TableTidierTemplate[] | TableTidierTemplate | null = null, replaceSpace: "even" | "all" = "even", replaceCode = true) {
      let fnList: string[] = [];
      if (specs === null) specs = this.spec.rawSpecs;
      let strSpec = JSON.stringify(specs, replacer, 2);
      fnList.forEach((fn) => {
        strSpec = strSpec.replace(`"$TableTidier$"`, fn);
      })

      // 正则表达式匹配 JSON 对象中的键（包括可能的空白字符和引号）
      const removeQuotesFromKeysRegex = /"(\w+)":/g;
      strSpec = strSpec.replace(removeQuotesFromKeysRegex, '$1:');

      const replaceTableTidierKeyWordsRegex = /"TableTidier\.(\w+)"/g;
      strSpec = strSpec.replace(replaceTableTidierKeyWordsRegex, 'ValueType.$1');

      if (replaceSpace === "all") {
        strSpec = removeSpaceType.all(strSpec);
      }

      if (replaceCode) {
        this.editor.mappingSpec.code = this.editor.mappingSpec.codePref + strSpec;
        // this.editor.mappingSpec.instance?.setValue(this.editor.mappingSpec.code);
        // this.editor.mappingSpecinstance?.getAction('editor.action.formatDocument')?.run();
        // this.editor.mappingSpec.instance?.trigger('editor', 'editor.action.formatDocument', null);
      }

      function replacer(key: string, value: any) {
        if (typeof value === 'function') {
          fnList.push(removeSpaceType[replaceSpace](value.toString()));
          return "$TableTidier$" // value.toString(); // 将函数转化为字符串
        }
        return value;
      }

      return strSpec;
    },

    selectArea() {
      const node = this.spec.selectNode;
      const formData = this.spec.areaFormData
      const newSpec: TableTidierTemplate = {
        startCell: {
          referenceAreaLayer: formData.referenceAreaLayer,
          referenceAreaPosi: formData.referenceAreaPosi,
          xOffset: formData.position.x,
          yOffset: formData.position.y,
        },
        size: {
          width: formData.size.width,
          height: formData.size.height,
        },
        traverse: {
          xDirection: formData.traverse.xDirection,
          yDirection: formData.traverse.yDirection,
        }
      }
      if (node.path.length === 0) {
        // 当前节点为根节点
        this.spec.rawSpecs.push(newSpec);
      } else {
        const currentSpec = this.getNodebyPath(this.spec.rawSpecs, node.path);
        if (currentSpec === null) {
          message.error("The node path is invalid");
          return;
        }
        if (currentSpec.hasOwnProperty('children') && currentSpec.children != undefined) {
          currentSpec.children.push(newSpec)
        } else {
          currentSpec.children = [newSpec];
        }
      }
      this.stringifySpec();
    },
    // 复制属性的函数
    copyAttributes(source: TreeNode, target: TreeNode, attributes: string[]) {
      for (const attr of attributes) {
        if (source.hasOwnProperty(attr)) {
          target[attr] = source[attr];
        }
      }
    },

    // 递归遍历树并复制属性
    copyTreeAttributes(tree1: TreeNode, tree2: TreeNode, attributes = ['width', 'height', 'x', 'y']) {
      this.copyAttributes(tree1, tree2, attributes);

      if (tree1.children && tree2.children) {
        if (tree1.children.length > tree2.children.length) {
          console.log(tree1.children);
          console.log(tree2.children);
        }
        for (let i = 0; i < tree1.children.length; i++) {
          // console.log(tree1.children[i], tree2.children[i]);
          this.copyTreeAttributes(tree1.children[i], tree2.children[i], attributes);
        }
      }
    },
    highlightCode(startLine: number, endLine: number = startLine) {
      const editor = this.editor.mappingSpec.instance
      const decorationsCollection = this.editor.mappingSpec.decorations
      if (editor && decorationsCollection) {
        const range = new monaco.Range(startLine, 1, endLine, 1);
        const newDecorations: monaco.editor.IModelDeltaDecoration[] = [
          {
            range,
            options: {
              isWholeLine: true,
              className: 'myLineDecoration',
            },
          },
        ];
        // 更新装饰集合
        decorationsCollection.set(newDecorations);
        // editor.revealLineInCenter(startLine);
        // editor.revealLineNearTop(startLine);
        // editor.revealRangeNearTopIfOutsideViewport(range);
        // editor.setSelection(range);  // 选择范围
        editor.revealRangeAtTop(range);
      }
    }
  },
  // computed
  getters: {}
})


export type TableStore = ReturnType<typeof useTableStore>;