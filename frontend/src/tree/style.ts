export const typeMapColor = {
  // Pattern selection
  position: 'rgba(106, 176, 76)',    // '#6ab04c',
  positionShallow: 'rgba(106, 176, 76, 0.65)',// '#badc58'
  context: 'rgba(240, 147, 43)', // '#f0932b', 
  contextShallow: 'rgba(240, 147, 43, 0.65)', // '#ffbe76'
  value: 'rgba(34, 166, 179)', // '#22a6b3',
  valueShallow: 'rgba(34, 166, 179, 0.65)', // '#7ed6df'
  null: 'rgba(131, 149, 167)', // '#8395a7',
  nullShallow: 'rgba(131, 149, 167, 0.65)', // '#c8d6e5',
  // Table selection
  selection: 'rgba(9, 132, 227)',  // '#0984e3',
  selectionShallow: 'rgba(9, 132, 227, 0.65)',

  positionRGBA: 'rgba(106, 176, 76, 0.5)',
  contextRGBA: 'rgba(240, 147, 43, 0.5)',
  valueRGBA: 'rgba(34, 166, 179, 0.5)',
  nullRGBA: 'rgba(131, 149, 167, 0.5)',
  selectionRGBA: 'rgba(9, 132, 227, 0.5)',

  ambiguousText: '#f9f7ff', // 'rgba(233, 16, 16, 0.5)',

  // Minimap
  cellFill: '#f9f7ff',
  cellStroke: '#cccccc',
};

export type TypeColor = keyof typeof typeMapColor;

// Dictionary: '#83b5ed',
// Array: '#7EAA55',
// String: '#D07C94',
// Number: '#EEB189',
// Boolean: '#926EB8',
// Null: '#E7D6D6',

/*
export const colorConfig = {
  "posi-mapping": {
    fill: '#0984e3',
    stroke: '#0984e3',
    text: '#fff',
  },
  "posi-mapping-shallow": {
    fill: '#74b9ff',
    stroke: '#74b9ff',
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
  }
}
*/

export const typeNodeStyle = {
  nodeWidth: 96, // 100,
  nodeHeight: 30,
  nodeRectFillColor: "#7EAA55",
  nodeCircleFillColor: "#83b5ed",
  nodeCircleRadius: 15,
  nodeBorderRadius: 5,
  verticalLineLength: 40,
  verticalLineWidth: 5,
  nodeSpacing: 30,
  connectorLineColor: '#0000004D', // 树中link的颜色
  connectorLineWidth: 1.5,
  iconsize: 15, // 树中node上侧constraint icon的大小
  iconPadding: 10,  // 树中node上侧constraint icon的间距
};

export const nodeTextStyle = {
  color: 'white',
  fontSize: 15,
  yAxisAdjust: 2,
};