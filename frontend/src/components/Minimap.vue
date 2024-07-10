<template>
    <div ref="container" class="grid-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';

interface Props {
    dimensions: [number, number];
}

const props = defineProps<Props>();
const container = ref<HTMLDivElement | null>(null);

const drawGrid = () => {
    if (!container.value) return;

    // Clear any existing SVG
    d3.select(container.value).selectAll('svg').remove();

    const [cols, rows] = props.dimensions;

    const containerWidth = container.value.clientWidth;
    const containerHeight = container.value.clientHeight;
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;


    const svg = d3.select(container.value)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    const cells = svg.selectAll('rect')
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
            console.log(`Clicked on cell: (${x}, ${y})`);
        });
};

import { debounce } from 'lodash';

const debouncedResize = debounce(() => {
    // requestAnimationFrame(() => {
    //     drawGrid();
    // });
    drawGrid();
}, 100); // 调整延迟时间，单位为毫秒

const resizeObserver = new ResizeObserver(() => {
    debouncedResize();
});

onMounted(() => {
    if (container.value) {
        resizeObserver.observe(container.value);
    }
});

watch(() => props.dimensions, drawGrid);
</script>

<style scoped>
.grid-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>