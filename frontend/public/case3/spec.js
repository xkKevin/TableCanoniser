const case3 = {
  startCell: {
    xOffset: 0,
    yOffset: 0,
  },
  size: {
    width: 7,
    height: undefined, // 6
  },
  constraints: [
    {
      xOffset: 0,
      yOffset: 1,
      valueCstr: (value) => {
        if (typeof value === "string") return value.startsWith("$");
        return false;
      },
    },
    {
      referenceAreaPosi: "bottomLeft",
      xOffset: 0,
      yOffset: 1,
      valueCstr: ValueType.None,
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
        width: 2,
        height: 1,
      },
      transform: {
        targetCols: ["Phone", "Price"],
      },
    },
    {
      startCell: {
        xOffset: 1,
        yOffset: 1,
      },
      constraints: [
        {
          xOffset: -1,
          yOffset: 0,
          valueCstr: ValueType.String,
        },
        {
          xOffset: 1,
          yOffset: 0,
          valueCstr: ValueType.None,
        },
      ],
      traverse: {
        yDirection: "after",
      },
      transform: {
        context: {
          position: "left",
          targetCol: (contextValue) => {
            if (contextValue === "Announced Date") return "Release Date";
            return contextValue;
          },
        },
        targetCols: "context",
      },
    },
    {
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
      children: [
        {
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
          transform: {
            context: {
              position: "left",
              targetCol: (contextValue) => {
                if (typeof contextValue != "string") return null;
                if (["Height", "H"].includes(contextValue)) return "Height";
                if (["Width", "W"].includes(contextValue)) return "Width";
                if (["Depth", "D"].includes(contextValue)) return "Depth";
                return null;
              },
            },
            targetCols: "context",
          },
        },
        {
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
          transform: {
            targetCols: (currentAreaCells) => {
              return sortWithCorrespondingArray(
                currentAreaCells.map((x) => x.value),
                ["Front Camera", "Rear Camera"],
                "asc"
              );
            },
          },
        },
      ],
    },
  ],
};
