const option: TableTidierTemplate[] = [
  {
    startCell: {
      xOffset: 0,
      yOffset: 7,
    },
    size: {
      width: "toParentX", // 12,
      height: 2,
    },
    traverse: {
      yDirection: "after",
    },
    transform: {
      context: {
        position: (cell, currentArea) => {
          return [
            {
              xOffset: cell.xOffset,
              yOffset:
                cell.yOffset - (currentArea.yIndex + 1) * currentArea.height,
            },
          ];
        },
        targetCol: "cellValue",
      },
      targetCols: "context",
    },
  },
];
