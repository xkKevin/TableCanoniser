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


// The Declarative Grammar v0.3

type cellValueType = string | number;

export enum ValueType {
    String,
    Number,
    None
}

// Function types

/**
 * A function type that calculates an offset based on the current area information and the root area information.
 * @param currentAreaInfo - The current area information.
 * @param rootAreaInfo - The root area information.
 * @returns The calculated offset.
 */
type offsetFn = (currentAreaInfo: AreaInfo, rootAreaInfo: AreaInfo) => number;

/**
 * A function type that checks if a cell value meets a custom condition.
 * @param value - The value of the cell.
 * @returns A boolean indicating whether the cell value meets the condition.
 */
type checkValueFn = (value: cellValueType) => boolean;

/**
 * A function type that maps the cells in an area to their corresponding target columns.
 * @param currentAreaCells - The cells in the current area.
 * @returns An array of target column names or null values.
 */
type mapColsFn = (currentAreaCells: AreaCell[]) => (string | null)[];

/**
 * A function type that maps a context value to a target column.
 * @param contextValue - The value of the context cell.
 * @returns The name of the target column or null.
 */
type mapColbyContextFn = (contextValue: cellValueType) => string | null;

/**
 * A function type that selects a range of cells based on the current area information and the root area information.
 * @param currentAreaInfo - The current area information.
 * @param rootAreaInfo - The root area information.
 * @returns An array of cell selections.
 */
type contextPosiFn = (currentAreaInfo: AreaInfo, rootAreaInfo: AreaInfo) => CellSelection[];

/**
 * A function type that determines the layer of an area based on its current area information.
 * @param currentAreaInfo - The current area information.
 * @returns The layer number of the area.
 */
type areaLayerFn = (currentAreaInfo: AreaInfo) => number;

// Represents a single cell within an area
interface AreaCell {
    xOffset: number;   // The x-axis offset of the cell within the area
    yOffset: number;   // The y-axis offset of the cell within the area
    value: cellValueType;  // The value of the cell
}

// Represents a selected area within the table
interface AreaInfo {
    parent: AreaInfo | null;  // The parent area of this area
    areaLayer: number;        // The layer level of this area within the root area
    templateIndex: number;    // The template index of this area within the parent area
    xIndex: number;           // The x-axis index of this area within the parent area
    yIndex: number;           // The y-axis index of this area within the parent area
    xOffset: number;          // The x-axis offset of this area within the parent area
    yOffset: number;          // The y-axis offset of this area within the parent area
    x: number;                // The x-coordinate of this area within the entire table
    y: number;                // The y-coordinate of this area within the entire table
    width: number;            // The width of this area
    height: number;           // The height of this area
    areaCells: AreaCell[];    // All cells within this area
    children: AreaInfo[];     // The child areas of this area
}

// Represents the selection of a cell within the table
interface CellSelection {
    referenceAreaLayer?: 'current' | 'parent' | 'root' | areaLayerFn;  // The reference area layer for selection, default is 'current'
    referenceAreaPosi?: 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight';  // The reference area position for selection, default is 'topLeft'
    xOffset?: number | offsetFn;  // The x-axis offset relative to the reference area, default is 0
    yOffset?: number | offsetFn;  // The y-axis offset relative to the reference area, default is 0
}

/**
* Represents a constraint on a cell's value
* - `valueCstr`: The value constraint.
*   - `cellValueType`: Specifies that the cell's value must be equal to the provided value.
*   - `ValueType`: Specifies that the cell's value must be of the specified type (`String` or `Number`).
*   - `checkValueFn`: Specifies a custom function to check if the cell's value meets certain conditions.
*/
interface CellConstraint extends CellSelection {
    // The value constraint can be a specific value, a type (string or number), or a custom check function
    valueCstr: cellValueType | ValueType | checkValueFn;
}

/**
 * ContextTransform specifies how to derive the target column for a cell based on its context cell.
 * 
 * - `position`: Defines the location of the context cell relative to the current cell.
 *   - 'top': The context cell is located directly above the current cell.
 *   - 'bottom': The context cell is located directly below the current cell.
 *   - 'left': The context cell is located directly to the left of the current cell.
 *   - 'right': The context cell is located directly to the right of the current cell.
 *   - `contextPosiFn`: A custom function to determine the position of the context cell.
 * 
 * - `targetCol`: Determines how to derive the target column based on the context cell's value.
 *   - 'cellValue': Uses the context cell's value as the target column. If the context cell's value is null or empty, the target column will be null, and this cell will not be transformed to the output table.
 *   - `mapColbyContextFn`: A custom function to map the context cell's value to a specific target column. If the function returns null, the cell will not be transformed to the output table.
 */
interface ContextTransform {
    position: 'top' | 'bottom' | 'left' | 'right' | contextPosiFn;
    targetCol: 'cellValue' | mapColbyContextFn;
}


// The main template for defining the transformation rules
export interface TableTidierTemplate {
    startCell: CellSelection;  // The starting cell for the selection
    size?: {
        width?: number | 'toParentX' | undefined;  // The width of the selection area, 'toParentX' means the distance from the startCell to the parent's x-axis end; undefined means no width constraint, default is 1
        height?: number | 'toParentY' | undefined; // The height of the selection area, 'toParentY' means the distance from the startCell to the parent's y-axis end; undefined means no height constraint, default is 1
    };
    constraints?: CellConstraint[];  // Constraints to apply to the cells within the selection area
    traverse?: {
        // The traversal direction for the selection area: 'after' means traversing after the startCell; 'before' means traversing before the startCell; 'whole' means traversing the entire area; default is 'none', meaning no traversal
        xDirection?: 'none' | 'after' | 'before' | 'whole';  // The x-axis traversal direction 
        yDirection?: 'none' | 'after' | 'before' | 'whole';  // The y-axis traversal direction
    };
    transform?: {
        context?: ContextTransform;  // The context-based transformation for the selection area
        // The target columns for the transformation, which can be an array (position-based transformation), 'context' (context-based transformation), or a custom function (value-based transformation)
        targetCols: (string | null)[] | 'context' | mapColsFn;
    };
    children?: TableTidierTemplate[];  // The child templates for nested selections
}



type Pair = { value: number, originalIndex: number, correspondingValue: string };

export function sortWithCorrespondingArray(A: any[], B: string[], sortOrder: 'asc' | 'desc'): string[] {
    // Create a combined array of objects
    let combined: Pair[] = A.map((value, index) => ({
        value: value,
        originalIndex: index,
        correspondingValue: B[index]
    }));

    // Sort the combined array based on the value in the specified order
    combined.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.value - b.value;
        } else {
            return b.value - a.value;
        }
    });

    // Extract the sorted corresponding values based on the original indices
    let sortedB: string[] = new Array(B.length);
    combined.forEach((pair, index) => {
        sortedB[pair.originalIndex] = pair.correspondingValue;
    });

    return sortedB;
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