<template>
    <div class="view">
        <div class="view-title">
            <span>Template Visualization</span>
            <a-button id="draw_tree" size="small" style="float: right; margin-right: 20px" @click="drawTree2">
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
import { transformTable } from '@/grammar/handleSpec';
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
}

const drawTree = (data: any) => {
    const treeInstance = new TreeChart([2, 1], '.tree-container', data, tableStore, 1.0, 'h');
    treeInstance.render();
    tableStore.tree.visInst = treeInstance;
};

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
</style>