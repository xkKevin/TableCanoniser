const option: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 1,
      },
      size: {
        width: "toParentX",
        height: 5,
      },
      constraints: [
        {
          offsetX: 0,
          offsetY: 0,
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
            offsetX: 0,
            offsetY: 0,
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
            offsetX: 1,
            offsetY: 2,
          },
          constraints: [
            {
              offsetX: 0,
              offsetY: 0,
              valueCstr: TableTidierKeyWords.Number,
            },
            {
              offsetX: 0,
              offsetY: -1,
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
          },
        },
      },
    ],
  },
];
