const option: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 0,
        offsetY: 1,
      },
      size: {
        width: 4,
        height: 5,
      },
      traverse: {
        yDirection: "after",
      },
      constraints: [
        {
          offsetX: 0,
          offsetY: 0,
          valueCstr: TableCanoniserKeyWords.Number,
        },
      ],
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
          size: {
            width: 3,
            height: 1,
          },
        },
        extract: {
          byContext: {
            position: "above",
          },
        },
      },
      {
        match: {
          startCell: {
            offsetX: 1,
            offsetY: 4,
          },
          size: {
            width: 3,
            height: 1,
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

const option2: TableCanoniserTemplate[] = [
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
          valueCstr: TableCanoniserKeyWords.Number,
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
              valueCstr: TableCanoniserKeyWords.Number,
            },
            {
              offsetX: 0,
              offsetY: -1,
              valueCstr: TableCanoniserKeyWords.String,
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
