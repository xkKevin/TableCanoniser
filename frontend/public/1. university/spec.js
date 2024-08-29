const option: TableTidierTemplate[] = [
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
      byPositionToTargetCols: [
        "Rank",
        "Name",
        "Location",
        "Total Score",
        null,
        null,
        null,
        null,
        null,
        "Level",
        "Resources",
        "Education",
        null,
        null,
        null,
        null,
        null,
        "Research",
        "Elite",
        "Global",
      ],
    },
  },
];
