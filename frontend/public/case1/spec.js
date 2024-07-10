let template_case1 = [
  [
    {
      position: {
        x: StartPoint.x,
        y: Range(StartPoint.y, StartPoint.y + 3, 1),
      },
      target: {
        column: (i) => {
          let cols = ["Rank", "Name", "Location", "Total Score"];
          return cols[i];
        },
      },
    },
    {
      position: {
        x: Range(StartPoint.x + 2, StartPoint.x + 4, 2),
        y: Range(StartPoint.y + 1, StartPoint.y + 3, 1),
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => value != "",
        },
      ],
      target: {
        column: (i) => this.context[0].value,
      },
    },
  ],
];
