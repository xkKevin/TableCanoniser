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
          byPositionToTargetCols: ["Level", "Resources", "Education"],
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
          byPositionToTargetCols: ["Research", "Elite", "Global"],
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
        width: 4,
        height: 5,
      },
      traverse: {
        yDirection: "after",
      },
    },
    extract: {
      byPositionToTargetCols: ["Rank", "Name", "Location", "Total Score", null, null, null, null, null, "Level", "Resources", "Education", null, null, null, null, null, "Research", "Elite", "Global"]
    },
  },
];
