<template>
    <div class="view">
        <div class="view-title">
            <span>Mapping Minimap</span>
            <a-button size="small" style="float: right; margin-right: 20px" @click="resetZoom">
                <v-icon name="bi-arrow-clockwise" scale="0.9"></v-icon>
                <span>Reset</span>
            </a-button>
        </div>
        <div class="view-content">
            <div ref="container" class="grid-container"></div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';
import { useTableStore, TblCell } from "@/store/table";

const tableStore = useTableStore();

const container = ref<HTMLDivElement | null>(null);

let offsetX = 0;
let offsetY = 0;
let transformStatue: any;
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

function resetZoom() {
    if (zoom && container.value) {
        // 不能对g.matrix元素进行transform操作，因为zoom事件监听器是添加在svg元素上的，所以需要对svg元素进行transform操作
        d3.select(container.value).select('svg').transition().duration(750)
            .call(zoom.transform as any, d3.zoomIdentity); // 重置缩放和平移状态
    }
}

function generateGrid(rows: number, cols: number) {
    const grid: TblCell[] = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid.push({ row: i, col: j });
        }
    }
    return grid;
}

const drawGrid = (rows: number, cols: number) => {
    if (!container.value) return;

    // Clear any existing SVG
    d3.select(container.value).selectAll('svg').remove();

    const containerWidth = container.value.clientWidth;
    const containerHeight = container.value.clientHeight;
    let cellWidth = Math.max(5, Math.min(45, Math.floor(containerWidth / cols)));
    let cellHeight = Math.max(5, Math.min(20, Math.floor(containerHeight / rows)));
    cellWidth = cellHeight = Math.min(cellWidth, cellHeight)

    zoom = d3.zoom<SVGSVGElement, unknown>()
        // .scaleExtent([0.5, 3.5])  // set the zoom scale range
        .on('zoom', function (event) {
            // svg.attr('transform', event.transform);  // 直接设置svg的transform属性会导致缩放后的坐标系不正确（导致的问题是：用鼠标平移（pan）矩形的时候，矩形会抖动，导致矩形实际平移的距离小于鼠标平移的距离），因此需要在svg内部再添加一个g元素
            // d3.select('g.matrix').attr('transform', event.transform);
            d3.select('g.matrix').attr('transform', `translate(${offsetX + event.transform.x}, ${offsetY + event.transform.y}) scale(${event.transform.k})`); // Update the matrix transform based on the zoom event
            updateCellTextVisibility(event.transform.k); // Update cell text visibility based on the current scale
            // transformStatue = event.transform;
        })

    const svg = d3.select(container.value)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .call(zoom)  // 注意，这里添加zoom的是svg元素，而不是g.matrix元素，所以当resetZoom时，需要对svg元素进行transform操作

    const matrix = svg.append('g').classed("matrix", true);  // Append a 'g' element for better transform management to avoid jittering
    let texts: any = null;

    const grids = generateGrid(rows, cols);

    const cells = matrix.selectAll('rect')
        .data(grids)
        .enter().append('rect').classed('grid-cell', true)
        .attr('x', d => d.col * cellWidth)
        .attr('y', d => d.row * cellHeight)
        .attr('id', d => `grid-${d.row}-${d.col}`)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', '#f9f7ff')
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
            tableStore.grid_cell_click({ row: d.row, col: d.col })
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
                    .enter().append('text').classed('grid-text', true)
                    .attr('x', d => d.col * cellWidth + cellWidth / 2)
                    .attr('y', d => d.row * cellHeight + cellHeight / 2)
                    .attr('id', d => `text-${d.row}-${d.col}`)
                    .attr('dy', '.30em')
                    .attr('font-size', 15 / scale)
                    .attr('fill', '#000')
                    .attr('text-anchor', 'middle')
                    .text(d => `(${d.row}, ${d.col})`)
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


};

/*
import { debounce } from 'lodash';

const debouncedResize = debounce(() => {
    // requestAnimationFrame(() => {
    //     drawGrid();
    // });
    if (tableStore.input_tbl.tbl.length === 0) {
        d3.select(container.value).selectAll('svg').remove();
    } else {
        drawGrid(tableStore.input_tbl.tbl.length, tableStore.input_tbl.tbl[0].length);
    }
}, 100); // 调整延迟时间，单位为毫秒

const resizeObserver = new ResizeObserver(() => {
    debouncedResize();
});
*/

onMounted(() => {
    if (container.value) {
        // resizeObserver.observe(container.value);
    }
});

// watch(() => tableStore.currentCase, (newVal) => {
//     drawGrid(tableStore.caseData.input_tbl.length, tableStore.caseData.input_tbl[0].length);
// });

watch(() => tableStore.input_tbl.tbl, (newVal) => {
    if (newVal.length === 0) {
        d3.select(container.value).selectAll('svg').remove();
    } else {
        drawGrid(newVal.length, newVal[0].length);
    }
});

</script>

<style lang="less">
.grid-container {
    width: 100%;
    height: 100%;

    /*
    rect.cell-grid {
        fill: #f9f7ff;
        stroke: grey;
        stroke-width: 1px;
        transition: fill 0.2s, stroke 0.2s; //添加过渡效果，使颜色变化更平滑 
    }

    rect.cell-grid:hover {
        fill: #ece9e6;
        stroke: black;
        stroke-width: 2px;
        // outline: 2px solid black; // 确保边框宽度能够高亮显示
    }
    */
}
</style>