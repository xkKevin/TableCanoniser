const option: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        xOffset: 0,
        yOffset: 0,
      },
      size: {
        width: 7,
        height: null, // 6
      },
      constraints: [
        {
          xOffset: 1,
          yOffset: 0,
          valueCstr: (value) => {
            if (typeof value === "string") return value.startsWith("$");
            return false;
          },
        },
        {
          referenceAreaPosi: "bottomLeft",
          xOffset: 0,
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
          startCell: {
            xOffset: 0,
            yOffset: 0,
          },
          size: {
            width: 2,
            height: 1,
          },
        },
        extract: {
          byPositionToTargetCols: ["Phone", "Price"],
        },
      },
      {
        match: {
          startCell: {
            xOffset: 1,
            yOffset: 1,
          },
          constraints: [
            {
              xOffset: -1,
              yOffset: 0,
              valueCstr: TableTidierKeyWords.String,
            },
            {
              xOffset: 1,
              yOffset: 0,
              valueCstr: TableTidierKeyWords.None,
            },
          ],
          traverse: {
            yDirection: "after",
          },
        },
        extract: {
          byContext: {
            position: "left",
            toTargetCols: (ctxCells) => {
              if (ctxCells[0].value === "Announced Date") return "Release Date";
              return ctxCells[0].value;
            },
          },
        },
      },
      {
        match: {
          startCell: {
            xOffset: 1,
            yOffset: 2,
          },
          size: {
            width: 6,
            height: 1,
          },
          constraints: [
            {
              xOffset: -1,
              yOffset: 0,
              valueCstr: "Dimensions",
            },
          ],
          traverse: {
            yDirection: "whole",
          },
        },
        children: [
          {
            match: {
              startCell: {
                xOffset: 1,
                yOffset: 0,
              },
              constraints: [
                {
                  xOffset: 0,
                  yOffset: 0,
                  valueCstr: (value) => {
                    if (typeof value === "string") return value.endsWith("mm");
                    return false;
                  },
                },
              ],
              traverse: {
                xDirection: "after",
              },
            },
            extract: {
              byContext: {
                position: "left",
                toTargetCols: (ctxCells) => {
                  const contextValue = ctxCells[0].value;
                  if (typeof contextValue != "string") return null;
                  if (["Height", "H"].includes(contextValue)) return "Height";
                  if (["Width", "W"].includes(contextValue)) return "Width";
                  if (["Depth", "D"].includes(contextValue)) return "Depth";
                  return null;
                },
              },
            },
          },
        ],
      },
      {
        match: {
          startCell: {
            xOffset: 1,
            yOffset: 4,
          },
          size: {
            width: 2,
            height: 1,
          },
          constraints: [
            {
              xOffset: -1,
              yOffset: 0,
              valueCstr: "Camera",
            },
          ],
          traverse: {
            yDirection: "whole",
          },
        },
        extract: {
          byValue: (currentAreaTbl) => {
            // console.log(currentAreaTbl[0].map(Number));
            return TableTidierKeyWords.pairSort(
              currentAreaTbl[0].map(Number),
              ["Front Camera", "Rear Camera"],
              "asc"
            );
          },
        },
      },
    ],
  },
];
