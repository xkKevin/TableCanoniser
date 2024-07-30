import { Table2D, TableTidierTemplate, CellValueType, CellConstraint, CellPosi, ValueType, CellInfo, AllParams, AreaInfo, MatchedIndex, CellSelection, offsetFn, completeCellSelection, completeSpecification } from "./grammar";

import { CustomError } from "../types";

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

export function serialize(obj: any): string {
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

// Helper function to evaluate constraints
const evaluateConstraint = (cellValue: CellValueType, constraint: CellConstraint): boolean => {
    if (typeof constraint.valueCstr === 'function') {
        return constraint.valueCstr(cellValue);
    }
    if (constraint.valueCstr === ValueType.String) {
        return typeof cellValue === 'string' && cellValue !== '' && isNaN(Number(cellValue));
    }
    if (constraint.valueCstr === ValueType.Number) {
        return typeof cellValue === 'number' || (typeof cellValue === 'string' && cellValue !== '' && !isNaN(Number(cellValue)));
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
        throw new CustomError(`Invalid cell selection:\n Table size is (width: ${rootArea.width}, height: ${rootArea.height}), Position (${cellPosi.x}, ${cellPosi.y}) is out of bounds.`, 'OutOfBoundsError');
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
const fillColumns = (tidyData: { [key: string]: CellInfo[] }, fill: CellValueType | 'forward' | null) => {
    if (fill === null) return;
    // 获取所有列的最大长度
    const maxLength = Math.max(...Object.values(tidyData).map(column => column.length));
    // 对每一列进行填充处理
    for (const key in tidyData) {
        const column = tidyData[key];
        const fillValue = fill === 'forward' ? column[column.length - 1] : {
            x: -1,
            y: -1,
            value: fill
        } as CellInfo;

        // 如果列长度小于最大长度，则进行填充
        while (column.length < maxLength) {
            column.push(fillValue);
        }
    }
}

const traverseArea = (template: AllParams<TableTidierTemplate>, startX: number, startY: number, endX: number, endY: number, width: number, height: number, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }) => {

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
            // console.log("after match", currentStartX, currentStartY, areaWidth, areaHeight, tmpArea != null);
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
    // console.log("match over");
}


const matchArea = (template: AllParams<TableTidierTemplate>, xOffset: number, yOffset: number, width: number, height: number, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }): AreaInfo | null => {

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


const transformArea = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }) => {

    const cellArray = currentArea.areaTbl.flat();
    if (template.transform) {
        const context = template.transform.context;
        const ctxCols: (string | null)[] = []
        const ctxCellsInfo: CellInfo[][] = [];
        if (context) {
            const ctxSelections: CellSelection[][] = [];
            if (context.position === 'above') {
                currentArea.areaTbl.forEach((row, ri) => {
                    row.forEach((cell, ci) => {
                        ctxSelections.push([completeCellSelection({
                            xOffset: ci,
                            yOffset: ri - 1,
                        })]);
                    })
                })
            } else if (context.position === 'below') {
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
                    ctxCols.push(cellCtxsInfo[0].value === undefined ? null : cellCtxsInfo[0].value.toString());
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
                const cellInfo: CellInfo = {
                    x: currentArea.x + index % currentArea.width,
                    y: currentArea.y + Math.floor(index / currentArea.width),
                    value: cellArray[index],
                };
                if (tidyData.hasOwnProperty(targetCol)) {
                    tidyData[targetCol].push(cellInfo);
                } else {
                    tidyData[targetCol] = [cellInfo];
                }
            }
        })
    }
}


// Recursive function to process a template
const processTemplate = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }, templateIndex: number = 0) => {

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

    if (template.children.length > 0 && currentArea.children.length > 0) {
        if (template.transform === null) {
            // 父区域没有 transform
            for (let areaChild of currentArea.children) {
                template.children.forEach((templateChild, ti) => {
                    processTemplate(templateChild, areaChild, rootArea, tidyData, ti);
                });
                // fillColumns(tidyData, template.fill);
                if (template.fill === null && template.children.length > 1) {
                    fillColumns(tidyData, "");
                } else {
                    fillColumns(tidyData, template.fill);
                }
            }
        } else {
            // 父区域有 transform
            for (let templateChild of template.children) {
                currentArea.children.forEach((areaChild, ti) => {
                    processTemplate(templateChild, areaChild, rootArea, tidyData, ti);
                });
                // fillColumns(tidyData, template.fill);
                if (template.fill === null) {
                    fillColumns(tidyData, "");
                } else {
                    fillColumns(tidyData, template.fill);
                }
            }
        }
    }


}

interface TidyResult {
    tidyTbl: { [key: string]: CellValueType[] },
    in2out: { [key: string]: string[] },
    out2in: {
        cells: { [key: string]: string },
        cols: string[][],
        rows: string[][]
    }
}

export function transformTable(table: Table2D, specs: TableTidierTemplate[]) {

    // const specWithDefaults = completeSpecification(spec);
    // console.log(JSON.stringify(specWithDefaults, null, 2));

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

    const tidyresul: TidyResult = {
        tidyTbl: {},
        in2out: {},
        out2in: {
            cells: {},
            cols: [],
            rows: []
        }
    };

    const tidyData: { [key: string]: CellInfo[] } = {}

    specs.forEach((template, ti) => {
        const specWithDefaults = completeSpecification(template);
        processTemplate(specWithDefaults, rootArea, rootArea, tidyData, ti);
        // fillColumns(tidyData, specWithDefaults.fill);
        if (specWithDefaults.fill === null && specWithDefaults.children.length > 1) {
            fillColumns(tidyData, "");
        } else {
            fillColumns(tidyData, specWithDefaults.fill);
        }
    });

    return { rootArea, tidyData };
}