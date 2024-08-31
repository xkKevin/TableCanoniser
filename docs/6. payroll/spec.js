const option: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 0,
      },
      size: {
        width: "toParentX", // 12,
        height: null,
      },
      constraints: [
        {
          offsetX: 5,
          offsetY: 0,
          valueCstr: "Employee Previous Earnings",
        },
        {
          offsetFrom: "bottomLeft",
          offsetX: 0,
          offsetY: 1,
          valueCstr: (value) => {
            if (typeof value === "string")
              return value.startsWith("ACME Payroll");
            return false;
          },
        },
      ],
      traverse: {
        yDirection: "after",
      },
    },
    fill: "", // TableCanoniserKeyWords.Forward,
    children: [
      {
        match: {
          startCell: {
            offsetX: 0,
            offsetY: 4,
          },
          size: {
            width: 2,
          },
        },
        extract: {
          byPositionToTargetCols: ["EmployeeID", "Employee Name"],
        },
      },
      {
        match: {
          startCell: {
            offsetX: 0,
            offsetY: 8,
          },
          size: {
            width: "toParentX",
          },
          traverse: {
            yDirection: "after",
          },
        },
        extract: {
          byContext: {
            position: (cell) => {
              let offsetX = cell.offsetX,
                offsetY = 7;
              if (cell.offsetX == 4) offsetY = 6;
              return [
                {
                  offsetX,
                  offsetY,
                  offsetLayer: "parent",
                },
              ];
            },
          },
        },
      },
    ],
  },
];
