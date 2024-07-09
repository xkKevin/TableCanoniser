let template_case1 = [
  [
    {
      position: {
        x: StartPoint.x,
        y: StartPoint.y,
      },
      target: {
        column: "Rank",
      },
    },
    {
      position: {
        x: StartPoint.x,
        y: StartPoint.y + 1,
      },
      target: {
        column: "Name",
      },
    },
    {
      position: {
        x: StartPoint.x,
        y: StartPoint.y + 2,
      },
      target: {
        column: "Location",
      },
    },
    {
      position: {
        x: StartPoint.x,
        y: StartPoint.y + 3,
      },
      target: {
        column: "Total Score",
      },
    },
    {
      position: {
        x: StartPoint.x + 2,
        y: StartPoint.y + 1,
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => {
            if (value in ["Level", "Resource", "Education"]) {
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      target: {
        column: () => this.context[0].value,
      },
    },
    {
      position: {
        x: StartPoint.x + 2,
        y: StartPoint.y + 2,
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => {
            if (value in ["Level", "Resource", "Education"]) {
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      target: {
        column: () => this.context[0].value,
      },
    },
    {
      position: {
        x: StartPoint.x + 2,
        y: StartPoint.y + 3,
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => {
            if (value in ["Level", "Resource", "Education"]) {
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      target: {
        column: () => this.context[0].value,
      },
    },
    {
      position: {
        x: StartPoint.x + 4,
        y: StartPoint.y + 1,
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => {
            if (value in ["Research", "Elite", "Global"]) {
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      target: {
        column: () => this.context[0].value,
      },
    },
    {
      position: {
        x: StartPoint.x + 4,
        y: StartPoint.y + 2,
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => {
            if (value in ["Research", "Elite", "Global"]) {
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      target: {
        column: () => this.context[0].value,
      },
    },
    {
      position: {
        x: StartPoint.x + 4,
        y: StartPoint.y + 3,
      },
      context: [
        {
          position: {
            x: () => this.position.x - 1,
            y: () => this.position.y,
          },
          value: (value) => {
            if (value in ["Research", "Elite", "Global"]) {
              return true;
            } else {
              return false;
            }
          },
        },
      ],
      target: {
        column: () => this.context[0].value,
      },
    },
  ],
];
