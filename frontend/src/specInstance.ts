import { TableTidierMapping, sortWithCorrespondingArray } from "./types";

const case1: TableTidierMapping = {

    startCell: {
        position: (pi) => {
            return {
                row: pi.row * 5 + 1,
                col: 0
            }
        },
        value: (value) => typeof (value) === "number"
    },
    endCell: {
        position: (pi) => {
            return {
                row: pi.row * 5 + 5,
                col: 3
            }
        }
    },
    subMapping: [
        {
            startCell: {
                position: (i, areaCells) => areaCells[0].position
            },
            endCell: {
                position: (i, areaCells) => {
                    return {
                        row: areaCells[0].position.row,
                        col: areaCells[0].position.col + 3 // areaCells.at(-1).position.col
                    }
                }
            },
            target: ["Rank", "Name", "Location", "Total Score"]
        }, {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: pi.row * 2 + areaCells[0].position.row + 1,
                        col: pi.col + areaCells[0].position.col + 1
                    }
                }
            },
            context: [{
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row - 1,
                        col: areaCells[0].position.col
                    }
                },
                value: (value) => value != ""
            }],
            target: (vi, areaCells, contextCells) => contextCells[vi][0].value
        }
    ]
}


const case2: TableTidierMapping = {
    startCell: {
        position: (pi) => {
            return {
                row: pi.row,
                col: pi.col
            }
        }
    },
    endCell: {
        position: (pi, areaCells) => {
            return {
                row: areaCells.slice(-1)[0].position.row, // null,
                col: pi.col + 1
            }
        }
    },
    subMapping: [
        {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row,
                        col: areaCells[0].position.col,
                    }
                }
            },
            target: "Category",
        },
        {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: pi.row + areaCells[0].position.row + 1,
                        col: areaCells[0].position.col
                    }
                }

            },
            endCell: {
                position: (pi, areaCells) => {
                    return {
                        row: pi.row + areaCells[0].position.row + 1,
                        col: areaCells[0].position.col + 1
                    }
                }
            },
            target: ["Method", "Accuracy"]
        }
    ]
}


const case3_1: TableTidierMapping = {
    startCell: {
        position: (pi) => {
            return {
                row: pi.row,
                col: 0
            }
        }
    },
    endCell: {
        position: (pi) => {
            return {
                row: pi.row + 5,
                col: 6
            }
        }
    },
    context: [{
        position: (pi, areaCells) => {
            return {
                row: areaCells.slice(-1)[0].position.row + 1,
                col: 0
            }
        },
        value: (value) => value === ""
    }],
    subMapping: [
        {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row,
                        col: areaCells[0].position.col
                    }
                }
            },
            endCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row,
                        col: areaCells[0].position.col + 1
                    }
                }
            },
            target: ["Phone", "Price"]
        }, {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: pi.row + areaCells[0].position.row + 1,
                        col: areaCells[0].position.col
                    }
                }
            },
            context: [{
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row - 1,
                        col: areaCells[0].position.col
                    }
                },
                value: (value) => value != ""
            }],
            target: (vi, areaCells, contextCells) => contextCells[vi][0].value
        }
    ]
}


const case3_2: TableTidierMapping = {
    startCell: {
        position: (pi) => {
            return {
                row: pi.row,
                col: 0
            }
        },
        value: (value) => value != ""
    },
    endCell: {
        position: (pi) => {
            return {
                row: null,
                col: 6
            }
        }
    },
    context: [
        {
            position: (pi, areaCells) => {
                return {
                    row: areaCells.slice(-1)[0].position.row + 1,
                    col: 0
                }
            },
            value: (value) => value === ""
        }, {
            position: (pi, areaCells) => areaCells[1].position,
            value: (value) => value.startsWith("$")
        }
    ],
    subMapping: [
        {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row,
                        col: areaCells[0].position.col
                    }
                }
            },
            endCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row,
                        col: areaCells[0].position.col + 1
                    }
                }
            },
            target: ["Phone", "Price"]
        }, {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: pi.row + areaCells[0].position.row + 1,
                        col: areaCells[0].position.col + 1
                    }
                }
            },
            context: [
                {
                    position: (pi, areaCells) => {
                        return {
                            row: areaCells[0].position.row,
                            col: areaCells[0].position.col - 1
                        }
                    },
                    value: (value) => value != ""
                },
                {
                    position: (pi, areaCells) => {
                        return {
                            row: areaCells[0].position.row,
                            col: areaCells[0].position.col + 1
                        }
                    },
                    value: (value) => value === ""
                }
            ],
            target: (vi, areaCells, contextCells) => {
                if (contextCells[vi][0].value.endsWith("Date")) return "Release Date"
                else return contextCells[vi][0].value
            }
        }, {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 2,
                        col: pi.col * 2 + areaCells[0].position.col + 2
                    }
                }
            },
            context: [
                {
                    position: (pi, areaCells) => {
                        return {
                            row: areaCells[0].position.row,
                            col: 0
                        }
                    },
                    value: (value) => value === "Dimensions"
                },
                {
                    position: (pi, areaCells) => {
                        return {
                            row: areaCells[0].position.row,
                            col: areaCells[0].position.col - 1
                        }
                    },
                    value: (value) => value != ""
                }
            ],
            target: (vi, areaCells, contextCells) => {
                if (contextCells[vi][1].value === "Height" || "H") return "Height"
                if (contextCells[vi][1].value === "Width" || "W") return "Width"
                if (contextCells[vi][1].value === "Depth" || "D") return "Depth"
                return contextCells[vi][1].value
            }
        }, {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 4,
                        col: areaCells[0].position.col + 1
                    }
                }
            },
            endCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 4,
                        col: areaCells[0].position.col + 2
                    }
                }
            },
            context: [
                {
                    position: (pi, areaCells) => {
                        return {
                            row: areaCells[0].position.row,
                            col: areaCells[0].position.col - 1
                        }
                    },
                    value: (value) => value === "Camera"
                }
            ],
            target: (vi, areaCells, contextCells) => {
                return sortWithCorrespondingArray(areaCells.map(x => x.value), ["Front Camera", "Rear Camera"], 'asc')
            }
        }
    ]
}


const case4: TableTidierMapping = {
    startCell: {
        position: (pi) => {
            return {
                row: pi.row * 2 + 7,
                col: 0
            }
        }
    },
    endCell: {
        position: (pi, areaCells) => {
            return {
                row: pi.row * 2 + 8,
                col: areaCells.slice(-1)[0].position.col
            }
        }
    },
    context: [
        {
            position: (pi) => {
                return {
                    row: pi.row + 5,
                    col: pi.col
                }
            },
            value: (value) => value != ""
        }
    ],
    target: (vi, areaCells, contextCells) => contextCells[vi][0].value
}



const case5: TableTidierMapping = {
    startCell: {
        position: (pi) => {
            return {
                row: pi.row,
                col: 0
            }
        }
    },
    endCell: {
        position: (pi, areaCells) => {
            return {
                row: null,
                col: areaCells.slice(-1)[0].position.col
            }
        }
    },
    context: [
        {
            position: (pi, areaCells) => areaCells[5].position,
            value: (value) => value === "Employee Previous Earnings"
        },
        {
            position: (pi, areaCells) => areaCells[5].position,
            value: (value) => value.startsWith("ACME Payroll")
        }
    ],
    subMapping: [
        {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 4,
                        col: areaCells[0].position.col
                    }
                }
            },
            endCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 4,
                        col: areaCells[0].position.col + 1
                    }
                }
            },
            target: ["EmployeeID", "Employee Name"]
        }, {
            startCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 8,
                        col: areaCells[0].position.col
                    }
                }
            },
            endCell: {
                position: (pi, areaCells) => {
                    return {
                        row: areaCells[0].position.row + 8,
                        col: areaCells.slice(-1)[0].position.col
                    }
                }
            },
            target: (vi, areaCells) => {
                return ["Period End Date", "Pay Frequency", "Location", "Number of", "Description", "Hours", "Amount"]
            }
        }
    ]
}