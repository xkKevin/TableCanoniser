import { TableStore } from '@/store/table';
import * as d3 from 'd3';


export let miniZoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

export const drawMinimap = (rows: number, cols: number, container: SVGSVGElement | null, tableStore: TableStore, percentWidth: number = 0.2) => {
    if (!container) return;

    const svg = d3.select(container);
    // Clear any existing SVG
    svg.select('g.left').remove();

    if (rows === 0 || cols === 0) return;

    const containerWidth = container.clientWidth * percentWidth;
    const containerHeight = container.clientHeight;
    let cellWidth = Math.max(5, Math.min(45, Math.floor(containerWidth / cols)));
    let cellHeight = Math.max(5, Math.min(20, Math.floor(containerHeight / rows)));
    cellWidth = cellHeight = Math.min(cellWidth, cellHeight)

    miniZoom = d3.zoom<SVGSVGElement, unknown>()
        // .scaleExtent([0.5, 3.5])  // set the zoom scale range
        .on('zoom', function (event) {
            // svg.attr('transform', event.transform);  // 直接设置svg的transform属性会导致缩放后的坐标系不正确（导致的问题是：用鼠标平移（pan）矩形的时候，矩形会抖动，导致矩形实际平移的距离小于鼠标平移的距离），因此需要在svg内部再添加一个g元素
            // d3.select('g.matrix').attr('transform', event.transform);
            // console.log('minimap', event.transform, event);
            matrix.attr('transform', `translate(${tableStore.tree.offset.left.x + event.transform.x}, ${tableStore.tree.offset.left.y + event.transform.y}) scale(${event.transform.k})`); // Update the matrix transform based on the zoom event
            tableStore.updateCurve();
            // updateCellTextVisibility(event.transform.k); // Update cell text visibility based on the current scale
            // transformStatue = event.transform;
            // window.d3 = d3;
        })


    const g = svg.append('g').classed("left", true)
        .call(miniZoom as any).on('dblclick.zoom', null)  // 禁用双击缩放

    const matrix = g.append('g').classed("matrix", true);  // Append a 'g' element for better transform management to avoid jittering
    // let texts: any = null;

    // 监听鼠标进入事件，在鼠标悬浮时启用 zoom 行为
    // matrix.on('mouseover', () => {
    //     svg.call(zoom as any);
    //     // const transform = d3.zoomTransform(matrix.node() as SVGSVGElement);
    //     // console.log(transform);
    // });

    // // 监听鼠标离开事件，在鼠标离开时禁用 zoom 行为
    // matrix.on('mouseout', () => {
    //     svg.on('.zoom', null);  // 移除 zoom 事件监听器
    //     // const transform = d3.zoomTransform(matrix.node() as SVGSVGElement);
    //     // console.log(transform);
    // });

    const grids = tableStore.generateGrid(rows, cols);

    const cells = matrix.append('g').selectAll('rect')
        .data(grids)
        .enter().append('rect').classed('grid-cell', true)
        .attr('x', d => d.col * cellWidth)
        .attr('y', d => d.row * cellHeight)
        .attr('id', d => `grid-${d.row}-${d.col}`)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        // .on('mouseover', function () {
        //     d3.select(this).raise() // Bring the cell to the front 
        //         // .attr('fill', '#ece9e6')
        //         // .attr('stroke', '#4b8aff')
        //         .attr('stroke-width', 2);
        //     if (texts) {
        //         texts.raise();
        //     }
        // })
        // .on('mouseout', function () {
        //     d3.select(this)
        //         // .attr('fill', '#f9f7ff')
        //         // .attr('stroke', '#cccccc')
        //         .attr('stroke-width', 1);
        // })
        .on('click', function (event, d) {
            d3.selectAll('rect.grid-cell').attr('class', 'grid-cell');
            d3.select(this).raise().classed('selection', true);
            tableStore.grid_cell_click({ row: d.row, col: d.col })
            tableStore.input_tbl.instance.deselectCell();
            tableStore.output_tbl.instance.deselectCell();
        })
        .append('title').text(d => `Position: (${d.row}, ${d.col})`);

    // Calculate the offset to center the matrix in the SVG container
    tableStore.tree.offset.left.x = Math.max((containerWidth - matrix.node()!.getBBox().width) / 2, 0);
    tableStore.tree.offset.left.y = Math.max((containerHeight - matrix.node()!.getBBox().height) / 2, 0);
    matrix.attr('transform', `translate(${tableStore.tree.offset.left.x}, ${tableStore.tree.offset.left.y})`); // Center the matrix

    tableStore.tree.minimapInstHighlight = matrix.append('g').classed('tbl-minimap-highlight', true);
    tableStore.tree.minimapVisInfo = {
        width: cellWidth,
        height: cellHeight
    }

    /*
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
    */
};