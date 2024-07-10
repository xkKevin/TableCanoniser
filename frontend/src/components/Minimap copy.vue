<template>
    <div ref="container" class="grid-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';
import { useTableStore } from "@/store/table";

const tableStore = useTableStore();

const container = ref<HTMLDivElement | null>(null);

const drawGrid = (rows: number, cols: number) => {
    if (!container.value) return;

    // Clear any existing SVG
    d3.select(container.value).selectAll('svg').remove();

    const containerWidth = container.value.clientWidth;
    const containerHeight = container.value.clientHeight;
    const cellWidth = 45 // containerWidth / cols;
    const cellHeight = 20 // containerHeight / rows;

    const svg = d3.select(container.value)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .call(d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 3])  // set the zoom scale range
            .on('zoom', function (event) {
                // svg.attr('transform', event.transform);  // 直接设置svg的transform属性会导致缩放后的坐标系不正确（导致的问题是：用鼠标平移（pan）矩形的时候，矩形会抖动，导致矩形实际平移的距离小于鼠标平移的距离），因此需要在svg内部再添加一个g元素
                // d3.select('g.matrix').attr('transform', event.transform);
                d3.select('g.matrix').attr('transform', `translate(${offsetX + event.transform.x}, ${offsetY + event.transform.y}) scale(${event.transform.k})`); // Update the matrix transform based on the zoom event
                updateCellTextVisibility(event.transform.k); // Update cell text visibility based on the current scale
            }))

    const matrix = svg.append('g').classed("matrix", true);  // Append a 'g' element for better transform management to avoid jittering

    const cells = matrix.selectAll('rect')
        .data(d3.range(rows * cols))
        .enter().append('rect')
        .attr('x', d => (d % cols) * cellWidth)
        .attr('y', d => Math.floor(d / cols) * cellHeight)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('fill', 'grey')
        .attr('stroke', 'black')
        .on('mouseover', function () {
            d3.select(this)
                .attr('stroke', 'red')
                .attr('fill', 'blue');
        })
        .on('mouseout', function () {
            d3.select(this)
                .attr('stroke', 'black')
                .attr('fill', 'grey');
        })
        .on('click', function (event, d) {
            const x = d % cols;
            const y = Math.floor(d / cols);
            console.log(`Clicked on cell: (${y}, ${x})`);
        });

    // Calculate the offset to center the matrix in the SVG container
    const offsetX = Math.max((containerWidth - matrix.node()!.getBBox().width) / 2, 0);
    const offsetY = Math.max((containerHeight - matrix.node()!.getBBox().height) / 2, 0);
    matrix.attr('transform', `translate(${offsetX}, ${offsetY})`); // Center the matrix

    const texts = matrix.selectAll('text')
        .data(d3.range(rows * cols))
        .enter().append('text').classed('cell-text', true)
        .attr('x', d => (d % cols) * cellWidth + cellWidth / 2)
        .attr('y', d => Math.floor(d / cols) * cellHeight + cellHeight / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text(d => `(${Math.floor(d / cols)}, ${d % cols})`)
        .style('display', 'none') // Initially hide text
        .style('pointer-events', 'none'); // Ensure text does not capture mouse events, in order to allow clicking on the cells

    const updateCellTextVisibility = (scale: number) => {
        const scaledCellWidth = cellWidth * scale;
        const scaledCellHeight = cellHeight * scale;
        const cellArea = scaledCellWidth * scaledCellHeight;

        svg.selectAll('text.cell-text')
            .style('display', cellArea >= 900 ? 'block' : 'none');
    };

    updateCellTextVisibility(1); // Initial update for default scale 1


};

import { debounce } from 'lodash';

const debouncedResize = debounce(() => {
    // requestAnimationFrame(() => {
    //     drawGrid();
    // });
    if (!tableStore.caseData.input_tbl) return;
    drawGrid(tableStore.caseData.input_tbl.length, tableStore.caseData.input_tbl[0].length);
}, 100); // 调整延迟时间，单位为毫秒

const resizeObserver = new ResizeObserver(() => {
    debouncedResize();
});

onMounted(() => {
    if (container.value) {
        resizeObserver.observe(container.value);
    }
});

watch(() => tableStore.currentCase, (newVal) => {
    drawGrid(tableStore.caseData.input_tbl.length, tableStore.caseData.input_tbl[0].length);
});
</script>

<style scoped>
.grid-container {
    width: 100%;
    height: 100%;
}
</style>