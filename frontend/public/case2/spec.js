const option: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        xOffset: 0,
        yOffset: 0,
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
        },
        extract: {
          byPositionToTargetCols: ["Method", "Accuracy"],
        },
      },
      {
        match: {
          startCell: {
            xOffset: 0,
            yOffset: 0,
          },
        },
        extract: {
          byPositionToTargetCols: ["Category"],
        },
      },
    ],
    // fill: "forward"
  },
];

const option2: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        xOffset: 0,
        yOffset: 1,
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
            referenceAreaLayer: "root",
            xOffset: (currentArea) => currentArea.x, // currentArea.xIndex * 2,
            yOffset: 0,
          },
        },
        extract: {
          byPositionToTargetCols: ["Category"],
        },
      },
    ],
  },
];
