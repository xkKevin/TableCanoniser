import { TableTidierTemplate, ValueType, sortWithCorrespondingArray } from "./types";

const case1: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 0
    },
    size: {
        width: 4,
        height: 5
    },
    constraints: [{
        xOffset: 0,
        yOffset: 0,
        valueCstr: ValueType.Number
    }],
    traverse: {
        yDirection: 'after'
    },
    children: [
        {
            startCell: {
                xOffset: 0,
                yOffset: 0
            },
            size: {
                width: 4,
                height: 1
            },
            transform: {
                targetCols: ["Rank", "Name", "Location", "Total Score"]
            }
        }, {
            startCell: {
                xOffset: 2,
                yOffset: 1
            },
            constraints: [{
                xOffset: 0,
                yOffset: 0,
                valueCstr: ValueType.Number
            }, {
                xOffset: 0,
                yOffset: -1,
                valueCstr: ValueType.String
            }],
            traverse: {
                xDirection: 'after',
                yDirection: 'after'
            },
            transform: {
                context: {
                    position: 'top',
                    targetCol: 'cellValue'
                },
                targetCols: 'context'
            }
        }
    ]
}


const case2_1: TableTidierTemplate = {
    startCell: {
        xOffset: 1,
        yOffset: 0
    },
    size: {
        width: 2,
        height: 1
    },
    traverse: {
        xDirection: 'after',
        yDirection: 'after'
    },
    transform: {
        targetCols: ["Method", "Accuracy"]
    },
    children: [{
        startCell: {
            referenceAreaLayer: 'root',
            xOffset: (currentAreaInfo) => currentAreaInfo.xIndex * 2,
            yOffset: 0
        },
        transform: {
            targetCols: ["Category"]
        }
    }]
}

const case2_2: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 0
    },
    size: {
        width: 2,
        height: undefined
    },
    constraints: [{
        xOffset: 1,
        yOffset: 0,
        valueCstr: ValueType.None
    }, {
        referenceAreaPosi: 'bottomRight',
        xOffset: 0,
        yOffset: 1,
        valueCstr: ValueType.None
    }],
    traverse: {
        xDirection: 'after',
        yDirection: 'after'
    },
    children: [{
        startCell: {
            xOffset: 0,
            yOffset: 0
        },
        transform: {
            targetCols: ["Category"]
        }
    }, {
        startCell: {
            xOffset: 0,
            yOffset: 1
        },
        size: {
            width: 2,
            height: 1
        },
        traverse: {
            yDirection: 'after',
        },
        transform: {
            targetCols: ["Method", "Accuracy"]
        }
    }]
}

const case3: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 0
    },
    size: {
        width: 7,
        height: undefined // 6
    },
    constraints: [{
        xOffset: 0,
        yOffset: 1,
        valueCstr: (value) => {
            if (typeof value === 'string') return value.startsWith("$")
            return false
        }
    }, {
        referenceAreaPosi: 'bottomLeft',
        xOffset: 0,
        yOffset: 1,
        valueCstr: ValueType.None
    }],
    traverse: {
        yDirection: 'after'
    },
    children: [{
        startCell: {
            xOffset: 0,
            yOffset: 0
        },
        size: {
            width: 2,
            height: 1
        },
        transform: {
            targetCols: ["Phone", "Price"]
        }
    }, {
        startCell: {
            xOffset: 1,
            yOffset: 1
        },
        constraints: [{
            xOffset: -1,
            yOffset: 0,
            valueCstr: ValueType.String
        }, {
            xOffset: 1,
            yOffset: 0,
            valueCstr: ValueType.None
        }],
        traverse: {
            yDirection: 'after'
        },
        transform: {
            context: {
                position: 'left',
                targetCol: (contextValue) => {
                    if (contextValue === "Announced Date") return "Release Date"
                    return contextValue as string
                }
            },
            targetCols: 'context'
        }
    }, {
        startCell: {
            xOffset: 1,
            yOffset: 2
        },
        size: {
            width: 6,
            height: 1
        },
        constraints: [{
            xOffset: -1,
            yOffset: 0,
            valueCstr: 'Dimensions'
        }],
        traverse: {
            yDirection: 'whole'
        },
        children: [{
            startCell: {
                xOffset: 1,
                yOffset: 0
            },
            constraints: [{
                xOffset: 0,
                yOffset: 0,
                valueCstr: (value) => {
                    if (typeof value === 'string') return value.endsWith("mm")
                    return false
                }
            }],
            traverse: {
                xDirection: 'after'
            },
            transform: {
                context: {
                    position: 'left',
                    targetCol: (contextValue) => {
                        if (typeof contextValue != 'string') return null
                        if (["Height", "H"].includes(contextValue)) return "Height"
                        if (["Width", "W"].includes(contextValue)) return "Width"
                        if (["Depth", "D"].includes(contextValue)) return "Depth"
                        return null
                    }
                },
                targetCols: 'context'
            }
        }, {
            startCell: {
                xOffset: 1,
                yOffset: 4
            },
            size: {
                width: 2,
                height: 1
            },
            constraints: [{
                xOffset: -1,
                yOffset: 0,
                valueCstr: 'Camera'
            }],
            traverse: {
                yDirection: 'whole'
            },
            transform: {
                targetCols: (currentAreaCells) => {
                    return sortWithCorrespondingArray(currentAreaCells.map(x => x.value), ["Front Camera", "Rear Camera"], 'asc')
                }
            }
        }]
    }]
}


const case4_1: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 7
    },
    size: {
        width: 'toParentX', // 12,
        height: 2
    },
    traverse: {
        yDirection: 'after'
    },
    transform: {
        targetCols: [
            "Index",
            "Sub Account Name",
            null,
            "Yesterday Available Credit",
            "Yesterday Reserved Credit",
            "Yesterday Frozen Credit",
            null,
            "Total Debit Transactions",
            "Total Debit Amount",
            null,
            null,
            "Today Net Deposit Amount",
            null,
            "Sub Account No.",
            null,
            "Today Available Credit",
            "Today Reserved Credit",
            "Today Frozen Credit",
            null,
            "Total Credit Transactions",
            "Total Credit Amount",
            null,
            null,
            null
        ]
    }
}


const case4_2: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 7
    },
    size: {
        width: 'toParentX', // 12,
        height: 2
    },
    traverse: {
        yDirection: 'after'
    },
    transform: {
        context: {
            position: (currentAreaInfo) => {
                return currentAreaInfo.areaCells.map(ci => {
                    return {
                        xOffset: ci.xOffset,
                        yOffset: ci.yOffset - (currentAreaInfo.yIndex + 1) * currentAreaInfo.height
                    }
                })
            },
            targetCol: 'cellValue'
        },
        targetCols: 'context'
    }
}


const case5: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 0
    },
    size: {
        width: 'toParentX', // 12,
        height: undefined
    },
    constraints: [{
        xOffset: 5,
        yOffset: 0,
        valueCstr: 'Employee Previous Earnings'
    }, {
        referenceAreaPosi: 'bottomLeft',
        xOffset: 0,
        yOffset: 0,
        valueCstr: (value) => {
            if (typeof value === 'string') return value.startsWith("ACME Payroll")
            return false
        }
    }],
    traverse: {
        yDirection: 'after'
    },
    children: [{
        startCell: {
            xOffset: 0,
            yOffset: 4
        },
        size: {
            width: 2
        },
        transform: {
            targetCols: ["EmployeeID", "Employee Name"]
        }
    }, {
        startCell: {
            xOffset: 0,
            yOffset: 8
        },
        size: {
            width: 'toParentX'
        },
        transform: {
            context: {
                position: (currentAreaInfo) => {
                    return currentAreaInfo.areaCells.map(ci => {
                        let xOffset = ci.xOffset, yOffset = 7
                        if (ci.xOffset == 5) yOffset = 6
                        return {
                            xOffset,
                            yOffset,
                            referenceAreaLayer: 'parent'
                        }
                    })
                },
                targetCol: 'cellValue'
            },
            targetCols: 'context'
        }
    }]
}

const example: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 1
    },
    size: {
        width: 'toParentX',
        height: 2
    },
    constraints: [{
        xOffset: 0,
        yOffset: 0,
        valueCstr: ValueType.Number
    }],
    traverse: {
        yDirection: 'after'
    },
    children: [{
        startCell: {
            xOffset: 0,
            yOffset: 0
        },
        size: {
            width: 'toParentX',
        },
        transform: {
            targetCols: ["Rank", "Name", "Age"]
        }
    }, {
        startCell: {
            xOffset: 2,
            yOffset: 1
        },
        constraints: [{
            xOffset: -1,
            yOffset: 0,
            valueCstr: 'Score'
        }],
        transform: {
            targetCols: ["Score"]
        }
    }]
}