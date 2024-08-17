import { Table2D, TableTidierTemplate, CellValueType, CellConstraint, CellPosi, TableTidierKeyWords, CellInfo, AllParams, AreaInfo, MatchedIndex, CellSelection, offsetFn, completeCellSelection, completeSpecification, ContextTransform } from "./grammar";

import { CustomError } from "../types";

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
    if (constraint.valueCstr === TableTidierKeyWords.String) {
        return typeof cellValue === 'string' && cellValue !== '' && isNaN(Number(cellValue));
    }
    if (constraint.valueCstr === TableTidierKeyWords.Number) {
        return typeof cellValue === 'number' || (typeof cellValue === 'string' && cellValue !== '' && !isNaN(Number(cellValue)));
    }
    if (constraint.valueCstr === TableTidierKeyWords.None) {
        return cellValue === null || cellValue === '' || cellValue === undefined;
    }
    if (constraint.valueCstr === TableTidierKeyWords.NotNone) {
        return cellValue !== null && cellValue !== '' && cellValue !== undefined;
    }
    return cellValue === constraint.valueCstr;
};

const calculateOffset = (offset: number | offsetFn, currentArea: AreaInfo, rootArea: AreaInfo): number => {
    return typeof offset === 'number' ? offset : offset(currentArea, rootArea);
};

export const getCellBySelect = (select: AllParams<CellSelection>, currentArea: AreaInfo, rootArea: AreaInfo): CellInfo | null => {
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
const fillColumns = (tidyData: { [key: string]: CellInfo[] }, fill: CellValueType | null) => {
    if (fill === null) return;
    // 获取所有列的最大长度
    const maxLength = Math.max(...Object.values(tidyData).map(column => column.length));
    // 对每一列进行填充处理
    for (const key in tidyData) {
        const column = tidyData[key];
        const fillValue = fill === TableTidierKeyWords.Forward ? column[column.length - 1] : {
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

const traverseArea = (template: AllParams<TableTidierTemplate>, startX: number, startY: number, endX: number, endY: number, width: number, height: number, index: MatchedIndex, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }, traverseFlag: boolean = true) => {

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
            // console.log("after match", [currentStartX, currentStartY, currentEndX, currentEndY], areaWidth, areaHeight, tmpArea != null);
            if (tmpArea === null) {
                // 如果没有找到，则移动到下一列
                if (template.match.size.width != null) {
                    // 宽度固定
                    currentStartX += 1;
                    currentEndX += 1
                } else if (currentEndX === endX) {
                    // 宽度可变且已经到了最后一列
                    currentStartX += 1
                    currentEndX = currentStartX
                } else {
                    // 宽度可变没有到最后一列
                    currentEndX += 1
                }
            } else {
                index.instanceIndex += 1;
                if (!traverseFlag) return;
                if (template.match.traverse.xDirection === null) break;
                index.xIndex += 1;
                currentStartX += areaWidth
                currentEndX = currentStartX + width - 1;
            }
        }
        index.xIndex = 0;
        // 换行，列从 0 开始
        if (tmpArea === null) {
            // 如果没有找到，则移动到下一行
            if (template.match.size.height != null) {
                currentStartY += 1
                currentEndY += 1
            } else if (currentEndY === endY) {
                // 高度可变且已经到了最后一行
                currentStartY += 1
                currentEndY = currentStartY
            } else {
                currentEndY += 1
            }
        } else {
            if (!traverseFlag) return;
            if (template.match.traverse.yDirection === null) break;
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

    if (template.match.startCell.referenceAreaLayer !== "current") {
        const cellInfo = getCellBySelect(template.match.startCell, currentArea, rootArea);
        if (cellInfo === null) {
            return null;
        };
        x = cellInfo.x;
        y = cellInfo.y;
    }

    const tmpArea: AreaInfo = {
        parent: currentArea,
        areaLayer: currentArea.areaLayer + 1,
        templateRef: index.templateRef.slice(),  // copy
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
    for (let cstr of template.match.constraints) {
        try {  // constraint 里的数组超界不会报错，而是根据 ignoreOutOfBounds 来判断
            const cellInfo = getCellBySelect(cstr, tmpArea, rootArea);
            if (cellInfo === null) {
                return null;
            }
            if (!evaluateConstraint(cellInfo.value, cstr)) return null;
        } catch (e) {
            if (cstr.ignoreOutOfBounds) continue;
            return null;
        }
    }
    currentArea.children.push(tmpArea);

    transformArea(template, tmpArea, rootArea, tidyData);
    return tmpArea;
};


const transformArea = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }) => {

    const cellArray = currentArea.areaTbl.flat();
    if (template.extract) {
        let transformedCols: (CellValueType | null)[];
        if (template.extract.byPositionToTargetCols !== undefined) {
            transformedCols = template.extract.byPositionToTargetCols
        } else if (template.extract.byContext !== undefined) {
            const context = template.extract.byContext; // as AllParams<ContextTransform>;
            const ctxCols: (CellValueType | null)[] = []
            const ctxCellsInfo: CellInfo[][] = [];

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
                const ctxPosiFn = context.position!;
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

            const customMapColbyCxt = context.toTargetCol!
            ctxCellsInfo.forEach(ctxCells => {
                ctxCols.push(customMapColbyCxt(ctxCells));
            })

            /*
        if (context.toTargetCol === null) {
            ctxCellsInfo.forEach((cellCtxsInfo) => {
                // ctxCols.push(cellCtxsInfo[0].value === undefined ? null : cellCtxsInfo[0].value.toString());
                ctxCols.push(cellCtxsInfo[0].value);
            })
        } else {
            const customMapColbyCxt = context.toTargetCol
            ctxCellsInfo.forEach((ctxCells) => {
                ctxCols.push(customMapColbyCxt(ctxCells));
            })
        }*/
            transformedCols = ctxCols
        } else if (template.extract.byValue !== undefined) {
            transformedCols = template.extract.byValue(currentArea.areaTbl);
        } else {
            throw new CustomError(`Please specify 'byPositionToTargetCols', 'byContext', or 'byValue' for extraction`, 'NoExtractionSpecified');
        }
        transformedCols.forEach((targetCol, index) => {
            if (targetCol !== null && targetCol !== undefined && targetCol !== '') {
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
    /*
    console.log(JSON.stringify(tidyData, (key, value) => {
        if (key === 'x' || key === 'y') {
            return undefined;
        }
        return value
    }, 2));
    console.log("-----------------");*/
}


// Recursive function to process a template
const processTemplate = (template: AllParams<TableTidierTemplate>, currentArea: AreaInfo, rootArea: AreaInfo, tidyData: { [key: string]: CellInfo[] }, templateIndex: number = 0, traverseFlag: boolean = true) => {

    const index: MatchedIndex = {
        templateRef: [...currentArea.templateRef, templateIndex],
        instanceIndex: 0,
        xIndex: 0,
        yIndex: 0
    };

    const xDirection = template.match.traverse.xDirection;
    const yDirection = template.match.traverse.yDirection;


    const startCell = getCellBySelect(template.match.startCell, currentArea, rootArea);
    if (startCell === null) {
        return null;
    };

    const xOffset = startCell.x - currentArea.x;
    const yOffset = startCell.y - currentArea.y;

    // Calculate size
    const width = calculateSize(template.match.size.width, xOffset, yOffset, currentArea);
    const height = calculateSize(template.match.size.height, xOffset, yOffset, currentArea);

    let startX, startY, endX, endY;

    if (xDirection === null || !traverseFlag) {
        startX = xOffset;
        if (template.match.size.width === null) endX = currentArea.width - 1;
        else endX = startX + width - 1;
    } else if (xDirection === 'before') {
        startX = 0;
        endX = xOffset;
    } else if (xDirection === 'after') {
        startX = xOffset;
        endX = currentArea.width - 1;
    } else {  //  if (xDirection === 'whole')
        startX = 0;
        endX = currentArea.width - 1;
    }

    if (yDirection === null || !traverseFlag) {
        startY = yOffset;
        if (template.match.size.height === null) endY = currentArea.height - 1;
        else endY = startY + height - 1;
    } else if (yDirection === 'before') {
        startY = 0;
        endY = yOffset;
    } else if (yDirection === 'after') {
        startY = yOffset;
        endY = currentArea.height - 1;
    } else {  // if (yDirection === 'whole')
        startY = 0;
        endY = currentArea.height - 1;
    }

    // console.log(startX, startY, endX, endY, width, height);

    traverseArea(template, startX, startY, endX, endY, width, height, index, currentArea, rootArea, tidyData, traverseFlag);

    const matchTemplateArea = currentArea.children.filter((area) => area.templateRef.toString() === index.templateRef.toString());

    if (template.children.length > 0 && matchTemplateArea.length > 0) {
        matchTemplateArea.forEach((areaChild) => {
            template.children.forEach((templateChild, ti) => {
                processTemplate(templateChild, areaChild, rootArea, tidyData, ti, traverseFlag);
            });
            if (template.fill === TableTidierKeyWords.Auto) {
                if (index.templateRef.length > 1) {
                    fillColumns(tidyData, null);
                } else {
                    fillColumns(tidyData, "");
                }
            } else {
                fillColumns(tidyData, template.fill);
            }
        })

        /*
        if (template.extract === null) {
            // 父区域没有 transform
            matchTemplateArea.forEach((areaChild, ai) => {
                template.children.forEach((templateChild, ti) => {
                    processTemplate(templateChild, areaChild, rootArea, tidyData, ti, traverseFlag);
                    console.log("templateChild", ti);
                });
                console.log(template.children.length, "areaChild", ai, "fillColumns:", areaChild.x, areaChild.y, areaChild.width, areaChild.height);
                // fillColumns(tidyData, template.fill);
                // if (template.fill === null && template.children.length > 1) {
                // if (template.fill === undefined && template.children.length > 1) {
                //     fillColumns(tidyData, "");
                // } else {
                //     fillColumns(tidyData, template.fill);
                // }
            })
        } else {
            // 父区域有 transform
            template.children.forEach((templateChild, ti) => {
                matchTemplateArea.forEach((areaChild) => {
                    processTemplate(templateChild, areaChild, rootArea, tidyData, ti, traverseFlag);
                });
                fillColumns(tidyData, template.fill);
                // if (template.fill === null) {
                // if (template.fill === undefined) {
                //     fillColumns(tidyData, "");
                // } else {
                //     fillColumns(tidyData, template.fill);
                // }
            })
        }
        */
    }


}

export function transformTable(table: Table2D, specs: TableTidierTemplate[], traverseFlag: boolean = true) {

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
        width: table.length > 0 ? table[0].length : 0,
        height: table.length,
        areaTbl: table,
        children: []
    };

    const tidyData: { [key: string]: CellInfo[] } = {}

    specs.forEach((template, ti) => {
        const specWithDefaults = completeSpecification(template);
        processTemplate(specWithDefaults, rootArea, rootArea, tidyData, ti, traverseFlag);
        // fillColumns(tidyData, specWithDefaults.fill);
        // if (specWithDefaults.fill === undefined && specWithDefaults.children.length > 1) {
        //     fillColumns(tidyData, "");
        // } else {
        //     fillColumns(tidyData, specWithDefaults.fill);
        // }
    });

    return { rootArea, tidyData };
}