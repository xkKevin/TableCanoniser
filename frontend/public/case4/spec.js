const option: TableTidierTemplate[] = [
  {
    match: {
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
    },
    extract: {
      byContext: {
        position: (cell, currentArea) => {
          return [
            {
              xOffset: cell.xOffset,
              yOffset:
                cell.yOffset - (currentArea.yIndex + 1) * currentArea.height,
            },
          ];
        },
        toTargetCols: "cellValue",
      },
    },
  },
];
