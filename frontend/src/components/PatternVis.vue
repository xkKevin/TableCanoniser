<template>
    <div class="view" style="flex: 4.5">
        <div class="view-title">
            <span>Pattern Panel</span>
            <span style="float: right; margin-right: 20px; ">
                <span style="font-size: 15px">
                    <!-- <span>Match:</span>
                    <a-button class="legend legend-null" size="small">No Extration</a-button>
                    <span>Extract by:</span> -->
                    <span>Match + Extract by:</span>
                    <a-button-group style="margin: 0 20px 0 8px;">
                        <a-button class="legend legend-null" size="small" @click="selectMatchExtractArea('null')"
                            title="Click to select a starting area in the input table for matching without extraction. Press 'Esc' to cancel the selection mode.">No
                            Extration</a-button>
                        <a-button class="legend legend-position" size="small"
                            @click="selectMatchExtractArea('position')"
                            title="Click to select a starting area in the input table for matching and extracting by position. Press 'Esc' to cancel the selection mode.">Position</a-button>
                        <a-button class="legend legend-context" size="small" @click="selectMatchExtractArea('context')"
                            title="Click to select a starting area in the input table for matching and extracting by context. Press 'Esc' to cancel the selection mode.">Context</a-button>
                        <a-button class="legend legend-value" size="small" @click="selectMatchExtractArea('value')"
                            title="Click to select a starting area in the input table for matching and extracting by value. Press 'Esc' to cancel the selection mode.">Value</a-button>
                    </a-button-group>
                </span>
                <a-button id="draw_tree" size="small" @click="drawTree2">
                    <v-icon name="bi-arrow-clockwise" scale="0.9"></v-icon>
                    <span>Reset View</span>
                </a-button>
            </span>
        </div>
        <div class="view-content" style="display: flex;">
            <div style="flex: 1;">
                <div class="tbl-container" ref="tblContainer"></div>
            </div>
            <div style="flex: 1; margin-left: 5px">
                <a-dropdown :trigger="['contextmenu']" :open="contextMenuVisible"
                    @openChange="contextMenuVisibleChange">
                    <template #overlay>
                        <a-menu @click="closeContextMenu" :items="menuList">
                        </a-menu>
                    </template>
                    <div class="tree-container" ref="treeContainer"></div>
                </a-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
// import * as d3 from 'd3';
// import { flextree, FlextreeNode } from 'd3-flextree';
import { TreeChart } from '@/tree/drawTree';
import { message } from 'ant-design-vue';
import { TblCell, useTableStore } from "@/store/table";
import * as d3 from 'd3';
import { TypeColor } from '@/tree/style';
import { Table2D } from '@/grammar/grammar';
const tableStore = useTableStore();

/*
interface TreeNode {
    [key: string]: any;
    children?: TreeNode[];
}

const data: TreeNode = {
    name: 'Root',
    children: [
        { name: 'Child 1' },
        {
            name: 'Child 2',
            children: [
                { name: 'Grandchild 1' },
                { name: 'Grandchild 2' },
                { name: 'Grandchild 3' },
            ]
        }
    ]
};
*/

const menuList = computed(() => tableStore.tree.menuList);
// const contextMenuVisible = tableStore.tree.contextMenuVisible;
const contextMenuVisible = computed(() => tableStore.tree.contextMenuVisible && tableStore.tree.menuList.length > 0);
const contextMenuVisibleChange = (value: boolean) => {
    // if (store.state.selectedNode.length === 0 && value === true) return;
    // store.commit('setContextMenuVisibility', value);
    tableStore.tree.contextMenuVisible = value;
    tableStore.tree.menuList = [];
    // setTimeout(() => {
    //     tableStore.tree.menuList = [];
    // }, 0)
};

const closeContextMenu = (e: any) => {
    // console.log("closeContextMenu", e, e.key);
    const visNode = tableStore.spec.selectNode.data;
    let extract: any = null, extractColor: string = '';
    let triggerCellCursorFlag = false;
    let messageInfo = "\n Press ESC to cancel the selection mode.";
    switch (e.key) {
        case "0":
            // Reset Area Logic
            messageInfo = "Please reselect the template's area in the input table." + messageInfo;
            triggerCellCursorFlag = true;
            break;
        case "1":
            // Add Constraints Logic
            messageInfo = "Please select the constrained cell in the input table." + messageInfo;
            triggerCellCursorFlag = true;
            break;
        case "2-0":
            // Target Cols - Position Based Logic
            // let colCount = 0;
            extract = {
                // byPositionToTargetCols: Array.from({ length: node.data.width * node.data.height }, (_, _i) => `C${++colCount}`)
                byPositionToTargetCols: Array.from({ length: visNode.width * visNode.height }, (_, i) => `C${tableStore.findMaxCNumber() + i + 1}`)
            }
            extractColor = 'positionShallow';
            break;
        case "2-1":
            // Target Cols - Context Based Logic
            extract = {
                byContext: {
                    position: 'above',
                    toTargetCols: 'cellValue'
                }
            }
            extractColor = 'contextShallow';
            break;
        case "2-2":
            // Target Cols - Value Based Logic
            extract = {
                byValue: (currentAreaTbl: Table2D) => {
                    // Please replace the default code with the necessary implementation to complete the function.
                    return currentAreaTbl.flat();
                }
            };
            extractColor = 'valueShallow';
            break;
        case "2-3":
            // Target Cols - No Extract Logic
            tableStore.insertNodeOrPropertyIntoSpecs(undefined, "extract")
            break;
        case "3":
            // Add Sub-Template Logic
            messageInfo = "Please select an area in the input table." + messageInfo;
            triggerCellCursorFlag = true;
            break;
        case "4":
            tableStore.deleteChildByPath(tableStore.spec.rawSpecs, visNode.path!);
            tableStore.stringifySpec();
            break;
        case "5":
            tableStore.deleteChildByPath(tableStore.spec.rawSpecs, visNode.path!, tableStore.spec.selectConstrIndex);
            tableStore.stringifySpec();
    }

    if (extract !== null) {
        tableStore.insertNodeOrPropertyIntoSpecs(extract, "extract")
        tableStore.editor.mappingSpec.highlightCode = [...tableStore.getHighlightCodeStartEndLine(extract, tableStore.getNodebyPath(tableStore.spec.rawSpecs, visNode.path!)), extractColor];
    }
    if (triggerCellCursorFlag) {
        message.info(messageInfo);
        tableStore.spec.selectAreaFromNode = e.key;
        document.body.style.cursor = 'cell';
        document.documentElement.style.setProperty('--custom-cursor', 'cell');
        const cells = tableStore.generateHighlightCells(tableStore.spec.selectionsAreaFromLegend, tableStore.spec.selectAreaFromLegend);
        tableStore.highlightTblCells("input_tbl", cells);
    }
    tableStore.tree.contextMenuVisible = false;
}

const treeContainer = ref<HTMLDivElement | null>(null);

function drawTree2() {
    drawTree(tableStore.spec.visTree);
    drawTblTemplate();
    // if (zoom && tblContainer.value) {
    //     // 不能对g.matrix元素进行transform操作，因为zoom事件监听器是添加在svg元素上的，所以需要对svg元素进行transform操作
    //     d3.select(tblContainer.value).select('svg').transition().duration(750)
    //         .call(zoom.transform as any, d3.zoomIdentity); // 重置缩放和平移状态
    // }
}

const drawTree = (data: any) => {
    const treeInstance = new TreeChart([2, 1], '.tree-container', data, tableStore, 1.0, 'h');
    treeInstance.render();
    tableStore.tree.visInst = treeInstance;
};

const typeMap = {
    "null": "No Extration",
    "position": "Position Based",
    "context": "Context Based",
    "value": "Value Based",
}
const selectMatchExtractArea = (type: TypeColor) => {
    const selectionsFromLegend = tableStore.spec.selectionsAreaFromLegend;
    const selectFromLegend = tableStore.spec.selectAreaFromLegend;
    const cells = tableStore.generateHighlightCells(selectionsFromLegend, selectFromLegend);
    tableStore.highlightTblCells("input_tbl", cells);

    if (selectFromLegend.length > selectionsFromLegend.length) {
        selectFromLegend[selectFromLegend.length - 1] = type;
    } else {
        selectFromLegend.push(type);
    }
    // const cursorStyle = `url(${require('@/assets/cell.png')}), auto`;
    document.body.style.cursor = 'cell';
    document.documentElement.style.setProperty('--custom-cursor', 'cell');
    message.info("Now is " + typeMap[type as keyof typeof typeMap] + " mode. Please select the starting area in the input table.\n Press ESC to cancel the selection mode.");
    // tableStore.input_tbl.instance.rootElement.style.cursor = "cell";
    // (document.querySelector('.truncated') as HTMLElement).style.cursor = "cell"
}



const tblContainer = ref<HTMLDivElement | null>(null);
let offsetX = 0;
let offsetY = 0;
let transformStatue: any;
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

const drawTblTemplate = () => {
    if (!tblContainer.value) return;
    // Clear any existing SVG
    d3.select(tblContainer.value).selectAll('svg').remove();

    try {
        const visChildren = tableStore.spec.visTree.children
        if (visChildren === undefined || visChildren.length === 0 || visChildren[0].width === 0 || visChildren[0].height === 0) return;

        const containerWidth = tblContainer.value.clientWidth;
        const containerHeight = tblContainer.value.clientHeight;


        let cellWidth = Math.max(5, Math.min(90, Math.floor(containerWidth / visChildren[0].width)));
        let cellHeight = Math.max(5, Math.min(30, Math.floor(containerHeight / visChildren[0].height)));
        // const cellWidth = 90;
        // const cellHeight = 30;

        zoom = d3.zoom<SVGSVGElement, unknown>()
            // .scaleExtent([0.5, 3.5])  // set the zoom scale range
            .on('zoom', function (event) {
                // svg.attr('transform', event.transform);  // 直接设置svg的transform属性会导致缩放后的坐标系不正确（导致的问题是：用鼠标平移（pan）矩形的时候，矩形会抖动，导致矩形实际平移的距离小于鼠标平移的距离），因此需要在svg内部再添加一个g元素
                d3.select('g.tbl-template').attr('transform', `translate(${offsetX + event.transform.x}, ${offsetY + event.transform.y}) scale(${event.transform.k})`); // Update the matrix transform based on the zoom event
                updateCellTextVisibility(event.transform.k); // Update cell text visibility based on the current scale
                // transformStatue = event.transform;
            })

        const svg = d3.select(tblContainer.value)
            .append('svg')
            .attr('width', containerWidth)
            .attr('height', containerHeight)
            .call(zoom)  // 注意，这里添加zoom的是svg元素，而不是g.matrix元素，所以当resetZoom时，需要对svg元素进行transform操作

        const matrix = svg.append('g').classed("tbl-template", true);  // Append a 'g' element for better transform management to avoid jittering
        let texts: any = null;

        const grids = tableStore.computeTblPatternGrid();

        const cells = matrix.selectAll('rect')
            .data(grids)
            .enter().append('rect').classed('tbl-template-cell', true)
            .attr('x', d => d.col * cellWidth)
            .attr('y', d => d.row * cellHeight)
            // .attr('id', d => `tbl-template-${d.row}-${d.col}`)
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('fill', (d) => d.bgColor ? d.bgColor : '#f9f7ff')
            .attr('stroke', '#cccccc')
            .on('mouseover', function (this: SVGRectElement) {
                d3.select(this).raise() // Bring the cell to the front 
                    // .attr('fill', '#ece9e6')
                    // .attr('stroke', '#4b8aff')
                    .attr('stroke-width', 2);
                if (texts) {
                    texts.raise();
                }
            })
            .on('mouseout', function () {
                d3.select(this)
                    // .attr('fill', '#f9f7ff')
                    // .attr('stroke', '#cccccc')
                    .attr('stroke-width', 1);
            })
            .on('click', function (event, d: TblCell) {
                // tableStore.grid_cell_click({ row: d.row + visChildren[0].y, col: d.col + visChildren[0].x });
                const row = d.row + visChildren[0].y;
                const col = d.col + visChildren[0].x;
                d3.select(`#grid-${row}-${col}`).dispatch('click');
                tableStore.highlightNodes([[row, col, row, col]]);
                tableStore.input_tbl.instance.deselectCell();
                tableStore.output_tbl.instance.deselectCell();
            })
            .append('title').text(d => d.text ? 'Target Col: ' + d.text : null);

        // Calculate the offset to center the matrix in the SVG container
        offsetX = Math.max((containerWidth - matrix.node()!.getBBox().width) / 2, 0);
        offsetY = Math.max((containerHeight - matrix.node()!.getBBox().height) / 2, 0);
        matrix.attr('transform', `translate(${offsetX}, ${offsetY})`); // Center the matrix
        transformStatue = d3.zoomIdentity;



        const updateCellTextVisibility = (scale: number) => {
            const scaledCellWidth = cellWidth * scale;
            const scaledCellHeight = cellHeight * scale;
            // const cellArea = scaledCellWidth * scaledCellHeight;
            if (scaledCellWidth >= 90 || scaledCellHeight >= 30) {
                if (texts) {
                    texts.style('display', 'block');
                } else {
                    texts = matrix.selectAll('text')
                        .data(grids)
                        .enter().append('text').classed('tbl-template-text', true)
                        .attr('x', d => d.col * cellWidth + cellWidth / 2)
                        .attr('y', d => d.row * cellHeight + cellHeight / 2)
                        .attr('dy', '.30em')
                        .attr('font-size', 15 / scale)
                        .attr('fill', (d) => d.textColor ? d.textColor : '#f9f7ff')
                        .attr('text-anchor', 'middle')
                        .text(d => d.text ? d.text : '')
                        .each(function (d) {
                            const textElement = d3.select(this);
                            let text = textElement.text();
                            let textLength = this.getComputedTextLength();
                            // 如果文本超出最大宽度，进行截断
                            while (textLength > cellWidth && text.length > 0) {
                                text = text.slice(0, -1);
                                textElement.text(text + '…');
                                textLength = this.getComputedTextLength();
                            }
                        })
                        .style('display', 'block')
                        .style('pointer-events', 'none'); // Ensure text does not capture mouse events, in order to allow clicking on the cells
                }
            } else {
                if (texts) {
                    texts.style('display', 'none');
                }
            }
        };

        updateCellTextVisibility(1); // Initial update for default scale 1
    }
    catch (e) {

    }
}

/*
import { debounce } from 'lodash';

// import { TableTidierTemplate } from '@/grammar/grammar';

const debouncedResize = debounce(() => {
    drawTree(tableStore.spec.visTree);
}, 100); // 调整延迟时间，单位为毫秒

const resizeObserver = new ResizeObserver(() => {
    debouncedResize();
});
*/

watch(() => tableStore.editor.mappingSpec.code, (newVal) => {
    // console.log('watch code changed: start');
    tableStore.editor.mappingSpec.instance?.setValue(newVal);
    const setFlag = tableStore.prepareDataAfterCodeChange();
    if (!setFlag) return;
    drawTree(tableStore.spec.visTree);
    drawTblTemplate();
    tableStore.transformTablebyCode();  // auto run

    // console.log('watch code changed: end');
});

// watch(() => tableStore.spec.visTree.size.height, (newVal) => {
//     console.log('watch tbl size changed: start');
//     const setFlag = tableStore.prepareDataAfterCodeChange();
//     if (!setFlag) return;
//     drawTree(tableStore.spec.visTree);
//     console.log('watch tbl size changed: end');
// });


onMounted(() => {
    if (treeContainer.value) {
        // resizeObserver.observe(treeContainer.value);
    }
    // drawTree(tableStore.spec.visTree);
});



</script>

<style lang="less">
.tree-container {
    width: 100%;
    height: 100%;

    .type-node:hover {
        stroke: var(--color-selection);
        stroke-width: 3px;
    }

    .type-node.selection {
        stroke: var(--color-selection);
        stroke-width: 3px;
    }
}

.tbl-container {
    width: 100%;
    height: 100%;

    .tbl-template-cell:hover {
        stroke: var(--color-selection);
        stroke-width: 2px;
    }
}

.legend-null {
    background: var(--color-null);
}

.legend-position {
    background: var(--color-position);
}

// .legend-position:hover {
//     background: var(--color-position) !important;
// }

.legend-context {
    background: var(--color-context);
}

.legend-value {
    background: var(--color-value);
}

.legend {
    color: white !important;
}

.legend:hover {
    color: white !important;
}
</style>