const option: TableTidierTemplate = {
  startCell: {
    xOffset: 0,
    yOffset: 0,
  },
  size: {
    width: "toParentX", // 12,
    height: null,
  },
  constraints: [
    {
      xOffset: 5,
      yOffset: 0,
      valueCstr: "Employee Previous Earnings",
    },
    {
      referenceAreaPosi: "bottomLeft",
      xOffset: 0,
      yOffset: 0,
      valueCstr: (value) => {
        if (typeof value === "string") return value.startsWith("ACME Payroll");
        return false;
      },
    },
  ],
  traverse: {
    yDirection: "after",
  },
  fill: "forward",
  children: [
    {
      startCell: {
        xOffset: 0,
        yOffset: 4,
      },
      size: {
        width: 2,
      },
      transform: {
        targetCols: ["EmployeeID", "Employee Name"],
      },
    },
    {
      startCell: {
        xOffset: 0,
        yOffset: 8,
      },
      size: {
        width: "toParentX",
      },
      traverse: {
        yDirection: "after",
      },
      transform: {
        context: {
          position: (cell) => {
            let xOffset = cell.xOffset,
              yOffset = 7;
            if (cell.xOffset == 4) yOffset = 6;
            return [
              {
                xOffset,
                yOffset,
                referenceAreaLayer: "parent",
              },
            ];
          },
          targetCol: "cellValue",
        },
        targetCols: "context",
      },
    },
  ],
};
