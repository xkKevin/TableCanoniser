import { BaseType } from 'd3-selection';

export interface KV {
  [key: string]: any;
}
export interface TypeNode {
  type: Array<string>,
  typeFeature: string | null,
  typeValue: string | null,
  children: Array<TypeNode | null>,
  id?: string,
  parentId?: string,
  typeProportion: Array<number>
  parentType: string,
  [key: string]: any,
}

export type svgSelection = d3.Selection<BaseType, unknown, HTMLElement, any>;

export interface Point {
  x: number,
  y: number
}

export interface RectDef {
  startx: number,
  starty: number,
  rectWidth: number,
  rectHeight: number,
  rectColor: string,
  rounded: 'left' | 'right' | 'top' | 'bottom' | 'all' | 'no',
  radius: number,
}

export const edgeType = {
  TypeAggr: 'typeAggr',
  KeyOptional: 'keyOptional',
  ValueMultipleType: 'valueMultipleType',
};

export interface NodeSpecificInfo {
  connectorLineColor: string,
  connectorLineWidth: number,
  dataType: string,
  parentType: string,
  dataTypeFeature: 'typeAggr' | 'keyOptional' | 'valueMultipleType',
  dataTypeText: null | string,
  dataTypeTextTruncated?: null | string,
  expanded: boolean,
  nodeId: number,
  nodeCircleRadius: number,
  nodeBorderRadius: number,
  nodeHeight: number,
  nodeWidth: number,
  nodeMultipleRectInfo: Array<RectDef> | [],
  nodeFillColor: string | Array<string>,
  parentNodeId: number,
  totalSubordinates: number,
  directSubordinates: number,
  shiftFromEndCenter: number,
  shiftFromStartCenter: Map<string, number>,
}
export interface treeDrawingData {
  children: Array<treeDrawingData> | null,
  hiddenChildren?: Array<treeDrawingData> | null,
  depth: number,
  height: 3,
  id: string,
  parent: treeDrawingData,
  x: number,
  x0: number,
  y: number,
  y0: number,
  data: NodeSpecificInfo,
  // expanded: boolean,
}
