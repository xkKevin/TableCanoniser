const option: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 7,
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
      byPositionToTargetCols: [
        "Index",
        "Sub Account Name",
        "",
        "Yesterday Available Credit",
        "Yesterday Reserved Credit",
        "Yesterday Frozen Credit",
        "",
        "Total Debit Transactions",
        "Total Debit Amount",
        "",
        "",
        "Today Net Deposit Amount ",
        "",
        "Sub Account No.",
        "",
        "Today Available Credit",
        "Today Reserved Credit",
        "Today Frozen Credit",
        "",
        "Total Credit Transactions",
        "Total Credit Amount",
        "",
        "",
        "",
      ],
    },
  },
];

const option2: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 7,
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
              offsetX: cell.offsetX,
              offsetY:
                cell.offsetY - (currentArea.yIndex + 1) * currentArea.height,
            },
          ];
        },
      },
    },
  },
];
