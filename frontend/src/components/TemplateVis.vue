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
            <a-dropdown :trigger="['contextmenu']" :open="contextMenuVisible" @openChange="contextMenuVisibleChange">
                <template #overlay>
                    <a-menu @click="closeContextMenu" :items="menuList">
                    </a-menu>
                </template>
                <div class="tree-container" ref="treeContainer"></div>
            </a-dropdown>
        </div>
    </div>

</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
// import * as d3 from 'd3';
// import { flextree, FlextreeNode } from 'd3-flextree';
import { TreeChart } from '@/tree/drawTree';
import { message } from 'ant-design-vue';
import { useTableStore } from "@/store/table";
const tableStore = useTableStore();

/*
interface TreeNode {
    name: string;
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

/*
function replaceEvenSpaces(str: string) {
    // 使用正则表达式匹配连续的空格
    return str.replace(/ {2,}/g, (match) => {
        // 获取连续空格的数量
        const length = match.length;

        // 计算一半的空格数量
        const halfLength = length / 2;

        // 返回一半数量的空格
        return ' '.repeat(halfLength);
    });
}

let fnList: string[] = [];

function replacer(key: string, value: any) {
    if (typeof value === 'function') {
        fnList.push(replaceEvenSpaces(value.toString()));
        return "$TableTidier$" // value.toString(); // 将函数转化为字符串
    }
    return value;
}

function removeQuotesFromKeys(jsonString: string) {
    // 正则表达式匹配 JSON 对象中的键（包括可能的空白字符和引号）
    const regex = /"(\w+)":/g;

    // 使用正则表达式替换引号
    return jsonString.replace(regex, '$1:');
}

function replaceTableTidierKeyWords(jsonString: string) {
    const regex = /"TableTidier\.(\w+)"/g;

    return jsonString.replace(regex, 'ValueType.$1');
}

function stringifySpec() {
    let strSpec = JSON.stringify(tableStore.spec.visTree.children, replacer, 2);
    fnList.forEach((fn) => {
        strSpec = strSpec.replace(`"$TableTidier$"`, fn);
    })
    tableStore.editor.mappingSpec.code = tableStore.editor.mappingSpec.codePref + replaceTableTidierKeyWords(removeQuotesFromKeys(strSpec));
    // tableStore.editor.mappingSpec.instance?.setValue(tableStore.editor.mappingSpec.code);
    fnList = [];
    // tableStore.editor.mappingSpecinstance?.getAction('editor.action.formatDocument')?.run();
    // tableStore.editor.mappingSpec.instance?.trigger('editor', 'editor.action.formatDocument', null);
}*/

const closeContextMenu = (e: any) => {
    // console.log("closeContextMenu", e, e.key);
    const node = tableStore.spec.selectNode;
    switch (e.key) {
        case "0":
            // Select Area Logic
            break;
        case "1":
            // Add Constraints Logic
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
            tableStore.spec.selectAreaFlag = true;
            break;
        case "4":
            // Delete Template Logic
            // let rootNode = node.parent;
            // while (rootNode.parent) {
            //     rootNode = rootNode.parent;
            // }
            // // console.log(node, rootNode); //, JSON.stringify(rootNode)
            // console.log(rootNode.data.children);
            tableStore.deleteChildrenByPath(node.path);
            tableStore.stringifySpec();
            break;
    }
    tableStore.tree.contextMenuVisible = false;
}

const treeContainer = ref<HTMLDivElement | null>(null);

function drawTree2() {
    drawTree(tableStore.spec.visTree);
}

const drawTree = (data: any) => {
    const chartInstance = new TreeChart([2, 1], '.tree-container', data, tableStore, 1.0, 'h');
    chartInstance.render();
};


import { debounce } from 'lodash';

// import { TableTidierTemplate } from '@/grammar/grammar';

const debouncedResize = debounce(() => {
    drawTree(tableStore.spec.visTree);
}, 100); // 调整延迟时间，单位为毫秒

const resizeObserver = new ResizeObserver(() => {
    debouncedResize();
});


watch(() => tableStore.editor.mappingSpec.code, (newVal) => {
    const specs = tableStore.getSpec();
    if (specs === false) return;
    tableStore.spec.visTree["children"] = specs;
    drawTree(tableStore.spec.visTree);
});

onMounted(() => {
    if (treeContainer.value) {
        // resizeObserver.observe(treeContainer.value);
    }
    drawTree(tableStore.spec.visTree);
});



</script>

<style lang="less" scoped>
.tree-container {
    width: 100%;
    height: 100%;
}
</style>