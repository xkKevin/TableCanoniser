const option: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        xOffset: 0,
        yOffset: 1,
      },
      size: {
        width: "toParentX",
        height: 5,
      },
      constraints: [
        {
          xOffset: 0,
          yOffset: 0,
          valueCstr: TableTidierKeyWords.Number,
        },
      ],
      traverse: {
        yDirection: "after",
      },
    },
    children: [
      {
        match: {
          startCell: {
            xOffset: 0,
            yOffset: 0,
          },
          size: {
            width: 4,
            height: 1,
          },
        },
        extract: {
          byPositionToTargetCols: ["Rank", "Name", "Location", "Total Score"],
        },
      },
      {
        match: {
          startCell: {
            xOffset: 1,
            yOffset: 2,
          },
          constraints: [
            {
              xOffset: 0,
              yOffset: 0,
              valueCstr: TableTidierKeyWords.Number,
            },
            {
              xOffset: 0,
              yOffset: -1,
              valueCstr: TableTidierKeyWords.String,
            },
          ],
          traverse: {
            xDirection: "after",
            yDirection: "after",
          },
        },
        extract: {
          byContext: {
            position: "above",
            toTargetCols: "cellValue",
          },
        },
        fill: "",
      },
    ],
  },
];
