<template>
    <div class="view">
        <div class="view-title">
            <span>Template Visualization</span>
            <a-button size="small" style="float: right; margin-right: 20px" @click="drawTree2">
                <v-icon name="bi-arrow-clockwise" scale="0.9"></v-icon>
                <span>Reset</span>
            </a-button>
        </div>
        <div class="view-content">
            <div class="tree-container" ref="treeContainer"></div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';
import { flextree, FlextreeNode } from 'd3-flextree';
import {
    TreeChart
} from '@/tree/drawTree'

import { useTableStore, TblCell } from "@/store/table";
const tableStore = useTableStore();

interface TreeNode {
    name: string;
    children?: TreeNode[];
    width?: number;
    height?: number;
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

const treeContainer = ref<HTMLDivElement | null>(null);

function drawTree2() {
    drawTree(tableStore.specification);
}

const drawTree = (data: any) => {

    /*
    let data2 = [
        {
            "nodeId": 0,
            "parentNodeId": null,
            "parentType": "Array",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#7EAA55",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Array"],
            "nodeFillColor": ["#7EAA55"],
            "dataTypeFeature": null,
            "dataTypeText": null,
            "dataTypeTextTruncated": null
        },
        {
            "nodeId": 1,
            "parentNodeId": 0,
            "parentType": "Array",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#83b5ed",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Dictionary"],
            "nodeFillColor": ["#83b5ed"],
            "dataTypeFeature": "typeAggr",
            "dataTypeText": null,
            "dataTypeTextTruncated": null
        },
        {
            "nodeId": 2,
            "parentNodeId": 1,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#83b5ed",
                    "rectHeight": 12.5,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": -6.25,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Dictionary"],
            "nodeFillColor": ["#83b5ed"],
            "dataTypeFeature": "keyOptional",
            "dataTypeText": "zju",
            "dataTypeTextTruncated": "zju"
        },
        {
            "nodeId": 3,
            "parentNodeId": 1,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#EEB189",
                    "rectHeight": 12.5,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "top"
                },
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 12.5,
                    "rectWidth": 100,
                    "starty": 12.5,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "bottom"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Number", "String"],
            "nodeFillColor": ["#EEB189", "#D07C94"],
            "dataTypeFeature": "valueMultipleType",
            "dataTypeText": "age",
            "dataTypeTextTruncated": "age"
        },
        {
            "nodeId": 4,
            "parentNodeId": 1,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#83b5ed",
                    "rectHeight": 12.5,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": -6.25,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Dictionary"],
            "nodeFillColor": ["#83b5ed"],
            "dataTypeFeature": "keyOptional",
            "dataTypeText": "pku",
            "dataTypeTextTruncated": "pku"
        },
        {
            "nodeId": 5,
            "parentNodeId": 1,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#83b5ed",
                    "rectHeight": 12.5,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": -6.25,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Dictionary"],
            "nodeFillColor": ["#83b5ed"],
            "dataTypeFeature": "keyOptional",
            "dataTypeText": "school",
            "dataTypeTextTruncated": "school"
        },
        {
            "nodeId": 6,
            "parentNodeId": 1,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["String"],
            "nodeFillColor": ["#D07C94"],
            "dataTypeFeature": null,
            "dataTypeText": "name",
            "dataTypeTextTruncated": "name"
        },
        {
            "nodeId": 7,
            "parentNodeId": 2,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["String"],
            "nodeFillColor": ["#D07C94"],
            "dataTypeFeature": null,
            "dataTypeText": "name",
            "dataTypeTextTruncated": "name"
        },
        {
            "nodeId": 8,
            "parentNodeId": 2,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#E7D6D6",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Null"],
            "nodeFillColor": ["#E7D6D6"],
            "dataTypeFeature": null,
            "dataTypeText": "established",
            "dataTypeTextTruncated": "established"
        },
        {
            "nodeId": 9,
            "parentNodeId": 4,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["String"],
            "nodeFillColor": ["#D07C94"],
            "dataTypeFeature": null,
            "dataTypeText": "name",
            "dataTypeTextTruncated": "name"
        },
        {
            "nodeId": 10,
            "parentNodeId": 4,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#EEB189",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Number"],
            "nodeFillColor": ["#EEB189"],
            "dataTypeFeature": null,
            "dataTypeText": "established",
            "dataTypeTextTruncated": "established"
        },
        {
            "nodeId": 11,
            "parentNodeId": 5,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["String"],
            "nodeFillColor": ["#D07C94"],
            "dataTypeFeature": null,
            "dataTypeText": "name",
            "dataTypeTextTruncated": "name"
        },
        {
            "nodeId": 12,
            "parentNodeId": 5,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#EEB189",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": ["Number"],
            "nodeFillColor": ["#EEB189"],
            "dataTypeFeature": null,
            "dataTypeText": "established",
            "dataTypeTextTruncated": "established"
        }
    ]

    let data3 = [
        {
            "nodeId": 0,
            "parentNodeId": null,
            "parentType": "Array",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#83b5ed",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": [
                "Dictionary"
            ],
            "nodeFillColor": [
                "#83b5ed"
            ],
            "dataTypeFeature": null,
            "dataTypeText": null,
            "dataTypeTextTruncated": null
        },
        {
            "nodeId": 1,
            "parentNodeId": 0,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": [
                "String"
            ],
            "nodeFillColor": [
                "#D07C94"
            ],
            "dataTypeFeature": null,
            "dataTypeText": "name",
            "dataTypeTextTruncated": "name"
        },
        {
            "nodeId": 2,
            "parentNodeId": 0,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#83b5ed",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": [
                "Dictionary"
            ],
            "nodeFillColor": [
                "#83b5ed"
            ],
            "dataTypeFeature": null,
            "dataTypeText": "zju",
            "dataTypeTextTruncated": "zju"
        },
        {
            "nodeId": 3,
            "parentNodeId": 2,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#D07C94",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": [
                "String"
            ],
            "nodeFillColor": [
                "#D07C94"
            ],
            "dataTypeFeature": null,
            "dataTypeText": "name",
            "dataTypeTextTruncated": "name"
        },
        {
            "nodeId": 4,
            "parentNodeId": 2,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#E7D6D6",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": [
                "Null"
            ],
            "nodeFillColor": [
                "#E7D6D6"
            ],
            "dataTypeFeature": null,
            "dataTypeText": "established",
            "dataTypeTextTruncated": "established"
        },
        {
            "nodeId": 5,
            "parentNodeId": 2,
            "parentType": "Dictionary",
            "nodeWidth": 100,
            "nodeHeight": 25,
            "nodeCircleRadius": 12.5,
            "nodeBorderRadius": 5,
            "nodeMultipleRectInfo": [
                {
                    "rectColor": "#EEB189",
                    "rectHeight": 25,
                    "rectWidth": 100,
                    "starty": 0,
                    "startx": 0,
                    "radius": 5,
                    "rounded": "all"
                }
            ],
            "shiftFromEndCenter": 0,
            "shiftFromStartCenter": {},
            "connectorLineColor": "black",
            "connectorLineWidth": 2,
            "dataType": [
                "Number"
            ],
            "nodeFillColor": [
                "#EEB189"
            ],
            "dataTypeFeature": null,
            "dataTypeText": "a2",
            "dataTypeTextTruncated": "a2"
        }
    ]
    */

    const chartInstance = new TreeChart([2, 1], '.tree-container', data, 1.0, 'h');
    chartInstance.render();


    /*
    if (!treeContainer.value) return;

    // Clear any existing SVG
    d3.select(treeContainer.value).selectAll('svg').remove();

    const containerWidth = treeContainer.value.clientWidth;
    const containerHeight = treeContainer.value.clientHeight;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const marginLeft = 40;


    const treeLayout = d3.tree<TreeNode>().nodeSize([20, 10]); //.size([20, 10]);
    // 如果数据本身是树状结构，使用树状图布局计算节点位置
    const root = d3.hierarchy(data);

    const diagonal = d3.linkHorizontal().x(d => d[1]).y(d => d[0]);
    console.log(root, diagonal);

    const nodes = root.descendants().reverse();
    const links = root.links();

    // Create the SVG container, a layer for the links and a layer for the nodes.
    const svg = d3.select(treeContainer.value)
        .append('svg')
        .attr("width", containerWidth)
        .attr("height", containerHeight)
    // .attr("viewBox", [-marginLeft, -marginTop, width, dx])
    // .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
        .attr("cursor", "pointer")
    // .attr("pointer-events", "all");

    console.log(nodes, links);

    treeLayout(root); // 这个时候，root有坐标了
    console.log(root);

    const update = (event: MouseEvent, source: d3.HierarchyNode<TreeNode>) => {
        const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        treeLayout(root);



        let left = root;
        let right = root;
        // 获得左右两侧的节点
        root.eachBefore(node => {
            if (node.x! < left.x!) left = node;
            if (node.x! > right.x!) right = node;
        });

        console.log(left, right);

        if (left.x === undefined || right.x === undefined) return;

        const height = right.x - left.x + marginTop + marginBottom;

        const transition = svg.transition()
            .duration(duration)
            .attr("height", height)
            // .attr("viewBox", [-marginLeft, left.x - marginTop, containerWidth, height] as any)
            // .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

        // Update the nodes…
        const node = gNode.selectAll("g")
            .data(nodes, d => d.id);

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
                d.children = d.children ? null : d._children;
                update(event, d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            .attr("fill", d => d._children ? "#555" : "#999")
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(d => d.data.name)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white")
            .attr("paint-order", "stroke");

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = gLink.selectAll("path")
            .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
                const o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    // 如果数据是数组结构，使用层次图布局计算节点位置
    // const data2 = [
    //     { nodeId: '1', parentNodeId: null, name: 'Root' },
    //     { nodeId: '2', parentNodeId: '1', name: 'Child 1' },
    //     { nodeId: '3', parentNodeId: '1', name: 'Child 2' },
    //     { nodeId: '4', parentNodeId: '2', name: 'Grandchild 1' },
    //     { nodeId: '5', parentNodeId: '2', name: 'Grandchild 2' }
    // ];
    // const root = d3.stratify()
    //     .id((d: any) => d.nodeId)
    //     .parentId((d: any) => d.parentNodeId)(data2);

    // root.x = 0;
    // root.y = 0;

    // const nodes = treeLayout(root);

    // console.log(nodes);


    // const treeLayout = flextree({
    //     nodeSize: (node: any) => [node.data.height || 40, node.data.width || 100],
    //     spacing: (a: any, b: any) => (a.parent === b.parent ? 10 : 40)
    // });

    // const root = d3.hierarchy(data);
    // const nodes = treeLayout.hierarchy(root);

    // console.log(root, nodes);



    // console.log("drawTree");
    // const posi = getNodePosi(data, 1000, 1000, 100, 25);
    // console.log(posi);
    // const chart = new TreeChart([2, 1], '.tree-container', curatedData,);
    // chart.render();
*/

    /*
    if (!treeContainer.value) return;

    // Clear any existing SVG
    d3.select(treeContainer.value).selectAll('svg').remove();

    const containerWidth = treeContainer.value.clientWidth;
    const containerHeight = treeContainer.value.clientHeight;

    const svg = d3.select(treeContainer.value)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', 'translate(40,0)');


    const treeLayout = flextree({
        nodeSize: (node: any) => [node.data.height || 40, node.data.width || 100],
        spacing: (a: any, b: any) => (a.parent === b.parent ? 10 : 40),
    });

    const root = d3.hierarchy(data);
    const nodes = treeLayout.hierarchy(root);

    console.log(root, nodes);

    
    // Links
    svg.selectAll('.link')
        .data(nodes.descendants().slice(1))
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', d => {
            return `M${ d.y },${ d.x }
                C${ d.y },${ (d.x + d.parent.x) / 2 }
                    ${ d.parent.y },${ (d.x + d.parent.x) / 2 }
                    ${ d.parent.y },${ d.parent.x } `;
        });

    // Nodes
    const node = svg.selectAll('.node')
        .data(nodes.descendants())
        .enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${ d.y }, ${ d.x })`);

    node.append('circle')
        .attr('r', 4);

    node.append('text')
        .attr('dy', 3)
        .attr('x', d => d.children ? -8 : 8)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.data.name);

    
    treeLayout.hierarchy(root);

    console.log(root, treeLayout);

    const svgWidth = root.leaves().reduce((max, leaf) => Math.max(max, leaf.x!), 0) * 2 + 40;
    const svgHeight = root.descendants().reduce((max, node) => Math.max(max, node.y!), 0) + 40;

    const svg = d3.select(treeContainer.value)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${ svgWidth / 2}, 20)`);

    // const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
    //     .x(d => d.y)
    //     .y(d => d.x);

    // svg.selectAll('.link')
    //     .data(root.links())
    //     .enter().append('path')
    //     .attr('class', 'link')
    //     .attr('d', linkGenerator);

    // const node = svg.selectAll('.node')
    //     .data(root.descendants())
    //     .enter().append('g')
    //     .attr('class', 'node')
    //     .attr('transform', d => `translate(${ d.y }, ${ d.x })`);

    // node.append('circle')
    //     .attr('r', 4.5);

    // node.append('text')
    //     .attr('dy', 3)
    //     .attr('x', d => d.children ? -8 : 8)
    //     .style('text-anchor', d => d.children ? 'end' : 'start')
    //     .text(d => d.data.name);
    */
};

import { debounce } from 'lodash';

const debouncedResize = debounce(() => {

}, 100); // 调整延迟时间，单位为毫秒

const resizeObserver = new ResizeObserver(() => {
    debouncedResize();
});

watch(() => tableStore.editor.mapping_spec.code, (newVal) => {
    const specWithDefaults = tableStore.getSpec();
    if (specWithDefaults === false) return;
    tableStore.specification["children"] = [specWithDefaults];
    drawTree(tableStore.specification);
});

onMounted(() => {
    if (treeContainer.value) {
        resizeObserver.observe(treeContainer.value);
    }
    const specWithDefaults = tableStore.getSpec();
    if (specWithDefaults != false) {
        tableStore.specification["children"] = [specWithDefaults];
        drawTree(tableStore.specification);
    }

});



</script>

<style lang="less" scoped>
.tree-container {
    width: 100%;
    height: 100%;
}
</style>