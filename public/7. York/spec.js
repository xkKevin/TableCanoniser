const option: TableCanoniserTemplate[] = [
  {
    match: {
      startCell: {
        offsetX: 1,
        offsetY: 2,
      },
      size: {
        width: 3,
        height: null,
      },
      constraints: [
        {
          valueCstr: TableCanoniserKeyWords.NotNone,
        },
        {
          offsetFrom: "bottomLeft",
          offsetY: 1,
          valueCstr: TableCanoniserKeyWords.None,
        },
      ],
      traverse: {
        yDirection: "after",
      },
    },
    children: [
      {
        match: {
          traverse: {
            xDirection: "after",
            yDirection: "after",
          },
        },
        extract: {
          byPositionToTargetCols: ["value"],
        },
        children: [
          {
            match: {
              startCell: {
                offsetLayer: "root",
                offsetX: (currentArea) => currentArea.x,
              },
            },
            extract: {
              byPositionToTargetCols: ["arms@1"],
            },
          },
          {
            match: {
              startCell: {
                offsetLayer: "parent",
                offsetX: -1,
                offsetY: -1,
              },
            },
            extract: {
              byPositionToTargetCols: ["characteristic@1"],
            },
          },
          {
            match: {
              startCell: {
                offsetLayer: "root",
                offsetY: (currentArea) => currentArea.y,
              },
            },
            extract: {
              byPositionToTargetCols: ["characteristic@2"],
            },
          },
        ],
      },
    ],
  },
];
