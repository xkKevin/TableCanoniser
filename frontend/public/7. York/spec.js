const option: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        xOffset: 1,
        yOffset: 2,
      },
      size: {
        width: 3,
        height: null,
      },
      constraints: [
        {
          valueCstr: TableTidierKeyWords.NotNone,
        },
        {
          referenceAreaPosi: "bottomLeft",
          yOffset: 1,
          valueCstr: TableTidierKeyWords.None,
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
                referenceAreaLayer: "root",
                xOffset: (currentArea) => currentArea.x,
              },
            },
            extract: {
              byPositionToTargetCols: ["arms@1"],
            },
          },
          {
            match: {
              startCell: {
                referenceAreaLayer: "parent",
                xOffset: -1,
                yOffset: -1,
              },
            },
            extract: {
              byPositionToTargetCols: ["characteristic@1"],
            },
          },
          {
            match: {
              startCell: {
                referenceAreaLayer: "root",
                yOffset: (currentArea) => currentArea.y,
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
