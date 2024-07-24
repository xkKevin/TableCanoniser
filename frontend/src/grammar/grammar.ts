// The Declarative Grammar v0.3.1

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
export interface AreaInfo extends MatchedIndex {
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
    fill?: CellValueType | 'forward' | null;
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


/********************************************************************************/

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

function transformTable(table: Table2D, spec: TableTidierTemplate) {

    const specWithDefaults = completeSpecification(spec);
    console.log(JSON.stringify(specWithDefaults, null, 2));

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
        };  // topLeft

        if (select.referenceAreaPosi === 'bottomLeft') {
            cellPosi.y += area.height - 1
        }
        else if (select.referenceAreaPosi === 'topRight') {
            cellPosi.x += area.width - 1
        }
        else if (select.referenceAreaPosi === 'bottomRight') {
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

    // 如果tidyData中的列长短不一样，则使用 template.fill 填充所有短的列，使每一列都有相同的长度
    const fillColumns = (tidyData: { [key: string]: CellValueType[] }, fill: CellValueType | 'forward' | null) => {
        if (fill === null) return;
        // 获取所有列的最大长度
        const maxLength = Math.max(...Object.values(tidyData).map(column => column.length));
        // 对每一列进行填充处理
        for (const key in tidyData) {
            const column = tidyData[key];
            const fillValue = fill === 'forward' ? column[column.length - 1] : fill;

            // 如果列长度小于最大长度，则进行填充
            while (column.length < maxLength) {
                column.push(fillValue);
            }
        }
    }

    const traverseArea = (template: AllParams<TableTidierTemplate>, startX: number, startY: number, endX: number, endY: number, width: number, height: number, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellValueType[] }) => {

        let currentStartX = startX;
        let currentEndX = startX + width - 1;
        let currentStartY = startY;
        let currentEndY = startY + height - 1;
        let tmpArea: AreaInfo | null = null;

        while (currentEndY <= endY) {
            const areaHeight = currentEndY - currentStartY + 1;
            while (currentEndX <= endX) {
                const areaWidth = currentEndX - currentStartX + 1;
                tmpArea = matchArea(template, currentStartX, currentStartY, areaWidth, areaHeight, index, currentArea, rootArea, tidyData);
                // if (currentArea.templateRef.length === 0)
                //     console.log("after match", currentStartX, currentStartY, areaWidth, areaHeight, tmpArea != null);
                if (tmpArea === null) {
                    // 如果没有找到，则移动到下一列
                    currentEndX += 1
                    if (template.size.width != null) {
                        currentStartX += 1;
                    } else if (currentEndX === endX) {
                        // 宽度可变且已经到了最后一列
                        currentStartX += 1
                        currentEndX = currentStartX
                    }
                } else {
                    index.instanceIndex += 1;
                    if (template.traverse.xDirection === null) break;
                    index.xIndex += 1;
                    currentStartX += areaWidth
                    currentEndX = currentStartX + width - 1;
                }
            }
            index.xIndex = 0;
            // 换行，列从 0 开始
            if (tmpArea === null) {
                // 如果没有找到，则移动到下一行
                currentEndY += 1
                if (template.size.height != null) {
                    currentStartY += 1
                } else if (currentEndY === endY) {
                    // 高度可变且已经到了最后一行
                    currentStartY += 1
                    currentEndY = currentStartY
                }
            } else {
                if (template.traverse.yDirection === null) break;
                index.yIndex += 1;
                currentStartY += areaHeight
                currentEndY = currentStartY + height - 1;
            }
            currentStartX = startX;
            currentEndX = startX + width - 1;

        }
    }


    const matchArea = (template: AllParams<TableTidierTemplate>, xOffset: number, yOffset: number, width: number, height: number, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellValueType[] }): AreaInfo | null => {

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
            templateRef: index.templateRef.slice(),
            instanceIndex: index.instanceIndex,
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
                            const customSelectionsWithDefaults = customSelections.map(selection => completeCellSelection(selection));
                            ctxSelections.push(customSelectionsWithDefaults);
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
    const processTemplate = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellValueType[] }, templateIndex: number = 0) => {

        const index: MatchedIndex = {
            templateRef: [...currentArea.templateRef, templateIndex],
            instanceIndex: 0,
            xIndex: 0,
            yIndex: 0
        };

        const xDirection = template.traverse.xDirection;
        const yDirection = template.traverse.yDirection;


        const startCell = getCellBySelect(template.startCell, currentArea, rootArea);
        if (startCell === null) {
            return null;
        };

        const xOffset = startCell.x - currentArea.x;
        const yOffset = startCell.y - currentArea.y;

        // Calculate size
        const width = calculateSize(template.size.width, xOffset, yOffset, currentArea);
        const height = calculateSize(template.size.height, xOffset, yOffset, currentArea);

        let startX, startY, endX, endY;

        if (xDirection === 'before') {
            startX = 0;
            endX = xOffset;
        } else if (xDirection === 'after') {
            startX = xOffset;
            endX = currentArea.width - 1;
        } else if (xDirection === 'whole') {
            startX = 0;
            endX = currentArea.width - 1;
        } else {
            startX = xOffset;
            if (template.size.width === null) endX = currentArea.width - 1;
            else endX = startX + width - 1;
        }
        if (yDirection === 'before') {
            startY = 0;
            endY = yOffset;
        } else if (yDirection === 'after') {
            startY = yOffset;
            endY = currentArea.height - 1;
        } else if (yDirection === 'whole') {
            startY = 0;
            endY = currentArea.height - 1;
        } else {
            startY = yOffset;
            if (template.size.height === null) endY = currentArea.height - 1;
            else endY = startY + height - 1;
        }

        // console.log(startX, startY, endX, endY, width, height);

        traverseArea(template, startX, startY, endX, endY, width, height, index, currentArea, rootArea, tidyData);

        for (let areaChild of currentArea.children) {
            template.children.forEach((templateChild, ti) => {
                processTemplate(templateChild, areaChild, rootArea, tidyData, ti);
            });
            fillColumns(tidyData, template.fill);
        }
    }

    // Create initial AreaInfo for the root
    const rootArea: AreaInfo = {
        parent: null,
        areaLayer: 0,
        templateRef: [],
        instanceIndex: 0,
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

    processTemplate(specWithDefaults, rootArea, rootArea, tidyData);

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


const case4_mt: Table2D = [
    ["Summary Statement of Account Limits for Accounts under Domestic Fund Pool of a Bank", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", "", "", "", "", ""], ["Region Code:", "1111", "", "Branch Code:", "1001", "", "2020/1/1", "", "Currency:", "CNY", "", "Page 1"], ["Account No.:", "12345", "", "Account Name:", "Main Bank A", "", "", "", "", "", "Agreement No.:", "123123123"], ["", "", "", "", "", "", "", "", "", "", "", ""], ["Index", "Sub Account Name", "", "Yesterday Available Credit", "Yesterday Reserved Credit", "Yesterday Frozen Credit", "", "Total Debit Transactions", "Total Debit Amount", "", "", "Today Net Deposit Amount "], ["", "Sub Account No.", "", "Today Available Credit", "Today Reserved Credit", "Today Frozen Credit", "", "Total Credit Transactions", "Total Credit Amount", "", "", ""], ["1", "Sub Bank A1", "", "11256568.73", "4614836.37", "1587748.25", "", "1", "11058.38", "", "", "-11400.11"], ["", "12345010", "", "11245168.62", "2083401.72", "1587748.25", "", "5", "16709.52", "", "", ""], ["2", "Sub Bank A2", "", "4156308.41", "1388858.84", "0.00", "", "7", "24550.18", "", "", "17017.61"], ["", "12345020", "", "4173326.02", "1733145.67", "0.00", "", "6", "83387.82", "", "", ""], ["3", "Sub Bank A3", "", "66786044.88", "22381748.78", "9105304.25", "", "9", "67781.17", "", "", "-19552.31"], ["", "12345030", "", "66766492.57", "12051751.66", "9105304.25", "", "2", "10130.22", "", "", ""], ["4", "Sub Bank A4", "", "53753568.53", "24154683.97", "0.00", "", "6", "9207.08", "", "", "5284.60"], ["", "12345040", "", "53758853.13", "12512925.66", "0.00", "", "9", "27100.26", "", "", ""], ["5", "Sub Bank A5", "", "68054078.36", "21768029.70", "3937029.54", "", "4", "15792.7", "", "", "19246.19"], ["", "12345050", "", "68073324.55", "9459141.76", "3937029.54", "", "7", "45228.12", "", "", ""], ["6", "Sub Bank A6", "", "12589233.46", "3071902.44", "1447270.10", "", "2", "34432.36", "", "", "15627.18"], ["", "12345060", "", "12604860.64", "882029.83", "1447270.10", "", "2", "39454.18", "", "", ""], ["7", "Sub Bank A7", "", "15699238.47", "3689156.95", "1572270.22", "", "2", "8848.5", "", "", "-6939.28"], ["", "12345070", "", "15692299.19", "3457640.37", "1572270.22", "", "4", "55521.79", "", "", ""], ["8", "Sub Bank A8", "", "97827738.78", "40848842.95", "19829919.22", "", "7", "51401.15", "", "", "-17842.02"], ["", "12345080", "", "97809896.76", "421674.67", "19829919.22", "", "2", "98199.66", "", "", ""], ["9", "Sub Bank A9", "", "92749039.79", "9057918.32", "1782096.47", "", "4", "15995.18", "", "", "15388.64"], ["", "12345090", "", "92764428.43", "1009390.27", "1782096.47", "", "1", "5830.36", "", "", ""], ["10", "Sub Bank A10", "", "3165008.51", "286684.96", "0.00", "", "3", "72287.61", "", "", "9015.26"], ["", "12345100", "", "3174023.77", "1320813.17", "0.00", "", "10", "78882.47", "", "", ""], ["11", "Sub Bank A11", "", "94721227.01", "29847920.32", "495266.31", "", "1", "13719.45", "", "", "-17915.14"], ["", "12345110", "", "94703311.87", "31011921.74", "495266.31", "", "6", "94272.49", "", "", ""], ["12", "Sub Bank A12", "", "97581908.19", "15111439.55", "2402008.31", "", "0", "0", "", "", "29145.58"], ["", "12345120", "", "97611053.77", "45627269.52", "2402008.31", "", "10", "46775.75", "", "", ""], ["13", "Sub Bank A13", "", "12097174.28", "5609928.54", "0.00", "", "5", "59365.26", "", "", "20022.57"], ["", "12345130", "", "12117196.85", "5461315.46", "0.00", "", "6", "92736.58", "", "", ""], ["14", "Sub Bank A14", "", "89024714.22", "24758438.14", "0.00", "", "5", "7436.89", "", "", "-18833.12"], ["", "12345140", "", "89005881.10", "33920372.96", "0.00", "", "0", "0", "", "", ""], ["15", "Sub Bank A15", "", "35241886.59", "10377709.67", "0.00", "", "1", "19949.3", "", "", "21893.60"], ["", "12345150", "", "35263780.19", "16744888.27", "0.00", "", "7", "54955.41", "", "", ""], ["16", "Sub Bank A16", "", "69266884.12", "18936027.08", "7837789.15", "", "2", "98991.61", "", "", "11498.08"], ["", "12345160", "", "69278382.20", "23605272.31", "7837789.15", "", "7", "38387.66", "", "", ""], ["17", "Sub Bank A17", "", "63252931.99", "3260536.65", "1055186.11", "", "6", "99018.42", "", "", "11349.67"], ["", "12345170", "", "63264281.66", "1922734.69", "1055186.11", "", "5", "93034.37", "", "", ""], ["18", "Sub Bank A18", "", "41686735.78", "1090116.39", "367085.19", "", "1", "9912.01", "", "", "-14795.57"], ["", "12345180", "", "41671940.21", "5829080.80", "367085.19", "", "10", "45861.97", "", "", ""], ["19", "Sub Bank A19", "", "23741324.70", "2892677.42", "0.00", "", "8", "95684.36", "", "", "28125.03"], ["", "12345190", "", "23769449.73", "7334552.06", "0.00", "", "1", "26060.15", "", "", ""], ["20", "Sub Bank A20", "", "50233431.33", "8698213.14", "0.00", "", "5", "74997.7", "", "", "-12924.44"], ["", "12345200", "", "50220506.89", "20226283.20", "0.00", "", "1", "82798.5", "", "", ""], ["21", "Sub Bank A21", "", "28998385.46", "5775628.37", "0.00", "", "4", "97855.79", "", "", "-892.15"], ["", "12345210", "", "28997493.31", "10593570.71", "0.00", "", "6", "28035.3", "", "", ""], ["22", "Sub Bank A22", "", "74552167.23", "33123924.04", "11877888.44", "", "5", "67233.8", "", "", "-9626.99"], ["", "12345220", "", "74542540.24", "35613649.00", "11877888.44", "", "7", "98453.99", "", "", ""], ["23", "Sub Bank A23", "", "42651485.90", "8020241.50", "0.00", "", "1", "78082.84", "", "", "-18982.03"], ["", "12345230", "", "42632503.87", "8118887.14", "0.00", "", "5", "12838.64", "", "", ""], ["24", "Sub Bank A24", "", "29535659.30", "5807832.34", "0.00", "", "5", "13844.41", "", "", "-1555.50"], ["", "12345240", "", "29534103.80", "789704.47", "0.00", "", "8", "41572.65", "", "", ""], ["25", "Sub Bank A25", "", "54928082.40", "10031474.66", "4014370.35", "", "0", "0", "", "", "23605.14"], ["", "12345250", "", "54951687.54", "19040555.27", "4014370.35", "", "9", "26805.76", "", "", ""]
];

const case4_spec: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 7,
    },
    size: {
        width: "toParentX", // 12,
        height: 2,
    },
    traverse: {
        yDirection: "after",
    },
    transform: {
        context: {
            position: (cell, currentArea) => {
                return [{
                    xOffset: cell.xOffset,
                    yOffset: cell.yOffset - (currentArea.yIndex + 1) * currentArea.height,
                }];
            },
            targetCol: "cellValue",
        },
        targetCols: "context",
    },
};


const case5_mt: Table2D = [
    ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 1 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["001POWED", "Dominick Powers", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["6/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "23", "351.87"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "351.87"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "351.87"], ["13/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "46", "703.74"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "703.74"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-80"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "623.74"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "66.86"], ["20/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "37.5", "573.7"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "573.7"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-53"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "520.7"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "54.5"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 5 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["002MORIC", "Crystal Morin", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["16/04/1985", "1W01 - Weekly", "", "CARCOSA", "2", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "46", "1003.22"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "1003.22"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-85"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "918.22"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "95.3"], ["23/04/1985", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "19.5", "425.27"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "425.27"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-14"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "411.27"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "40.4"], ["30/04/1985", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "30", "654.27"], ["", "", "", "", "", "Sat Casual Ldg", "", "", "", "", "8.5", "14.83"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "669.1"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-73"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "596.1"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "63.56"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 6 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["003DALTE", "Erma Dalton", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "40", "792.31"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "792.31"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-110"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "682.31"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "75.27"], ["12/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "40", "792.31"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "792.31"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-110"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "682.31"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "75.27"], ["19/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "40", "792.31"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "792.31"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-110"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "682.31"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "75.27"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 14 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["004NASHK", "Kristy Nash", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "28.5", "567.73"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7.5", "89.64"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "657.37"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-71"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "586.37"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "62.45"], ["12/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "29", "591.55"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7.5", "91.79"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "683.34"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-76"], ["", "", "", "", "", "Reimburse expenses", "", "", "", "", "0", "50"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "657.34"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "64.92"], ["19/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "21", "428.36"], ["", "", "", "", "", "Sick Leave", "", "", "", "", "7.5", "152.99"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "581.35"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-55"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "526.35"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "55.23"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 39 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["005RANDH", "Henrietta Randall", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["8/11/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "16", "407.97"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "407.97"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-10"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "397.97"], ["15/11/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "8", "203.98"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "203.98"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "203.98"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "58.14"], ["22/11/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "8.5", "216.73"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "216.73"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "216.73"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "20.59"], ["10/01/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "0"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "0"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 40 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["006BROWA", "Avis Browning", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "38", "771.42"], ["", "", "", "", "", "Long Service Leave", "", "", "", "", "76", "1542.84"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "2314.26"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-623"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "1691.26"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "219.85"], ["12/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "18", "374.18"], ["", "", "", "", "", "Annual Leave", "", "", "", "", "20", "415.75"], ["", "", "", "", "", "Leave Loading 17.5%", "", "", "", "", "0", "72.76"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "862.69"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-135"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "727.69"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "75.04"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 44 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["007GAINA", "Abigail Gaines", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/12/1983", "1W01 - Weekly", "", "CARCOSA", "2", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "58", "1222.14"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7.5", "94.82"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "1316.96"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-142"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "1174.96"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "125.11"], ["12/12/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "43", "906.07"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "906.07"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-150"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "756.07"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "86.08"], ["19/12/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "40.5", "853.4"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "853.4"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-131"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "722.4"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "81.07"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 52 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["008CALHR", "Randell Calhoun", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "16", "318.72"], ["", "", "", "", "", "Annual Leave", "", "", "", "", "7.5", "149.4"], ["", "", "", "", "", "Leave Loading 17.5%", "", "", "", "", "0", "26.15"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "494.27"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-36"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "458.27"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "44.47"], ["12/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "20.5", "418.17"], ["", "", "", "", "", "Annual Leave", "", "", "", "", "7.5", "152.99"], ["", "", "", "", "", "Leave Loading 17.5%", "", "", "", "", "0", "26.77"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "597.93"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-58"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "539.93"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "54.26"], ["19/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "35", "713.94"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "713.94"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-83"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "630.94"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "67.82"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 57 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["009KENTG", "Garry Kent", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["22/08/1983", "1W01 - Weekly", "", "CARCOSA", "2", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "17", "268.66"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "268.66"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "268.66"], ["5/09/1983", "1W01 - Weekly", "", "CARCOSA", "2", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "17", "268.66"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "268.66"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "268.66"], ["12/09/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "7.5", "118.53"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "118.53"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "118.53"], ["19/09/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "16", "252.86"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "252.86"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "252.86"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 70 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["010GOLDM", "Melanie Golden", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["29/11/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "8.5", "173.39"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "173.39"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "173.39"], ["6/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "8.5", "173.39"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "173.39"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "173.39"], ["13/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "25", "509.96"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "509.96"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-39"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "470.96"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "64.92"], ["20/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "32", "652.75"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7.5", "91.79"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "744.54"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-94"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "650.54"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "70.73"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 91 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["011MCCOJ", "Jonathan Mcconnell", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["23/08/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "32.75", "668.04"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "668.04"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-73"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "595.04"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "63.46"], ["30/08/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "33", "673.14"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "673.14"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-74"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "599.14"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "63.95"], ["6/09/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Sick Leave", "", "", "", "", "32", "652.75"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "652.75"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-70"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "582.75"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "62.01"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 111 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["012GAMBM", "Merrill Gamble", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["20/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "38.5", "441.75"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "441.75"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-20"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "421.75"], ["27/12/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "37.5", "430.28"], ["", "", "", "", "", "Public Holiday - worked", "", "", "", "", "7.5", "215.14"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "645.42"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-68"], ["", "", "", "", "", "Reimburse expenses", "", "", "", "", "0", "50"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "627.42"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "103.28"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 129 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["013DIXOM", "Mauro Dixon", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "30", "604.82"], ["", "", "", "", "", "Other Leave - Bereavement", "", "", "", "", "8", "161.28"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "766.1"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-101"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "665.1"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "57.46"], ["12/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "42", "867.06"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "867.06"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-136"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "731.06"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "82.37"], ["19/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "26", "536.75"], ["", "", "", "", "", "Annual Leave", "", "", "", "", "14", "289.02"], ["", "", "", "", "", "Leave Loading 17.5%", "", "", "", "", "0", "50.58"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "876.35"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-139"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "737.35"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "78.45"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 151 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["014ELLIS", "Sara Ellis", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["26/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "15", "305.97"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "305.97"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "305.97"], ["2/08/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "30", "611.95"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "611.95"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-61"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "550.95"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "58.14"], ["9/08/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "37.5", "764.94"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "764.94"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-101"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "663.94"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "72.67"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 179 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["015RUSHP", "Phil Rush", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["14/02/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "7.5", "152.99"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "152.99"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "152.99"], ["21/02/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "37", "754.74"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7", "85.67"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "840.41"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-127"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "713.41"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "94.37"], ["28/02/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "31.25", "637.45"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "6.5", "79.55"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "717"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-84"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "633"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "68.12"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 194 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["016LUCAB", "Beth Lucas", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "14.5", "252.74"], ["", "", "", "", "", "Sun Cas Ldg", "", "", "", "", "7.5", "91.51"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "344.25"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "344.25"], ["12/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "14", "249.88"], ["", "", "", "", "", "Sun Cas Ldg", "", "", "", "", "7", "87.46"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "337.34"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-166"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "171.34"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "64.75"], ["19/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "22", "392.67"], ["", "", "", "", "", "Sun Cas Ldg", "", "", "", "", "7.5", "93.7"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "486.37"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-239"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "247.37"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "46.21"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 199 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["017SIMSN", "Nola Sims", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["27/02/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "9.5", "200.18"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "200.18"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "200.18"], ["6/03/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "20.5", "431.96"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7.5", "94.82"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "526.78"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-43"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "483.78"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "50.04"], ["13/03/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "30", "632.14"], ["", "", "", "", "", "60% Sun Perm Ldg", "", "", "", "", "7.5", "94.82"], ["", "", "", "", "", "Public Holiday - worked", "", "", "", "", "4", "189.64"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "916.6"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-153"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "763.6"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "87.08"], ["20/03/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "21.5", "453.04"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "453.04"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-23"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "430.04"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "43.04"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 206 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["018DELAL", "Larry Delaney", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["5/07/1982", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "20", "398.4"], ["", "", "", "", "", "Sick Leave", "", "", "", "", "6", "119.52"], ["", "", "", "", "", "Term AL Gross", "", "", "", "", "89.04", "1773.69"], ["", "", "", "", "", "Term LL Gross", "", "", "", "", "0", "310.4"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "2602.01"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "-665"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "1937.01"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "49.2"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 207 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["019MCINC", "Christy Mcintyre", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["15/05/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "4", "105.36"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "105.36"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "105.36"], ["22/05/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "4.5", "118.53"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "118.53"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "118.53"], ["5/06/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "8.5", "223.88"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "223.88"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Uniforms - Reducing Balance", "", "", "", "", "0", "-10"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "213.88"], ["12/06/1984", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "5.5", "144.87"], ["", "", "", "", "", "Sun Cas Ldg", "", "", "", "", "5.5", "101.41"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "246.28"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Uniforms - Reducing Balance", "", "", "", "", "0", "-10"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "236.28"], ["", "", "", "", "", "Superannuation", "", "", "", "", "0", "44.67"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""], ["", "", "", "", "", "Employee Previous Earnings", "", "", "", "", "", ""], ["", "", "", "", "", "AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", ""], ["Employee Previous Earnings", "", "", "", "", "", "", "", "", "", "", "Page 216 of 553"], ["Payroll Company", "", "AMALGAMATED WIDGETS - AMALGAMATED WIDGETS PTY LTD", "", "", "", "", "", "", "", "", ""], ["020LYONM", "Milo Lyons", "", "", "", "", "", "", "", "", "", ""], ["For Pay End Periods between 1/07/1982 and 25/06/1985", "", "", "", "", "", "", "", "", "", "", ""], ["", "", "", "", "Number of", "", "", "", "", "", "", ""], ["Period End Date", "Pay Frequency", "", "Location", "", "Description", "", "", "", "", "Hours", "Amount"], ["12/12/1983", "1W01 - Weekly", "", "CARCOSA", "2", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "33", "391.14"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "391.14"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "391.14"], ["19/12/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "18", "213.35"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "213.35"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "213.35"], ["26/12/1983", "1W01 - Weekly", "", "CARCOSA", "1", "", "", "", "", "", "", ""], ["", "", "", "", "", "Normal Hours", "", "", "", "", "15", "177.79"], ["", "", "", "", "", "Gross Taxable Total", "", "", "", "", "0", "177.79"], ["", "", "", "", "", "Tax (Incl Adjust)", "", "", "", "", "0", "0"], ["", "", "", "", "", "Net Pay", "", "", "", "", "0", "177.79"], ["ACME Payroll (Registered to AMALGAMATED CO. PTY. LTD.)", "", "", "", "", "", "", "", "", "00:00.7", "", ""]
]

const case5_spec: TableTidierTemplate = {
    startCell: {
        xOffset: 0,
        yOffset: 0,
    },
    size: {
        width: "toParentX", // 12,
        height: null,
    },
    constraints: [
        {
            xOffset: 5,
            yOffset: 0,
            valueCstr: "Employee Previous Earnings",
        },
        {
            referenceAreaPosi: "bottomLeft",
            xOffset: 0,
            yOffset: 0,
            valueCstr: (value) => {
                if (typeof value === "string") return value.startsWith("ACME Payroll");
                return false;
            },
        },
    ],
    traverse: {
        yDirection: "after",
    },
    fill: "forward",
    children: [
        {
            startCell: {
                xOffset: 0,
                yOffset: 4,
            },
            size: {
                width: 2,
            },
            transform: {
                targetCols: ["EmployeeID", "Employee Name"],
            },
        },
        {
            startCell: {
                xOffset: 0,
                yOffset: 8,
            },
            size: {
                width: "toParentX",
            },
            traverse: {
                yDirection: "after",
            },
            transform: {
                context: {
                    position: (cell) => {
                        let xOffset = cell.xOffset, yOffset = 7;
                        if (cell.xOffset == 4) yOffset = 6;
                        return [{
                            xOffset,
                            yOffset,
                            referenceAreaLayer: "parent",
                        }];
                    },
                    targetCol: "cellValue",
                },
                targetCols: "context",
            },
        },
    ],
};

const { rootArea, tidyData } = transformTable(case5_mt, case5_spec);
// // console.log(serialize(rootArea));
console.log(tidyData);

// @ts-ignore
import * as fs from 'fs';
fs.writeFileSync('rootArea-case5.json', serialize(rootArea), 'utf-8');



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