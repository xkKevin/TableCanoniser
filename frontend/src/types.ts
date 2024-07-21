export interface ChatMessage {
    role: string
    content: string
}

// The Declarative Grammar v0.2

/**
 * PositionFn: (pi: Position2D, areaCells: AreaCellInfo[])
 * For startCell and endCell:
 *   pi is the instance index that matches this template (pi.row means traverse in the row direction, pi.col means traverse in the col direction)
 *   areaCells contains all the selected cells of parent template area
 * For context:
 *   pi is the cell index position of this template area
 *   areaCells contains all the selected cells of this template area
 */
type PositionFn = (pi: Position2D, areaCells: AreaCellInfo[]) => Position

/**
 * Set rules for value, if return false, means the value does not meet the rule
 */
type CheckValueFn = (value: string) => boolean

/**
 * Derive the target variable based on the selected/context cells
 * vi: the cell index of this template area
 * areaCells: all selected cells of this template area
 * contextCells: the context cells corresponding to the selected cells of this template area (Note that there may be multiple context cells for each selected cell, so contextCells is a 2D array)
 */
type DeriveTargetFn = (vi: number, areaCells: AreaCellInfo[], contextCells: AreaCellInfo[][]) => string | string[]

interface Position {
    // If null, means no rule for row/col
    row?: number | null,
    col?: number | null
}

interface Position2D {
    row: number
    col: number
}

/**
 * For startCell and endCell:
 * if position is not null, means involving position-based selection
 * if value is not null, means involving value-based selection
 */
type CellInfo = {
    position: Position | PositionFn,
    value?: CheckValueFn | string // | number | null
}

type AreaCellInfo = {
    position: Position2D,
    value: string // string | number | null
}

export interface TableTidierMapping {
    startCell?: CellInfo,
    endCell?: CellInfo,
    // if context is not null, means involving value-based selection
    context?: CellInfo[],
    subMapping?: TableTidierMapping[],
    // if target is string or string[], means position-based mapping;
    // if target is function, means value-based or context-based mapping;
    target?: string | string[] | DeriveTargetFn
}



// interface aa {
//     a: string,
//     b: number
// }

// // type bb = aa & {c: 12 | 22}
// interface bb extends aa {
//     c: 12 | 22
// }


// let xy: bb = {
//     a: '12',
//     b: 1,
//     c: 22
// }