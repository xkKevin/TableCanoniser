const case4_1 = {
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
    targetCols: [
      "Index",
      "Sub Account Name",
      null,
      "Yesterday Available Credit",
      "Yesterday Reserved Credit",
      "Yesterday Frozen Credit",
      null,
      "Total Debit Transactions",
      "Total Debit Amount",
      null,
      null,
      "Today Net Deposit Amount",
      null,
      "Sub Account No.",
      null,
      "Today Available Credit",
      "Today Reserved Credit",
      "Today Frozen Credit",
      null,
      "Total Credit Transactions",
      "Total Credit Amount",
      null,
      null,
      null,
    ],
  },
};

const case4_2 = {
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
      position: (currentAreaInfo) => {
        return currentAreaInfo.areaCells.map((ci) => {
          return {
            xOffset: ci.xOffset,
            yOffset:
              ci.yOffset -
              (currentAreaInfo.yIndex + 1) * currentAreaInfo.height,
          };
        });
      },
      targetCol: "cellValue",
    },
    targetCols: "context",
  },
};
