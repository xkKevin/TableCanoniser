<template>
    <div class="view" style="flex: 4">
        <div class="view-title">
            <span>Template Visualization</span>
            <a-button id="draw_tree" size="small" style="float: right; margin-right: 20px" @click="drawTree2">
                <v-icon name="bi-arrow-clockwise" scale="0.9"></v-icon>
                <span>Reset</span>
            </a-button>
        </div>
        <div class="view-content" style="display: flex;">
            <div style="flex: 1;">
                <div class="tbl-container" ref="tblContainer"></div>
            </div>
            <div style="flex: 1;">
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
import { transformTable } from '@/grammar/handleSpec';
import * as d3 from 'd3';
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
    setTimeout(() => {
        tableStore.tree.menuList = [];
    }, 200)
};

const closeContextMenu = (e: any) => {
    // console.log("closeContextMenu", e, e.key);
    const node = tableStore.spec.selectNode;
    switch (e.key) {
        case "0":
            // Reset Area Logic
            message.info("Please reselect the template's area in the input table.");
            tableStore.spec.selectAreaFlag = 2;
            break;
        case "1":
            // Add Constraints Logic
            message.info("Please select the constrained cell in the input table.");
            tableStore.spec.selectAreaFlag = 3;
            break;
        case "2-0":
            // Target Cols - Position Based Logic
            break;
        case "2-1":
            // Target Cols - Context Based Logic
            break;
        case "2-2":
            // Target Cols - Value Based Logic
            break;
        case "3":
            // Add Sub-Template Logic
            // console.log(node.path, tableStore.getSpecbyPath(node.path));
            message.info("Please select an area in the input table.");
            tableStore.spec.selectAreaFlag = 1;
            break;
        case "4":
            // Delete Template Logic
            // let rootNode = node.parent;
            // while (rootNode.parent) {
            //     rootNode = rootNode.parent;
            // }
            // // console.log(node, rootNode); //, JSON.stringify(rootNode)
            // console.log(rootNode.data.children);
            tableStore.deleteChildByPath(tableStore.spec.rawSpecs, node.path);
            tableStore.stringifySpec();
            break;
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



const tblContainer = ref<HTMLDivElement | null>(null);
let offsetX = 0;
let offsetY = 0;
let transformStatue: any;
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

const drawTblTemplate = () => {
    if (!tblContainer.value) return;
    // Clear any existing SVG
    d3.select(tblContainer.value).selectAll('svg').remove();

    const containerWidth = tblContainer.value.clientWidth;
    const containerHeight = tblContainer.value.clientHeight;

    // const rows = tableStore.spec.visTree.children![0].width;
    // const cols = tableStore.spec.visTree.children![0].height;
    // let cellWidth = Math.max(5, Math.min(90, Math.floor(containerWidth / cols)));
    // let cellHeight = Math.max(5, Math.min(30, Math.floor(containerHeight / rows)));
    const cellWidth = 90;
    const cellHeight = 30;

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

    const grids = [{
        row: 0,
        col: 0,
        text: "Rank",
        textColor: "#ffffff",
        color: "#83b5ed"
    }, {
        row: 0,
        col: 1,
        text: "Name",
        textColor: "#ffffff",
        color: "#83b5ed"
    }, {
        row: 0,
        col: 2,
        text: "Location",
        textColor: "#ffffff",
        color: "#83b5ed"
    }, {
        row: 0,
        col: 3,
        text: "Total Score",
        textColor: "#ffffff",
        color: "#83b5ed"
    }, {
        row: 1,
        col: 0
    }, {
        row: 1,
        col: 1,
        text: "Context",
        textColor: "#878787",
    }, {
        row: 1,
        col: 2
    }, {
        row: 1,
        col: 3
    }, {
        row: 2,
        col: 0
    }, {
        row: 2,
        col: 1,
        color: "#7EAA55"
    }, {
        row: 2,
        col: 2
    }, {
        row: 2,
        col: 3
    }, {
        row: 3,
        col: 0
    }, {
        row: 3,
        col: 1
    }, {
        row: 3,
        col: 2
    }, {
        row: 3,
        col: 3
    }, {
        row: 4,
        col: 0
    }, {
        row: 4,
        col: 1
    }, {
        row: 4,
        col: 2
    }, {
        row: 4,
        col: 3
    },];

    const cells = matrix.selectAll('rect')
        .data(grids)
        .enter().append('rect').classed('tbl-template-cell', true)
        .attr('x', d => d.col * cellWidth)
        .attr('y', d => d.row * cellHeight)
        .attr('id', d => `grid-${d.row}-${d.col}`)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', (d) => d.color ? d.color : '#f9f7ff')
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
            // console.log(`Clicked on cell: (${d.row}, ${d.col})`);
            // const input_tbl_cell = d3.select('#input-tbl tbody').select(`tr:nth-child(${d.row + 1})`).select(`td:nth-child(${d.col + 2})`) as d3.Selection<HTMLElement, unknown, HTMLElement, any>;

            // input_tbl_cell.node()!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); // Dispatch a click event on the corresponding cell in the input table
            // input_tbl_cell.dispatch('mouseup')
            // console.log(d3.select(this).attr('width'), d3.select(this).attr('height'), d);
            // d3.selectAll('rect.tbl-template-cell').attr('fill', '#f9f7ff').attr('stroke', '#cccccc');
            // d3.select(this).attr('fill', '#74b9ff');
            tableStore.grid_cell_click({ row: d.row + 1, col: d.col })
            tableStore.input_tbl.instance.deselectCell();
            tableStore.output_tbl.instance.deselectCell();
        });

    // Calculate the offset to center the matrix in the SVG container
    offsetX = Math.max((containerWidth - matrix.node()!.getBBox().width) / 2, 0);
    offsetY = Math.max((containerHeight - matrix.node()!.getBBox().height) / 2, 0);
    matrix.attr('transform', `translate(${offsetX}, ${offsetY})`); // Center the matrix
    transformStatue = d3.zoomIdentity;



    const updateCellTextVisibility = (scale: number) => {
        const scaledCellWidth = cellWidth * scale;
        const scaledCellHeight = cellHeight * scale;
        // const cellArea = scaledCellWidth * scaledCellHeight;
        if (scaledCellWidth >= 45 && scaledCellHeight >= 20) {
            if (texts) {
                texts.style('display', 'block');
            } else {
                texts = matrix.selectAll('text')
                    .data(grids)
                    .enter().append('text').classed('tbl-template-text', true)
                    .attr('x', d => d.col * cellWidth + cellWidth / 2)
                    .attr('y', d => d.row * cellHeight + cellHeight / 2)
                    .attr('id', d => `text-${d.row}-${d.col}`)
                    .attr('dy', '.30em')
                    .attr('font-size', 15 / scale)
                    .attr('fill', (d) => d.textColor ? d.textColor : '#f9f7ff')
                    .attr('text-anchor', 'middle')
                    .text(d => d.text ? d.text : '')
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
    const setFlag = tableStore.setSpec();
    if (!setFlag) return;
    try {
        const { rootArea } = transformTable(tableStore.input_tbl.tbl, tableStore.spec.rawSpecs, false);
        // console.log(rootArea, tableStore.spec.visTree, tableStore.spec.rawSpecs, tableStore.input_tbl.tbl[0]);
        tableStore.copyTreeAttributes(rootArea, tableStore.spec.visTree);
        // console.log(rootArea, tableStore.spec.visTree);
        drawTree(tableStore.spec.visTree);
        drawTblTemplate();
    } catch (e) {
        message.error(`Failed to parse the specification:\n ${e}`);
    }
    // console.log('watch code changed: end');
});

// watch(() => tableStore.spec.visTree.size.height, (newVal) => {
//     console.log('watch tbl size changed: start');
//     const setFlag = tableStore.setSpec();
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

<style lang="less" scoped>
.tree-container {
    width: 100%;
    height: 100%;
}

.tbl-container {
    width: 100%;
    height: 100%;
}
</style>