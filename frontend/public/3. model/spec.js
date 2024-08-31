const option: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 0,
      },
      size: {
        width: 2,
        height: "toParentY", // 5,
      },
      traverse: {
        xDirection: "after",
      },
    },
    children: [
      {
        match: {
          startCell: {
            offsetX: 0,
            offsetY: 1,
          },
          size: {
            width: 2,
            height: 1,
          },
          traverse: {
            yDirection: "after",
          },
        },
        extract: {
          byPositionToTargetCols: ["Method", "Accuracy"],
        },
      },
      {
        match: {
          startCell: {
            offsetX: 0,
            offsetY: 0,
          },
        },
        extract: {
          byPositionToTargetCols: ["Category"],
        },
      },
    ],
    fill: TableCanoniserKeyWords.Forward,
  },
];

const option2: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 1,
      },
      size: {
        width: 2,
        height: 1,
      },
      traverse: {
        xDirection: "after",
        yDirection: "after",
      },
    },
    extract: {
      byPositionToTargetCols: ["Method", "Accuracy"],
    },
    children: [
      {
        match: {
          startCell: {
            offsetLayer: "root",
            offsetX: (currentArea) => currentArea.x, // currentArea.xIndex * 2,
            offsetY: 0,
          },
        },
        extract: {
          byPositionToTargetCols: ["Category"],
        },
      },
    ],
  },
];
