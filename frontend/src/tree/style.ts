export const typeMapColor = {
  position: '#83b5ed',
  context: '#7EAA55',
  value: '#D07C94',
  null: '#EEB189',
};

// Dictionary: '#83b5ed',
// Array: '#7EAA55',
// String: '#D07C94',
// Number: '#EEB189',
// Boolean: '#926EB8',
// Null: '#E7D6D6',

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


export const typeNodeStyle = {
  nodeWidth: 100,
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

export const edgeTextStyle = {
  fontSize: 18,
  color: 'red',
  distFromEdge: 4,
};
