"use strict";
// The Declarative Grammar v0.4.4
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = exports.completeCellConstraint = exports.completeRegionPosition = exports.completeSpecification = exports.TableCanoniserKeyWords = void 0;
/**
 * Defines a set of keywords used in the TableCanoniser Grammar.
 *
 * - `String`: Used in `valueCstr` of `constraints` to specify that a cell must contain a string value.
 * - `Number`: Used in `valueCstr` of `constraints` to specify that a cell must contain a numeric value.
 * - `None`: Used in `valueCstr` of `constraints` to specify that a cell must be empty, null, or undefined.
 * - `NotNone`: Used in `valueCstr` of `constraints` to specify that a cell must not be empty, null, or undefined.
 * - `Forward`: Used in the `fill` property to indicate that columns with a length less than the maximum length will be filled with the last available value, ensuring that all columns in the output table have equal lengths.
 * - `Auto`: Used in the `fill` property to indicate that columns with a length less than the maximum length will be automatically filled with null or empty strings, depending on the information of the matching area and pattern.
 * - `pairSort`: Used in user-defined functions to sort array `A` according to the specified order (`asc` or `desc`) and reorders array `B`, so that its elements correspond to the newly sorted order of `A`.
 */
const TableCanoniserKeyWords = {
    /**
     * Used in `valueCstr` of `constraints` to specify that a cell must contain a string value.
     */
    String: 'TableCanoniserKeyWords.String',
    /**
     * Used in `valueCstr` of `constraints` to specify that a cell must contain a numeric value.
     */
    Number: 'TableCanoniserKeyWords.Number',
    /**
     * Used in `valueCstr` of `constraints` to specify that a cell must be empty, null, or undefined.
     */
    None: 'TableCanoniserKeyWords.None',
    /**
     * Used in `valueCstr` of `constraints` to specify that a cell must not be empty, null, or undefined.
     */
    NotNone: 'TableCanoniserKeyWords.NotNone',
    /**
     * Used in the `fill` property to indicate that columns with a length less than the maximum length will be filled with the last available value, ensuring that all columns in the output table have equal lengths.
     */
    Forward: 'TableCanoniserKeyWords.Forward',
    /**
     * Used in the `fill` property to indicate that columns with a length less than the maximum length will be automatically filled with null or empty strings, depending on the information of the matching area and pattern.
     */
    Auto: 'TableCanoniserKeyWords.Auto',
    /**
     * Used in user-defined functions to sort array `A` according to the specified order (`asc` or `desc`) and reorders array `B`
     * so that its elements correspond to the newly sorted order of `A`.
     *
     * @param {any[]} A - The array whose elements determine the sort order.
     * @param {any[]} B - The array to be reordered based on the sorted order of `A`.
     * @param {'asc' | 'desc'} sortOrder - The sorting order: 'asc' for ascending, 'desc' for descending.
     * @returns {any[]} - The reordered array `B` with elements corresponding to the sorted order of `A`.
     *
     * @example
     * ```typeScript
     * const A = [3, 1, 2];
     * const B = ['Col1', 'Col2', 'Col3'];
     * const correspondingB_Asc = TableCanoniserKeyWords.pairSort(A, B, 'asc');
     * // ['Col3', 'Col1', 'Col2']
     * const correspondingB_Desc = TableCanoniserKeyWords.pairSort(A, B, 'desc');
     * // ['Col1', 'Col3', 'Col2']
     * ```
     */
    pairSort: sortWithCorrespondingArray,
};
exports.TableCanoniserKeyWords = TableCanoniserKeyWords;
/**
 * Sorts array `A` according to the specified order (`asc` or `desc`) and reorders array `B`
 * so that its elements correspond to the newly sorted order of `A`.
 *
 * @param {any[]} A - The array whose elements determine the sort order.
 * @param {any[]} B - The array to be reordered based on the sorted order of `A`.
 * @param {'asc' | 'desc'} sortOrder - The sorting order: 'asc' for ascending, 'desc' for descending.
 * @returns {any[]} - The reordered array `B` with elements corresponding to the sorted order of `A`.
 *
 * @example
 * const A = [3, 1, 2];
 * const B = ['Col1', 'Col2', 'Col3'];
 * const correspondingB_Asc = sortWithCorrespondingArray(A, B, 'asc');  // ['Col3', 'Col1', 'Col2']
 * const correspondingB_Desc = sortWithCorrespondingArray(A, B, 'desc'); // ['Col1', 'Col3', 'Col2']
 */
function sortWithCorrespondingArray(A, B, sortOrder) {
    let indexedA = A.map((value, index) => ({ value, index }));
    indexedA.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
        }
        else {
            return a.value > b.value ? -1 : a.value < b.value ? 1 : 0;
        }
    });
    const sortedB = new Array(B.length);
    indexedA.forEach((e, i) => sortedB[e.index] = B[i]);
    return sortedB;
}
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
const DEFAULT_REFERENCE_AREA_LAYER = "current";
const DEFAULT_REFERENCE_AREA_POSI = "topLeft";
const DEFAULT_X_OFFSET = 0;
const DEFAULT_Y_OFFSET = 0;
const DEFAULT_X_DIRECTION = null;
const DEFAULT_Y_DIRECTION = null;
const DEFAULT_CONTEXT_POSITION = "above";
const DEFAULT_TARGET_COL = (ctxCells => ctxCells[0].value); // null;
const DEFAULT_VALUE_CSTR = TableCanoniserKeyWords.String;
const DEFAULT_IGNORE_OUT_OF_BOUNDS = true;
const DEFAULT_FILL = TableCanoniserKeyWords.Auto; // null;
function completeRegionPosition(selection) {
    if (!selection) {
        return {
            offsetLayer: DEFAULT_REFERENCE_AREA_LAYER,
            offsetFrom: DEFAULT_REFERENCE_AREA_POSI,
            offsetX: DEFAULT_X_OFFSET,
            offsetY: DEFAULT_Y_OFFSET,
        };
    }
    return {
        offsetLayer: selection.offsetLayer || DEFAULT_REFERENCE_AREA_LAYER,
        offsetFrom: selection.offsetFrom || DEFAULT_REFERENCE_AREA_POSI,
        offsetX: selection.offsetX === undefined ? DEFAULT_X_OFFSET : selection.offsetX,
        offsetY: selection.offsetY === undefined ? DEFAULT_Y_OFFSET : selection.offsetY,
    };
}
exports.completeRegionPosition = completeRegionPosition;
function completeCellConstraint(constraint) {
    const completedSelection = completeRegionPosition(constraint);
    return Object.assign(Object.assign({}, completedSelection), { valueCstr: constraint.valueCstr === undefined
            ? DEFAULT_VALUE_CSTR
            : constraint.valueCstr, ignoreOutOfBounds: constraint.ignoreOutOfBounds === undefined
            ? DEFAULT_IGNORE_OUT_OF_BOUNDS
            : constraint.ignoreOutOfBounds });
}
exports.completeCellConstraint = completeCellConstraint;
function completeContextTransform(transform) {
    return {
        position: transform.position || DEFAULT_CONTEXT_POSITION,
        toTargetCol: transform.toTargetCol || DEFAULT_TARGET_COL,
    };
}
function completeSpecification(template) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return {
        match: {
            startCell: completeRegionPosition((_a = template.match) === null || _a === void 0 ? void 0 : _a.startCell),
            size: {
                width: ((_c = (_b = template.match) === null || _b === void 0 ? void 0 : _b.size) === null || _c === void 0 ? void 0 : _c.width) === undefined
                    ? DEFAULT_WIDTH
                    : template.match.size.width,
                height: ((_e = (_d = template.match) === null || _d === void 0 ? void 0 : _d.size) === null || _e === void 0 ? void 0 : _e.height) === undefined
                    ? DEFAULT_HEIGHT
                    : template.match.size.height,
            },
            constraints: ((_g = (_f = template.match) === null || _f === void 0 ? void 0 : _f.constraints) === null || _g === void 0 ? void 0 : _g.map(completeCellConstraint)) || [],
            traverse: {
                xDirection: ((_j = (_h = template.match) === null || _h === void 0 ? void 0 : _h.traverse) === null || _j === void 0 ? void 0 : _j.xDirection) === undefined
                    ? DEFAULT_X_DIRECTION
                    : template.match.traverse.xDirection,
                yDirection: ((_l = (_k = template.match) === null || _k === void 0 ? void 0 : _k.traverse) === null || _l === void 0 ? void 0 : _l.yDirection) === undefined
                    ? DEFAULT_Y_DIRECTION
                    : template.match.traverse.yDirection,
            },
        },
        extract: template.extract
            ? {
                byPositionToTargetCols: template.extract.byPositionToTargetCols || undefined,
                byContext: template.extract.byContext
                    ? completeContextTransform(template.extract.byContext)
                    : undefined,
                byValue: template.extract.byValue || undefined,
            }
            : null,
        fill: template.fill === undefined ? DEFAULT_FILL : template.fill,
        children: ((_m = template.children) === null || _m === void 0 ? void 0 : _m.map(completeSpecification)) || [],
    };
}
exports.completeSpecification = completeSpecification;
class CustomError extends Error {
    constructor(message, name = "CustomError") {
        super(message);
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=grammar.js.map