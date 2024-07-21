const case1 = {
  startCell: {
    xOffset: 0,
    yOffset: 0,
  },
  size: {
    width: 4,
    height: 5,
  },
  constraints: [
    {
      xOffset: 0,
      yOffset: 0,
      valueCstr: ValueType.Number,
    },
  ],
  traverse: {
    yDirection: "after",
  },
  children: [
    {
      startCell: {
        xOffset: 0,
        yOffset: 0,
      },
      size: {
        width: 4,
        height: 1,
      },
      transform: {
        targetCols: ["Rank", "Name", "Location", "Total Score"],
      },
    },
    {
      startCell: {
        xOffset: 2,
        yOffset: 1,
      },
      constraints: [
        {
          xOffset: 0,
          yOffset: 0,
          valueCstr: ValueType.Number,
        },
        {
          xOffset: 0,
          yOffset: -1,
          valueCstr: ValueType.String,
        },
      ],
      traverse: {
        xDirection: "after",
        yDirection: "after",
      },
      transform: {
        context: {
          position: "top",
          targetCol: "cellValue",
        },
        targetCols: "context",
      },
    },
  ],
};
