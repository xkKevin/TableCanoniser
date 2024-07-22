// The Declarative Grammar v0.3

type cellValueType = string | number;

export enum ValueType {
    String = 'TableTidier.String',
    Number = 'TableTidier.Number',
    None = 'TableTidier.None',
}

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
type checkValueFn = (value: cellValueType) => boolean;

/**
 * A function type that maps the cells in an area to their corresponding target columns.
 * @param currentAreaTbl - The current area table.
 * @returns An array of target column names or null values.
 */
type mapColsFn = (currentAreaTbl: Table2D) => (string | null)[];

/**
 * A function type that maps a context value to a target column.
 * @param contextValue - The value of the context cell.
 * @returns The name of the target column or null.
 */
type mapColbyContextFn = (contextValue: cellValueType) => string | null;

/**
 * A function type that selects a range of cells based on the current area information and the root area information.
 * @param currentArea - The current area information.
 * @param rootArea - The root area information.
 * @returns An array of cell selections.
 */
type contextPosiFn = (currentArea: AreaInfo, rootArea: AreaInfo) => CellSelection[];

/**
 * A function type that determines the layer of an area based on its current area information.
 * @param currentArea - The current area information.
 * @returns The layer number of the area.
 */
type areaLayerFn = (currentArea: AreaInfo) => number;

/**
 * Represents a single cell within an area
 * - `xOffset`: The x-axis offset of the cell within the area
 * - `yOffset`: The y-axis offset of the cell within the area
 * - `value`: The value of the cell
 */
interface AreaCell {
    xOffset: number;
    yOffset: number;
    value: cellValueType;
}

interface CellPosi {
    x: number;
    y: number;
}

type Table2D = cellValueType[][];

/**
 * Represents the information of a selected area within the table
 * - `parent`: The parent area of this area
 * - `areaLayer`: The layer level of this area within the root area
 * - `templateIndex`: The template index of this area within the parent area
 * - `xIndex`: The x-axis index of this area within the parent area
 * - `yIndex`: The y-axis index of this area within the parent area
 * - `xOffset`: The x-axis offset of this area within the parent area
 * - `yOffset`: The y-axis offset of this area within the parent area
 * - `x`: The x-coordinate of this area within the entire table
 * - `y`: The y-coordinate of this area within the entire table
 * - `width`: The width of this area
 * - `height`: The height of this area
 * - `areaCells`: All cells within this area
 * - `children`: The child areas of this area
 */
export interface AreaInfo {
    parent: AreaInfo | null;
    areaLayer: number;
    templateIndex: number;
    xIndex: number;
    yIndex: number;
    xOffset: number;
    yOffset: number;
    x: number;
    y: number;
    width: number;
    height: number;
    areaCells: Table2D;
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
 *   - `cellValueType`: Specifies that the cell's value must be equal to the provided value.
 *   - `ValueType`: Specifies that the cell's value must be of the specified type (`String` or `Number`).
 *   - `checkValueFn`: Specifies a custom function to check if the cell's value meets certain conditions.
 */
interface CellConstraint extends CellSelection {
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
 * - `children`: The child templates for nested selections
 */
export interface TableTidierTemplate {
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
    children?: TableTidierTemplate[];
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
            width: template.size?.width ?? DEFAULT_WIDTH,
            height: template.size?.height ?? DEFAULT_HEIGHT
        },
        constraints: template.constraints?.map(completeCellConstraint) || [],
        traverse: {
            xDirection: template.traverse?.xDirection || DEFAULT_X_DIRECTION,
            yDirection: template.traverse?.yDirection || DEFAULT_Y_DIRECTION
        },
        transform: template.transform
            ? {
                context: template.transform.context ? completeContextTransform(template.transform.context) : null,
                targetCols: template.transform.targetCols || DEFAULT_TARGET_COLS
            }
            : null,
        children: template.children?.map(completeTemplate) || []
    };
}

// Complete the specification with default values
function completeSpecification(specification: TableTidierTemplate): AllParams<TableTidierTemplate> {
    return completeTemplate(specification) as AllParams<TableTidierTemplate>;
}


/********************************************************************************/

type MatchedIndex = {
    templateIndex: number;
    xIndex: number;
    yIndex: number;
}

function transformTable(table: Table2D, spec: TableTidierTemplate) {

    const specWithDefaults = completeSpecification(spec);
    // console.log(JSON.stringify(specWithDefaults, null, 2));

    // Helper function to get a cell value safely
    const getCellValue = (table: Table2D, x: number, y: number): cellValueType => {
        return table[y] && table[y][x];
    };

    // Helper function to evaluate constraints
    const evaluateConstraint = (cellValue: cellValueType, constraint: CellConstraint): boolean => {
        if (typeof constraint.valueCstr === 'function') {
            return constraint.valueCstr(cellValue);
        }
        if (constraint.valueCstr === ValueType.String) {
            return typeof cellValue === 'string';
        }
        if (constraint.valueCstr === ValueType.Number) {
            return typeof cellValue === 'number';
        }
        if (constraint.valueCstr === ValueType.None) {
            return cellValue === null || cellValue === '';
        }
        return cellValue === constraint.valueCstr;
    };

    const calculateOffset = (offset: number | offsetFn, currentArea: AreaInfo, rootArea: AreaInfo): number => {
        return typeof offset === 'number' ? offset : offset(currentArea, rootArea);
    };

    const getCellBySelect = (select: AllParams<CellSelection>, currentArea: AreaInfo, rootArea: AreaInfo) => {
        let area: AreaInfo = currentArea;
        if (select.referenceAreaLayer === 'current') {
            area = currentArea;
        } else if (select.referenceAreaLayer === 'root') {
            area = rootArea;
        } else if (select.referenceAreaLayer === 'parent') {
            area = currentArea.parent!;
        } else {
            const layer = currentArea.areaLayer - select.referenceAreaLayer(currentArea);
            for (let li = 0; li < layer; li++) {
                area = area.parent!;
            }
        }

        let cellPosi: CellPosi = {
            x: area.x + calculateOffset(select.xOffset, currentArea, rootArea),
            y: area.y + calculateOffset(select.yOffset, currentArea, rootArea)
        };
        if (select.referenceAreaPosi === 'topLeft') {
        }
        if (select.referenceAreaPosi === 'bottomLeft') {
            cellPosi.y += area.height
        }
        if (select.referenceAreaPosi === 'topRight') {
            cellPosi.x += area.width
        }
        if (select.referenceAreaPosi === 'bottomRight') {
            cellPosi.x += area.width
            cellPosi.y += area.height
        }

        return {
            ...cellPosi,
            value: rootArea.areaCells[cellPosi.y][cellPosi.x],
        };

    };

    const calculateSize = (size: number | 'toParentX' | 'toParentY' | null, startX: number, startY: number, currentArea: AreaInfo): number => {
        if (typeof size === 'number') {
            return size;
        }
        if (size === 'toParentX') {
            return currentArea.width - startX;
        }
        if (size === 'toParentY') {
            return currentArea.height - startY;
        }
        // 如果为 null，返回 1
        return 1;
    };

    const getSubArea = (table: Table2D, x: number, y: number, width: number, height: number): Table2D => {
        const subArea: Table2D = [];
        for (let i = y; i < y + height; i++) {
            const row = table[i].slice(x, x + width);
            subArea.push(row);
        }
        return subArea;
    }

    const matchArea = (template: AllParams<TableTidierTemplate>, xOffset: number, yOffset: number, width: number, height: number, index: MatchedIndex, type: 0 | 1 | 2 | 3, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: cellValueType[] }): AreaInfo | null => {

        const tmpArea: AreaInfo = {
            parent: currentArea,
            areaLayer: currentArea.areaLayer + 1,
            templateIndex: index.templateIndex,
            xIndex: index.xIndex,
            yIndex: index.yIndex,
            xOffset,
            yOffset,
            x: currentArea.x + xOffset,
            y: currentArea.y + yOffset,
            width,
            height,
            areaCells: getSubArea(currentArea.areaCells, xOffset, yOffset, width, height),
            children: []
        }
        for (let cstr of template.constraints) {
            const { value } = getCellBySelect(cstr, tmpArea, rootArea);
            // console.log(value, tmpArea);
            if (!evaluateConstraint(value, cstr)) return null;
        }
        currentArea.children.push(tmpArea);
        if (type) {
            index.templateIndex++;
            if (type === 1) {
                index.xIndex++;
            } else if (type === 2) {
                index.yIndex++;
            } else {

            }
        }
        transformArea(template, tmpArea, rootArea, tidyData);
        return tmpArea;
    };


    const transformArea = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: cellValueType[] }) => {

        const cellArray = currentArea.areaCells.flat();
        if (template.transform) {
            if (template.transform.context) {

            } else {
                if (typeof template.transform.targetCols === 'object') {
                    template.transform.targetCols.forEach((targetCol: string | null, index: number) => {
                        // console.log(targetCol, cellArray[index], currentArea.areaCells, template);
                        if (targetCol) {
                            if (tidyData.hasOwnProperty(targetCol)) {
                                tidyData[targetCol].push(cellArray[index]);
                            } else {
                                tidyData[targetCol] = [cellArray[index]];
                            }
                        }
                    })
                }
            }
        }
    }


    // Recursive function to process a template
    const processTemplate = (template: AllParams<TableTidierTemplate>, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: cellValueType[] }) => {

        let startX = calculateOffset(template.startCell.xOffset, currentArea, rootArea);
        let startY = calculateOffset(template.startCell.yOffset, currentArea, rootArea);


        // Calculate size
        const width = calculateSize(template.size.width, startX, startY, currentArea);
        const height = calculateSize(template.size.height, startX, startY, currentArea);


        const xDirection = template.traverse.xDirection;
        const yDirection = template.traverse.yDirection;
        if (xDirection && yDirection) {
            // 从 startX, startY 开始遍历，直到 endX, endY，找到第一个符合所有约束的Area
        } else if (xDirection && !yDirection) {
            // 从 startX 开始遍历，直到 endX ，找到第一个符合所有约束的Area
            let endX = currentArea.width;
            if (xDirection === 'before') {
                endX = startX
                startX = 0;
            } else if (xDirection === 'whole') {
                startX = 0;
            }
            let currentStartX = startX;
            let currentEndX = startX + width - 1;
            while (currentEndX <= endX) {
                const areaWidth = currentEndX - currentStartX + 1;
                const tmpArea: AreaInfo | null = matchArea(template, currentStartX, startY, areaWidth, height, index, 1, currentArea, rootArea, tidyData);
                if (tmpArea) {
                    currentStartX += areaWidth
                    currentEndX += areaWidth
                }
            }
        } else if (!xDirection && yDirection) {
            // 从 startY 开始遍历，直到 endY, 找到第一个符合所有约束的Area
            let endY = currentArea.height;
            if (yDirection === 'before') {
                endY = startY
                startY = 0;
            } else if (yDirection === 'whole') {
                startY = 0;
            }
            let currentStartY = startY;
            let currentEndY = startY + height - 1;
            while (currentEndY <= endY) {
                const areaHeight = currentEndY - currentStartY + 1;
                const tmpArea: AreaInfo | null = matchArea(template, startX, currentStartY, width, areaHeight, index, 2, currentArea, rootArea, tidyData);
                if (tmpArea) {
                    currentStartY += areaHeight
                    currentEndY += areaHeight
                }
            }
        } else {
            // 不遍历
            const tmpArea: AreaInfo | null = matchArea(template, startX, startY, width, height, index, 0, currentArea, rootArea, tidyData);
        }

        for (let templateChild of template.children) {
            let index = { templateIndex: 0, xIndex: 0, yIndex: 0 };
            for (let areaChild of currentArea.children) {
                processTemplate(templateChild, index, areaChild, rootArea, tidyData);
            }
        }

    }

    // Create initial AreaInfo for the root
    const rootArea: AreaInfo = {
        parent: null,
        areaLayer: 0,
        templateIndex: 0,
        xIndex: 0,
        yIndex: 0,
        xOffset: 0,
        yOffset: 0,
        x: 0,
        y: 0,
        width: table[0].length,
        height: table.length,
        areaCells: table,
        children: []
    };

    let tidyData: { [key: string]: cellValueType[] } = {}

    processTemplate(specWithDefaults, { templateIndex: 0, xIndex: 0, yIndex: 0 }, rootArea, rootArea, tidyData);

    return { rootArea, tidyData };
}


// Example usage
const messyTable: Table2D = [
    ["Rank", "Name", "Age"],
    [1, "Bob", 16],
    ["", "Score", 92],
    [2, "Sam", 15],
    ["", "Score", 89],
    [3, "Alice", 16],
    ["", "Score", 87],
    [4, "John", 16],
    ["", "Score", 86],
];

const spec: TableTidierTemplate = {
    startCell: { xOffset: 0, yOffset: 1 },
    size: { width: 'toParentX', height: 2 },
    constraints: [{ xOffset: 0, yOffset: 0, valueCstr: ValueType.Number }],
    traverse: { yDirection: 'after' },
    children: [
        {
            startCell: { xOffset: 0, yOffset: 0 },
            size: { width: 'toParentX' },
            transform: { targetCols: ["Rank", "Name", "Age"] }
        },
        {
            startCell: { xOffset: 2, yOffset: 1 },
            constraints: [{ xOffset: -1, yOffset: 0, valueCstr: 'Score' }],
            transform: { targetCols: ["Score"] }
        }
    ]
};

const { rootArea, tidyData } = transformTable(messyTable, spec);
// console.log(serialize(rootArea));
console.log(tidyData);


function serialize(obj: any): string {
    const seen = new WeakSet();

    return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                // 如果之前见过这个对象，则返回一个标记字符串
                return `[Circular reference: ${key}]`;
            }
            seen.add(value);
        }
        return value;
    });
}

// @ts-ignore
import * as fs from 'fs';
fs.writeFileSync('rootArea.json', serialize(rootArea), 'utf-8');
