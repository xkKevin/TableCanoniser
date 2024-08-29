const option: TableTidierTemplate[] = [
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
    fill: TableTidierKeyWords.Forward,
  },
];

const option2: TableTidierTemplate[] = [
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
