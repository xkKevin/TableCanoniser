// The Declarative Grammar v0.3.1

type CellValueType = string | number;

enum ValueType {
    String = 'TableTidier.String',
    Number = 'TableTidier.Number',
    None = 'TableTidier.None',
}

/**
 * Represents the matched index of a matched area
 * - `templateRef`: The template reference that matches this area
 * - `instanceIndex`: The instance index of this area that matches the templateRef within the parent area
 * - `xIndex`: The x-axis index of this area within the parent area
 * - `yIndex`: The y-axis index of this area within the parent area
 */
interface MatchedIndex {
    templateRef: number[];
    instanceIndex: number;
    xIndex: number;
    yIndex: number;
}

/**
 * Represents a single cell within an area
 * - `xOffset`: The x-axis offset of the cell within the area
 * - `yOffset`: The y-axis offset of the cell within the area
 * - `value`: The value of the cell
 */
interface AreaCell {
    xOffset: number;
    yOffset: number;
    value: CellValueType;
}

interface CellPosi {
    x: number;
    y: number;
}

interface CellInfo extends CellPosi {
    value: CellValueType;
}

type Table2D = CellValueType[][];

// Function types

/**
 * A function type that calculates an offset based on the current area information and the root area information.
 * @param currentArea - The current area information.
 * @param rootArea - The root area information.
 * @returns The calculated offset.
 */
type offsetFn = (currentArea: AreaInfo, rootArea: AreaInfo) => number;

/**
 * A function type that checks if a cell value meets a custom condition.
 * @param value - The value of the cell.
 * @returns A boolean indicating whether the cell value meets the condition.
 */
type checkValueFn = (value: CellValueType) => boolean;

/**
 * A function type that maps the cells in an area to their corresponding target columns.
 * @param currentAreaTbl - The current area table.
 * @returns An array of target column names or null values.
 */
type mapColsFn = (currentAreaTbl: Table2D) => (string | null)[];

/**
 * A function type that maps a context value to a target column.
 * @param ctxCells - The info (position and value) of the context cells.
 * @returns The name of the target column or null.
 */
type mapColbyContextFn = (ctxCells: CellInfo[]) => string | null;

/**
 * A function type that selects a range of cells based on the current area information and the root area information.
 * @param cell - The current cell relative to the current area.
 * @param currentArea - The current area information.
 * @param rootArea - The root area information.
 * @returns An array of cell selections.
 */
type contextPosiFn = (cell: AreaCell, currentArea: AreaInfo, rootArea: AreaInfo) => CellSelection[];

/**
 * A function type that determines the layer of an area based on its current area information.
 * @param currentArea - The current area information.
 * @returns The layer number of the area.
 */
type areaLayerFn = (currentArea: AreaInfo) => number;

/**
 * Represents the information of a selected area within the table
 * - `parent`: The parent area of this area
 * - `areaLayer`: The layer level of this area within the root area
 * - `templateRef`: The template reference that matches this area
 * - `instanceIndex`: The instance index of this area that matches the templateRef within the parent area
 * - `xIndex`: The x-axis index of this area within the parent area
 * - `yIndex`: The y-axis index of this area within the parent area
 * - `xOffset`: The x-axis offset of this area within the parent area
 * - `yOffset`: The y-axis offset of this area within the parent area
 * - `x`: The x-coordinate of this area within the entire table
 * - `y`: The y-coordinate of this area within the entire table
 * - `width`: The width of this area
 * - `height`: The height of this area
 * - `areaTbl`: All cells within this area
 * - `children`: The child areas of this area
 */
interface AreaInfo extends MatchedIndex {
    parent: AreaInfo | null;
    areaLayer: number;
    xOffset: number;
    yOffset: number;
    x: number;
    y: number;
    width: number;
    height: number;
    areaTbl: Table2D;
    children: AreaInfo[];
}

/**
 * Represents the selection of a cell within the table
 * - `referenceAreaLayer`: The reference area layer for selection, default is 'current'
 * - `referenceAreaPosi`: The reference area position for selection, default is 'topLeft'
 * - `xOffset`: The x-axis offset relative to the reference area, default is 0
 * - `yOffset`: The y-axis offset relative to the reference area, default is 0
 */
interface CellSelection {
    referenceAreaLayer?: 'current' | 'parent' | 'root' | areaLayerFn;
    referenceAreaPosi?: 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight';
    xOffset?: number | offsetFn;
    yOffset?: number | offsetFn;
}

/**
 * Represents a constraint on a cell's value
 * - `valueCstr`: The value constraint.
 *   - `CellValueType`: Specifies that the cell's value must be equal to the provided value.
 *   - `ValueType`: Specifies that the cell's value must be of the specified type (`String` or `Number`).
 *   - `checkValueFn`: Specifies a custom function to check if the cell's value meets certain conditions.
 */
interface CellConstraint extends CellSelection {
    valueCstr: CellValueType | ValueType | checkValueFn;
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

/**
 * The main template for defining the transformation rules
 * - `startCell`: The starting cell for the selection
 * - `size`: The size of the selection area
 *   - `width`: The width of the selection area, 'toParentX' means the distance from the startCell to the parent's x-axis end; null means no width constraint, default is 1
 *   - `height`: The height of the selection area, 'toParentY' means the distance from the startCell to the parent's y-axis end; null means no height constraint, default is 1
 * - `constraints`: Constraints to apply to the cells within the selection area
 * - `traverse`: The traversal direction for the selection area
 *   - `xDirection`: The x-axis traversal direction: 'after' means traversing after the startCell; 'before' means traversing before the startCell; 'whole' means traversing the entire area; default is null, meaning no traversal
 *   - `yDirection`: The y-axis traversal direction: 'after' means traversing after the startCell; 'before' means traversing before the startCell; 'whole' means traversing the entire area; default is null, meaning no traversal
 * - `transform`: The transformation rules for the selection area
 *   - `context`: The context-based transformation for the selection area
 *   - `targetCols`: The target columns for the transformation, which can be an array (position-based transformation), 'context' (context-based transformation), or a custom function (value-based transformation)
 * - `fill`: Fill value for the cells within the selection area to ensure all columns have the same number of cells
 * - `children`: The child templates for nested selections
 */
interface TableTidierTemplate {
    startCell: CellSelection;
    size?: {
        width?: number | 'toParentX' | null;
        height?: number | 'toParentY' | null;
    };
    constraints?: CellConstraint[];
    traverse?: {
        xDirection?: null | 'after' | 'before' | 'whole';
        yDirection?: null | 'after' | 'before' | 'whole';
    };
    transform?: {
        context?: ContextTransform | null;
        targetCols: (string | null)[] | 'context' | mapColsFn;
    } | null;
    fill?: CellValueType | 'forward' | null;
    children?: TableTidierTemplate[];
}


/********************************************************************************/

// Ensure all parameters are defined
type NonUndefined<T> = T extends undefined ? never : T;
type AllParams<T> = {
    [K in keyof T]-?: NonUndefined<T[K]> extends object ? AllParams<NonUndefined<T[K]>> : NonUndefined<T[K]>;
};

/*
interface Test {
    param1?: string;
    param2?: number;
    param3?: { "P1": boolean, "P2"?: number };
}
let aInfo: Test = {
    param1: 'value1',
    param2: 42,
    param3: {
        P1: true
    },
};
let aa = aInfo as AllParams<Test>;
console.log(aa.param3.P2);
*/

// Construct a specification with default values

// default values
const DEFAULT_WIDTH = 1;
const DEFAULT_HEIGHT = 1;
const DEFAULT_REFERENCE_AREA_LAYER = 'current';
const DEFAULT_REFERENCE_AREA_POSI = 'topLeft';
const DEFAULT_X_OFFSET = 0;
const DEFAULT_Y_OFFSET = 0;
const DEFAULT_X_DIRECTION = null;
const DEFAULT_Y_DIRECTION = null;
const DEFAULT_CONTEXT_POSITION = 'top';
const DEFAULT_TARGET_COL = 'cellValue';
const DEFAULT_TARGET_COLS = [] as (string | null)[];
const DEFAULT_VALUE_CSTR = ValueType.String;
const DEFAULT_FILL = null;

function completeCellSelection(selection: CellSelection): CellSelection {
    return {
        referenceAreaLayer: selection.referenceAreaLayer || DEFAULT_REFERENCE_AREA_LAYER,
        referenceAreaPosi: selection.referenceAreaPosi || DEFAULT_REFERENCE_AREA_POSI,
        xOffset: selection.xOffset || DEFAULT_X_OFFSET,
        yOffset: selection.yOffset || DEFAULT_Y_OFFSET
    };
}

function completeCellConstraint(constraint: CellConstraint): CellConstraint {
    const completedSelection = completeCellSelection(constraint);
    return {
        ...completedSelection,
        valueCstr: constraint.valueCstr || DEFAULT_VALUE_CSTR
    };
}

function completeContextTransform(transform: ContextTransform): ContextTransform {
    return {
        position: transform.position || DEFAULT_CONTEXT_POSITION,
        targetCol: transform.targetCol || DEFAULT_TARGET_COL
    };
}

function completeTemplate(template: TableTidierTemplate): TableTidierTemplate {
    return {
        startCell: completeCellSelection(template.startCell),
        size: {
            width: template.size?.width === undefined ? DEFAULT_WIDTH : template.size.width,
            height: template.size?.height === undefined ? DEFAULT_HEIGHT : template.size.height
        },
        constraints: template.constraints?.map(completeCellConstraint) || [],
        traverse: {
            xDirection: template.traverse?.xDirection === undefined ? DEFAULT_X_DIRECTION : template.traverse.xDirection,
            yDirection: template.traverse?.yDirection === undefined ? DEFAULT_Y_DIRECTION : template.traverse.yDirection
        },
        transform: template.transform
            ? {
                context: template.transform.context ? completeContextTransform(template.transform.context) : null,
                targetCols: template.transform.targetCols || DEFAULT_TARGET_COLS
            }
            : null,
        fill: template.fill === undefined ? DEFAULT_FILL : template.fill,
        children: template.children?.map(completeTemplate) || []
    };
}

// Complete the specification with default values
function completeSpecification(specification: TableTidierTemplate): AllParams<TableTidierTemplate> {
    return completeTemplate(specification) as AllParams<TableTidierTemplate>;
}


export {
    Table2D, TableTidierTemplate, CellValueType, CellConstraint, CellPosi, ValueType, CellInfo, AllParams, AreaInfo, MatchedIndex, CellSelection, offsetFn, completeSpecification, completeCellSelection
}