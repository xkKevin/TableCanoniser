const case2_1 = {
  startCell: {
    xOffset: 1,
    yOffset: 0,
  },
  size: {
    width: 2,
    height: 1,
  },
  traverse: {
    xDirection: "after",
    yDirection: "after",
  },
  transform: {
    targetCols: ["Method", "Accuracy"],
  },
  children: [
    {
      startCell: {
        referenceAreaLayer: "root",
        xOffset: (currentAreaInfo) => currentAreaInfo.xIndex * 2,
        yOffset: 0,
      },
      transform: {
        targetCols: ["Category"],
      },
    },
  ],
};

const case2_2 = {
  startCell: {
    xOffset: 0,
    yOffset: 0,
  },
  size: {
    width: 2,
    height: undefined,
  },
  constraints: [
    {
      xOffset: 1,
      yOffset: 0,
      valueCstr: ValueType.None,
    },
    {
      referenceAreaPosi: "bottomRight",
      xOffset: 0,
      yOffset: 1,
      valueCstr: ValueType.None,
    },
  ],
  traverse: {
    xDirection: "after",
    yDirection: "after",
  },
  children: [
    {
      startCell: {
        xOffset: 0,
        yOffset: 0,
      },
      transform: {
        targetCols: ["Category"],
      },
    },
    {
      startCell: {
        xOffset: 0,
        yOffset: 1,
      },
      size: {
        width: 2,
        height: 1,
      },
      traverse: {
        yDirection: "after",
      },
      transform: {
        targetCols: ["Method", "Accuracy"],
      },
    },
  ],
};
