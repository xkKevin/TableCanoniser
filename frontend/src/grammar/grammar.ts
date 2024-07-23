// The Declarative Grammar v0.3

type CellValueType = string | number;

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
 * @param cell - The current cell in the current area.
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
 * - `areaTbl`: All cells within this area
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
    console.log(JSON.stringify(specWithDefaults, null, 2));

    // Helper function to get a cell value safely
    const getCellValue = (table: Table2D, x: number, y: number): CellValueType => {
        return table[y] && table[y][x];
    };

    // Helper function to evaluate constraints
    const evaluateConstraint = (cellValue: CellValueType, constraint: CellConstraint): boolean => {
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

    const getCellBySelect = (select: AllParams<CellSelection>, currentArea: AreaInfo, rootArea: AreaInfo): CellInfo | null => {
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
            cellPosi.y += area.height - 1
        }
        if (select.referenceAreaPosi === 'topRight') {
            cellPosi.x += area.width - 1
        }
        if (select.referenceAreaPosi === 'bottomRight') {
            cellPosi.x += area.width - 1
            cellPosi.y += area.height - 1
        }

        // 判断是否越界
        if (cellPosi.x < 0 || cellPosi.y < 0 || cellPosi.x >= rootArea.width || cellPosi.y >= rootArea.height) {
            console.log(`Invalid cell selection: Table size (${rootArea.width}, ${rootArea.height}), Position (${cellPosi.x}, ${cellPosi.y}) is out of bounds.`);
            return null
        }

        return {
            ...cellPosi,
            value: rootArea.areaTbl[cellPosi.y][cellPosi.x],
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

    const matchArea = (template: AllParams<TableTidierTemplate>, xOffset: number, yOffset: number, width: number, height: number, index: MatchedIndex, type: 0 | 1 | 2, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellValueType[] }): AreaInfo | null => {

        let x = currentArea.x + xOffset, y = currentArea.y + yOffset;

        if (template.startCell.referenceAreaLayer !== "current") {
            const cellInfo = getCellBySelect(template.startCell, currentArea, rootArea);
            if (cellInfo === null) {
                return null;
            };
            x = cellInfo.x;
            y = cellInfo.y;
        }

        const tmpArea: AreaInfo = {
            parent: currentArea,
            areaLayer: currentArea.areaLayer + 1,
            templateIndex: index.templateIndex,
            xIndex: index.xIndex,
            yIndex: index.yIndex,
            xOffset,
            yOffset,
            x,
            y,
            width,
            height,
            areaTbl: getSubArea(rootArea.areaTbl, x, y, width, height),
            children: []
        }
        for (let cstr of template.constraints) {
            const cellInfo = getCellBySelect(cstr, tmpArea, rootArea);
            if (cellInfo === null) {
                return null;
            }
            if (!evaluateConstraint(cellInfo.value, cstr)) return null;
        }
        currentArea.children.push(tmpArea);
        if (type) {
            index.templateIndex++;
            if (type === 1) {
                index.xIndex++;
            } else if (type === 2) {
                index.yIndex++;
            }
        }

        // if (template.startCell.referenceAreaLayer === 'root') {
        //     console.log(xOffset, yOffset, width, height);
        //     {
        //         let { parent, children, ...rest } = currentArea;
        //         console.log(rest);
        //     }
        //     console.log("-----------------");
        //     {
        //         let { parent, children, ...rest } = tmpArea;
        //         console.log(rest);
        //     }
        // }

        transformArea(template, tmpArea, rootArea, tidyData);
        return tmpArea;
    };


    const transformArea = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellValueType[] }) => {

        const cellArray = currentArea.areaTbl.flat();
        if (template.transform) {
            const context = template.transform.context;
            const ctxCols: (string | null)[] = []
            const ctxCellsInfo: CellInfo[][] = [];
            if (context) {
                const ctxSelections: CellSelection[][] = [];
                if (context.position === 'top') {
                    currentArea.areaTbl.forEach((row, ri) => {
                        row.forEach((cell, ci) => {
                            ctxSelections.push([completeCellSelection({
                                xOffset: ci,
                                yOffset: ri + 1,
                            })]);
                        })
                    })
                } else if (context.position === 'bottom') {
                    currentArea.areaTbl.forEach((row, ri) => {
                        row.forEach((cell, ci) => {
                            ctxSelections.push([completeCellSelection({
                                xOffset: ci,
                                yOffset: ri + 1,
                            })]);
                        })
                    })
                } else if (context.position === 'left') {
                    currentArea.areaTbl.forEach((row, ri) => {
                        row.forEach((cell, ci) => {
                            ctxSelections.push([completeCellSelection({
                                xOffset: ci - 1,
                                yOffset: ri,
                            })]);
                        })
                    })
                } else if (context.position === 'right') {
                    currentArea.areaTbl.forEach((row, ri) => {
                        row.forEach((cell, ci) => {
                            ctxSelections.push([completeCellSelection({
                                xOffset: ci + 1,
                                yOffset: ri,
                            })]);
                        })
                    })
                } else {
                    const ctxPosiFn = context.position
                    currentArea.areaTbl.forEach((row, ri) => {
                        row.forEach((cell, ci) => {
                            const customSelections = ctxPosiFn({
                                xOffset: ci,
                                yOffset: ri,
                                value: cell
                            }, currentArea, rootArea);
                            ctxSelections.push(customSelections);
                        })
                    })
                }

                if (ctxSelections.length > 0 && ctxSelections[0].length > 0) {
                    ctxSelections.forEach((cellCtxs) => {
                        const cellCtxsInfo: CellInfo[] = [];
                        cellCtxs.forEach((selection) => {
                            const cell = getCellBySelect(selection as AllParams<CellSelection>, currentArea, rootArea);
                            if (cell === null) {
                                return null;
                            }
                            cellCtxsInfo.push(cell);
                        })
                        ctxCellsInfo.push(cellCtxsInfo);
                    });
                } else {
                    console.log('No context cells found');
                }

                if (context.targetCol === 'cellValue') {
                    ctxCellsInfo.forEach((cellCtxsInfo) => {
                        ctxCols.push(cellCtxsInfo[0].value.toString());
                    })
                } else {
                    const customMapColbyCxt = context.targetCol
                    ctxCellsInfo.forEach((ctxCells) => {
                        ctxCols.push(customMapColbyCxt(ctxCells));
                    })
                }
            }

            let transformedCols: (string | null)[];
            if (typeof template.transform.targetCols === 'object') {
                transformedCols = template.transform.targetCols
            } else if (template.transform.targetCols === 'context') {
                transformedCols = ctxCols
            } else {
                transformedCols = template.transform.targetCols(currentArea.areaTbl);
            }
            transformedCols.forEach((targetCol, index) => {
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


    // Recursive function to process a template
    const processTemplate = (template: AllParams<TableTidierTemplate>, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellValueType[] }) => {

        let startX = calculateOffset(template.startCell.xOffset, currentArea, rootArea);
        let startY = calculateOffset(template.startCell.yOffset, currentArea, rootArea);


        // Calculate size
        const width = calculateSize(template.size.width, startX, startY, currentArea);
        const height = calculateSize(template.size.height, startX, startY, currentArea);


        const xDirection = template.traverse.xDirection;
        const yDirection = template.traverse.yDirection;
        if (xDirection && yDirection) {
            // 从 startX, startY 开始遍历，直到 endX, endY，找到第一个符合所有约束的Area
            let endX = currentArea.width - 1;
            let endY = currentArea.height - 1;
            if (xDirection === 'before') {
                endX = startX
                startX = 0;
            } else if (xDirection === 'whole') {
                startX = 0;
            }
            if (yDirection === 'before') {
                endY = startY
                startY = 0;
            } else if (yDirection === 'whole') {
                startY = 0;
            }
            let currentStartX = startX;
            let currentEndX = startX + width - 1;
            let currentStartY = startY;
            let currentEndY = startY + height - 1;
            // 先向x轴遍历，再向y轴遍历
            while (currentEndY <= endY) {
                const areaHeight = currentEndY - currentStartY + 1;
                while (currentEndX <= endX) {
                    const areaWidth = currentEndX - currentStartX + 1;
                    // console.log(currentStartX, currentEndX, currentStartY, currentEndY, areaWidth, areaHeight);
                    const tmpArea: AreaInfo | null = matchArea(template, currentStartX, currentStartY, areaWidth, areaHeight, index, 1, currentArea, rootArea, tidyData);
                    if (tmpArea) {
                        currentStartX += areaWidth
                        currentEndX += areaWidth
                    } else {
                        currentEndX += 1
                        if (template.size.width != null) currentStartX += 1
                    }
                }
                currentStartX = startX;
                currentEndX = startX + width - 1;
                index.xIndex = 0;
                index.yIndex += 1;
                if (currentArea.children.length > 0) {
                    currentStartY += areaHeight
                    currentEndY += areaHeight
                } else {
                    currentStartY += 1
                    if (template.size.height != null) currentStartY += 1
                }
            }
        } else if (xDirection && !yDirection) {
            // 从 startX 开始遍历，直到 endX ，找到第一个符合所有约束的Area
            let endX = currentArea.width - 1;
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
                    currentEndX = currentStartX + width - 1;
                } else {
                    if (template.size.width != null) {
                        // 宽度固定
                        currentStartX += 1
                        currentEndX += 1
                    } else {
                        if (currentEndX === endX) {
                            // 已经到了最后一行
                            currentStartX += 1
                            currentEndX = currentStartX
                        } else {
                            // 未到最后一行
                            currentEndX += 1
                        }
                    }
                }
            }
        } else if (!xDirection && yDirection) {
            // 从 startY 开始遍历，直到 endY, 找到第一个符合所有约束的Area
            let endY = currentArea.height - 1;
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
                // console.log("before match", currentStartY, currentEndY, width, areaHeight, tmpArea === null);
                if (tmpArea) {
                    currentStartY += areaHeight
                    currentEndY = currentStartY + height - 1;
                } else {
                    if (template.size.height != null) {
                        // 高度固定
                        currentStartY += 1
                        currentEndY += 1
                    } else {
                        // 高度可变
                        if (currentEndY === endY) {
                            // 已经到了最后一行
                            currentStartY += 1
                            currentEndY = currentStartY
                        } else {
                            // 未到最后一行
                            currentEndY += 1
                        }
                    }
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
        areaTbl: table,
        children: []
    };

    let tidyData: { [key: string]: CellValueType[] } = {}

    processTemplate(specWithDefaults, { templateIndex: 0, xIndex: 0, yIndex: 0 }, rootArea, rootArea, tidyData);

    return { rootArea, tidyData };
}



const case1_mt: Table2D = [
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

const case1_spec: TableTidierTemplate = {
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
const case2_mt: Table2D = [
    ["Unsupervised DA", "", "SOTA (image-based)", ""],
    ["baseline", "93.78", "DeepFace", "91.4"],
    ["PCA", "93.56", "FaceNet", "95.12"],
    ["CORAL", "94.5", "CenterFace", "94.9"],
    ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]
];

const case2_spec: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 1,
    },
    size: {
        width: 2,
        height: 1,
    },
    traverse: {
        xDirection: "after",
        yDirection: "after",
    },
    transform: {
        targetCols: ["Method", "Accuracy"],
    },
    children: [
        {
            startCell: {
                referenceAreaLayer: "root",
                xOffset: (currentArea) => currentArea.x, // currentArea.xIndex * 2,
                yOffset: 0,
            },
            transform: {
                targetCols: ["Category"],
            },
        },
    ],
};

const case3_mt: Table2D = [
    ["OnePlus 2", "$330", "", "", "", "", ""],
    ["Release Date", "Aug 2015", "", "", "", "", ""],
    [
        "Dimensions",
        "Height",
        "151.8 mm",
        "Width",
        "74.9 mm",
        "Depth",
        "9.85 mm"
    ],
    ["Weight", "175 g", "", "", "", "", ""],
    ["Camera", "5", "13", "", "", "", ""],
    ["Battery", "3300 mAh LiPO", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["test_phone", "$379", "", "", "", "", ""],
    ["Release Date", "Nov 2015", "", "", "", "", ""],
    ["Dimensions", "Height", "72.6 mm", "Width", "72.6 mm", "Depth", "7.9 mm"],
    ["Weight", "136 g", "", "", "", "", ""],
    ["Camera", "6", "6", "", "", "", ""],
    ["Battery", "2700 mAh LiPO", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["Motorola X PURE", "$400", "", "", "", "", ""],
    ["Release Date", "Sept 2015", "", "", "", "", ""],
    [
        "Dimensions",
        "Width",
        "76.2 mm",
        "Height",
        "153.9 mm",
        "Depth",
        "6.1 to 11.06 mm"
    ],
    ["Weight", "179 g", "", "", "", "", ""],
    ["Camera", "5", "21", "", "", "", ""],
    ["Battery", "3000 mAh", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["Samsung Galaxy S6", "$580", "", "", "", "", ""],
    ["Announced Date", "2015 Apr", "", "", "", "", ""],
    ["Dimensions", "H", "143.4 mm", "W", "70.5 mm", "D", "6.8 mm"],
    ["Weight", "138 g", "", "", "", "", ""],
    ["Camera", "16", "5", "", "", "", ""],
    ["Battery", "2550 mAh", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["Samsung Galaxy Note 5", "$720", "", "", "", "", ""],
    ["Announced Date", "2015 Aug", "", "", "", "", ""],
    ["Dimensions", "W", "76.1 mm", "H", "153.2 mm", "D", "7.6 mm"],
    ["Weight", "171 g", "", "", "", "", ""],
    ["Camera", "16", "5", "", "", "", ""],
    ["Battery", "3000 mAh LiPO", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["Apple iPhone 6s", "$650", "", "", "", "", ""],
    ["Release Date", "Sept 2015", "", "", "", "", ""],
    ["Dimensions", "Height", "138.3 mm", "Width", "67.1 mm", "Depth", "7.1 mm"],
    ["Weight", "143 g", "", "", "", "", ""],
    ["Camera", "5", "12", "", "", "", ""],
    ["Battery", "1715 mAh LiPO", "", "", "", "", ""],
    ["", "", "", "", "", "", ""]
];

const case3_spec: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 0,
    },
    size: {
        width: 7,
        height: null, // 6
    },
    constraints: [
        {
            xOffset: 1,
            yOffset: 0,
            valueCstr: (value) => {
                if (typeof value === "string") return value.startsWith("$");
                return false;
            },
        },
        {
            referenceAreaPosi: "bottomLeft",
            xOffset: 0,
            yOffset: 1,
            valueCstr: ValueType.None,
        },
    ],
    traverse: {
        yDirection: "after",
    },
    children: [
        {
            startCell: {
                xOffset: 0,
                yOffset: 0,
            },
            size: {
                width: 2,
                height: 1,
            },
            transform: {
                targetCols: ["Phone", "Price"],
            },
        },
        {
            startCell: {
                xOffset: 1,
                yOffset: 1,
            },
            constraints: [
                {
                    xOffset: -1,
                    yOffset: 0,
                    valueCstr: ValueType.String,
                },
                {
                    xOffset: 1,
                    yOffset: 0,
                    valueCstr: ValueType.None,
                },
            ],
            traverse: {
                yDirection: "after",
            },
            transform: {
                context: {
                    position: "left",
                    targetCol: (ctxCells) => {
                        if (ctxCells[0].value === "Announced Date") return "Release Date";
                        return ctxCells[0].value as string;
                    },
                },
                targetCols: "context",
            },
        },
        {
            startCell: {
                xOffset: 1,
                yOffset: 2,
            },
            size: {
                width: 6,
                height: 1,
            },
            constraints: [
                {
                    xOffset: -1,
                    yOffset: 0,
                    valueCstr: "Dimensions",
                },
            ],
            traverse: {
                yDirection: "whole",
            },
            children: [
                {
                    startCell: {
                        xOffset: 1,
                        yOffset: 0,
                    },
                    constraints: [
                        {
                            xOffset: 0,
                            yOffset: 0,
                            valueCstr: (value) => {
                                if (typeof value === "string") return value.endsWith("mm");
                                return false;
                            },
                        },
                    ],
                    traverse: {
                        xDirection: "after",
                    },
                    transform: {
                        context: {
                            position: "left",
                            targetCol: (contextValue) => {
                                if (typeof contextValue != "string") return null;
                                if (["Height", "H"].includes(contextValue)) return "Height";
                                if (["Width", "W"].includes(contextValue)) return "Width";
                                if (["Depth", "D"].includes(contextValue)) return "Depth";
                                return null;
                            },
                        },
                        targetCols: "context",
                    },
                }
            ],
        },
        {
            startCell: {
                xOffset: 1,
                yOffset: 4,
            },
            size: {
                width: 2,
                height: 1,
            },
            constraints: [
                {
                    xOffset: -1,
                    yOffset: 0,
                    valueCstr: "Camera",
                },
            ],
            traverse: {
                yDirection: "whole",
            },
            transform: {
                targetCols: (currentAreaTbl) => {
                    // console.log(currentAreaTbl[0].map(Number));
                    return sortWithCorrespondingArray(
                        currentAreaTbl[0].map(Number),
                        ["Front Camera", "Rear Camera"],
                        "asc"
                    );
                },
            },
        },
    ],
};


const { rootArea, tidyData } = transformTable(case3_mt, case3_spec);
// console.log(serialize(rootArea));
console.log(tidyData);

// @ts-ignore
import * as fs from 'fs';
fs.writeFileSync('rootArea-case3.json', serialize(rootArea), 'utf-8');



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
    }, 2);
}