import { Table2D, TableCanoniserTemplate, CellInfo, AllParams, AreaInfo, RegionPosition } from "./grammar";
export declare function serialize(obj: any): string;
export declare const getCellBySelect: (select: AllParams<RegionPosition>, currentArea: AreaInfo, rootArea: AreaInfo, constrFlag?: boolean) => CellInfo | null;
export declare function transformTable(table: Table2D, specs: TableCanoniserTemplate[]): {
    rootArea: AreaInfo;
    tidyData: {
        [key: string]: CellInfo[];
    };
};
