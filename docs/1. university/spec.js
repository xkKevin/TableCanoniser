const option: TableTidierTemplate[] = [
  {
    match: {
      startCell: {
        xOffset: 0,
        yOffset: 1,
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
      byPositionToTargetCols: ["Rank", "Name", "Location", "Total Score", null, null, null, null, null, "Level", "Resources", "Education", null, null, null, null, null, "Research", "Elite", "Global"],
    },
  },
];
