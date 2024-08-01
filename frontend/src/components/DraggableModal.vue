<template>
    <a-modal ref="modalRef" v-model:open="open" :wrap-style="{ overflow: 'hidden' }" @cancel="handleCancel"
        @ok="handleOk" okText="Confirm" width="600px">
        <div>
            <div>
                <a-divider>startCell</a-divider>
                <a-row>
                    <a-col flex="100px">referenceAreaLayer</a-col>
                    <a-col flex="auto">
                        <a-radio-group v-model:value="formData.referenceAreaLayer">
                            <a-radio-button value="current">current</a-radio-button>
                            <a-radio-button value="parent">parent</a-radio-button>
                            <a-radio-button value="root">root</a-radio-button>
                            <a-radio-button value="areaLayerFn" title="areaLayerFn">Custom Func</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col flex="100px">referenceAreaPosition</a-col>
                    <a-col flex="auto">
                        <a-radio-group v-model:value="formData.referenceAreaPosi">
                            <a-radio-button value="topLeft">topLeft</a-radio-button>
                            <a-radio-button value="topRight">topRight</a-radio-button>
                            <a-radio-button value="bottomLeft">bottomLeft</a-radio-button>
                            <a-radio-button value="bottomRight">bottomRight</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col flex="100px">Start Position</a-col>
                    <a-col flex="auto">
                        <span>x (col):</span>
                        <a-radio-group v-model:value="formData.position.x">
                            <a-radio-button :value="areaConfig.startCell!.xOffset">{{ areaConfig.startCell!.xOffset
                                }}</a-radio-button>
                            <a-radio-button value="offsetFn" title="areaLayerFn">Custom Func</a-radio-button>
                        </a-radio-group>
                        <span>y (row):</span>
                        <a-radio-group v-model:value="formData.position.y">
                            <a-radio-button :value="areaConfig.startCell!.yOffset">{{ areaConfig.startCell!.yOffset
                                }}</a-radio-button>
                            <a-radio-button value="offsetFn" title="areaLayerFn">Custom Func</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
            </div>
            <div>
                <a-divider>size</a-divider>
                <a-row>
                    <a-col flex="5">
                        <span>width:</span>
                        <a-radio-group v-model:value="formData.size.width">
                            <a-radio-button :value="areaConfig.size!.width">{{ areaConfig.size!.width
                                }}</a-radio-button>
                            <a-radio-button :value="null" title="Don't specify">null</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col flex="5">
                        <span>height:</span>
                        <a-radio-group v-model:value="formData.size.height">
                            <a-radio-button :value="areaConfig.size!.height">{{ areaConfig.size!.height
                                }}</a-radio-button>
                            <a-radio-button :value="null" title="Don't specify">null</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
            </div>
            <div>
                <a-divider>traverse</a-divider>
                <a-row>
                    <a-col flex="100px">x direction:</a-col>
                    <a-col flex="auto">
                        <a-radio-group v-model:value="formData.traverse.xDirection">
                            <a-radio-button value="after">after</a-radio-button>
                            <a-radio-button value="above">above</a-radio-button>
                            <a-radio-button value="whole">whole</a-radio-button>
                            <a-radio-button :value="null" title="Don't specify">null</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col flex="100px">y direction:</a-col>
                    <a-col flex="auto">
                        <a-radio-group v-model:value="formData.traverse.yDirection">
                            <a-radio-button value="after">after</a-radio-button>
                            <a-radio-button value="above">above</a-radio-button>
                            <a-radio-button value="whole">whole</a-radio-button>
                            <a-radio-button :value="null" title="Don't specify">null</a-radio-button>
                        </a-radio-group>
                    </a-col>
                </a-row>
            </div>
        </div>

        <template #title>
            <div ref="modalTitleRef" style="width: 100%; cursor: move">Template Area</div>
        </template>
        <template #modalRender="{ originVNode }">
            <div :style="transformStyle">
                <component :is="originVNode" />
            </div>
        </template>
    </a-modal>
</template>
<script lang="ts" setup>
import { ref, computed, CSSProperties, watch, watchEffect } from 'vue';
import { useDraggable } from '@vueuse/core';
import { useTableStore, AreaForm } from '@/store/table';
// import { TableTidierTemplate } from '@/grammar/grammar';
const tableStore = useTableStore();
const areaConfig = tableStore.spec.areaConfig;



/* ---------- Area Form ---------- */
// const formData = ref<TableTidierTemplate>(areaConfig)
const formData = ref<AreaForm>(tableStore.spec.areaFormData)

tableStore.spec.areaFormData = formData.value

const handleOk = (values: any) => {
    handleCancel();
    tableStore.selectArea();
};
const resetForm = () => {
    formData.value = {
        referenceAreaLayer: areaConfig.startCell?.referenceAreaLayer,
        referenceAreaPosi: areaConfig.startCell?.referenceAreaPosi,
        position: {
            x: areaConfig.startCell?.xOffset,
            y: areaConfig.startCell?.yOffset
        },
        traverse: {
            xDirection: areaConfig.traverse?.xDirection,
            yDirection: areaConfig.traverse?.yDirection
        },
        size: {
            width: areaConfig.size?.width,
            height: areaConfig.size?.height
        }
    };
}


/* ---------- Draggable ---------- */
const open = computed(() => tableStore.spec.dragConfigOpen)
const modalTitleRef = ref<HTMLElement>();

const { x, y, isDragging } = useDraggable(modalTitleRef);
const handleCancel = () => {
    tableStore.spec.dragConfigOpen = false;
    tableStore.spec.selectAreaFlag = 0;
};
const startX = ref<number>(0);
const startY = ref<number>(0);
const startedDrag = ref(false);
const transformX = ref(0);
const transformY = ref(0);
const preTransformX = ref(0);
const preTransformY = ref(0);
const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
watch([x, y], () => {
    if (!startedDrag.value) {
        startX.value = x.value;
        startY.value = y.value;
        const bodyRect = document.body.getBoundingClientRect();
        const titleRect = modalTitleRef.value!.getBoundingClientRect();
        dragRect.value.right = bodyRect.width - titleRect.width;
        dragRect.value.bottom = bodyRect.height - titleRect.height;
        preTransformX.value = transformX.value;
        preTransformY.value = transformY.value;
    }
    startedDrag.value = true;
});
watch(isDragging, () => {
    if (!isDragging) {
        startedDrag.value = false;
    }
});

watchEffect(() => {
    if (startedDrag.value) {
        transformX.value =
            preTransformX.value +
            Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
            startX.value;
        transformY.value =
            preTransformY.value +
            Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
            startY.value;
    }
});
const transformStyle = computed<CSSProperties>(() => {
    return {
        transform: `translate(${transformX.value}px, ${transformY.value}px)`,
    };
});
</script>