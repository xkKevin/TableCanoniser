// The Declarative Grammar v0.3.2

type CellValueType = string | number | undefined;

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
    /**
     * The template reference that matches this area
     */
    templateRef: number[];
    /**
     * The instance index of this area that matches the templateRef within the parent area
     */
    instanceIndex: number;
    /**
     * The x-axis index of this area within the parent area
     */
    xIndex: number;
    /**
     * The y-axis index of this area within the parent area
     */
    yIndex: number;
}

/**
 * Represents a single cell within an area
 * - `xOffset`: The x-axis offset of the cell within the area
 * - `yOffset`: The y-axis offset of the cell within the area
 * - `value`: The value of the cell
 */
interface AreaCell {
    /**
     * The x-axis offset of the cell within the area
     */
    xOffset: number;
    /**
     * The y-axis offset of the cell within the area
     */
    yOffset: number;
    /**
     * The value of the cell
     */
    value: CellValueType;
}

/**
 * Represents the position of a cell
 */
interface CellPosi {
    /**
     * The x-coordinate of the cell
     */
    x: number;
    /**
     * The y-coordinate of the cell
     */
    y: number;
}

/**
 * Represents information about a cell
 */
interface CellInfo extends CellPosi {
    /**
     * The value of the cell
     */
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
type mapColsFn = (currentAreaTbl: Table2D) => (CellValueType | null)[];

/**
 * A function type that maps a context value to a target column.
 * @param ctxCells - The info (position and value) of the context cells.
 * @returns The name of the target column or null.
 */
type mapColbyContextFn = (ctxCells: CellInfo[]) => CellValueType | null;

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
    /**
     * The parent area of this area
     */
    parent: AreaInfo | null;
    /**
     * The layer level of this area within the root area
     */
    areaLayer: number;
    /**
     * The x-axis offset of this area within the parent area
     */
    xOffset: number;
    /**
     * The y-axis offset of this area within the parent area
     */
    yOffset: number;
    /**
     * The x-coordinate of this area within the entire table
     */
    x: number;
    /**
     * The y-coordinate of this area within the entire table
     */
    y: number;
    /**
     * The width of this area
     */
    width: number;
    /**
     * The height of this area
     */
    height: number;
    /**
     * All cells within this area
     */
    areaTbl: Table2D;
    /**
     * The child areas of this area
     */
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
    /**
     * The reference area layer for selection, default is 'current'
     */
    referenceAreaLayer?: 'current' | 'parent' | 'root' | areaLayerFn;
    /**
     * The reference area position for selection, default is 'topLeft'
     */
    referenceAreaPosi?: 'topLeft' | 'bottomLeft' | 'topRight' | 'bottomRight';
    /**
     * The x-axis offset relative to the reference area, default is 0
     */
    xOffset?: number | offsetFn;
    /**
     * The y-axis offset relative to the reference area, default is 0
     */
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
    /**
     * The value constraint.
     * - `CellValueType`: Specifies that the cell's value must be equal to the provided value.
     * - `ValueType`: Specifies that the cell's value must be of the specified type (`String` or `Number`).
     * - `checkValueFn`: Specifies a custom function to check if the cell's value meets certain conditions.
     */
    valueCstr: CellValueType | ValueType | checkValueFn;
}

/**
 * ContextTransform specifies how to derive the target column for a cell based on its context cell.
 * 
 * - `position`: Defines the location of the context cell relative to the current cell.
 *   - 'above': The context cell is located directly above the current cell.
 *   - 'below': The context cell is located directly below the current cell.
 *   - 'left': The context cell is located directly to the left of the current cell.
 *   - 'right': The context cell is located directly to the right of the current cell.
 *   - `contextPosiFn`: A custom function to determine the position of the context cell.
 * 
 * - `targetCol`: Determines how to derive the target column based on the context cell's value.
 *   - 'cellValue': Uses the context cell's value as the target column. If the context cell's value is null or empty, the target column will be null, and this cell will not be transformed to the output table.
 *   - `mapColbyContextFn`: A custom function to map the context cell's value to a specific target column. If the function returns null, the cell will not be transformed to the output table.
 */
interface ContextTransform {
    /**
     * Defines the location of the context cell relative to the current cell.
     * - 'above': The context cell is located directly above the current cell.
     * - 'below': The context cell is located directly below the current cell.
     * - 'left': The context cell is located directly to the left of the current cell.
     * - 'right': The context cell is located directly to the right of the current cell.
     * - `contextPosiFn`: A custom function to determine the position of the context cell.
     */
    position: 'above' | 'below' | 'left' | 'right' | contextPosiFn;
    /**
     * Determines how to derive the target column based on the context cell's value.
     * - 'cellValue': Uses the context cell's value as the target column. If the context cell's value is null or empty, the target column will be null, and this cell will not be transformed to the output table.
     * - `mapColbyContextFn`: A custom function to map the context cell's value to a specific target column. If the function returns null, the cell will not be transformed to the output table.
     */
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
    /**
     * The starting cell for the selection
     */
    startCell?: CellSelection;
    /**
     * The size of the selection area
     */
    size?: {
        /**
         * The width of the selection area, 'toParentX' means the distance from the startCell to the parent's x-axis end; null means no width constraint, default is 1
         */
        width?: number | 'toParentX' | null;
        /**
         * The height of the selection area, 'toParentY' means the distance from the startCell to the parent's y-axis end; null means no height constraint, default is 1
         */
        height?: number | 'toParentY' | null;
    };
    /**
     * Constraints to apply to the cells within the selection area
     */
    constraints?: CellConstraint[];
    /**
     * The traversal direction for the selection area
     */
    traverse?: {
        /**
         * The x-axis traversal direction: 'after' means traversing after the startCell; 'before' means traversing before the startCell; 'whole' means traversing the entire area; default is null, meaning no traversal
         */
        xDirection?: null | 'after' | 'before' | 'whole';
        /**
         * The y-axis traversal direction: 'after' means traversing after the startCell; 'before' means traversing before the startCell; 'whole' means traversing the entire area; default is null, meaning no traversal
         */
        yDirection?: null | 'after' | 'before' | 'whole';
    };
    /**
     * The transformation rules for the selection area
     */
    transform?: {
        /**
         * The context-based transformation for the selection area
         */
        context?: ContextTransform | null;
        /**
         * The target columns for the transformation, which can be an array (position-based transformation), 'context' (context-based transformation), or a custom function (value-based transformation)
         */
        targetCols: (CellValueType | null)[] | 'context' | mapColsFn;
    } | null;
    /**
     * Fill value for the cells within the selection area to ensure all columns have the same number of cells
     */
    fill?: CellValueType | 'forward' | null;
    /**
     * The child templates for nested selections
     */
    children?: TableTidierTemplate[];
}

function sortWithCorrespondingArray(A: any[], B: string[], sortOrder: 'asc' | 'desc'): string[] {
    // 创建一个数组包含元素及其对应的索引
    let indexedArray = A.map((value, index) => ({ value, index }));

    // 按照A数组的值进行排序
    indexedArray.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.value - b.value;
        } else {
            return b.value - a.value;
        }
    });

    // 根据排序后的索引重新排列B数组
    let sortedB = indexedArray.map(item => B[item.index]);

    return sortedB;
}