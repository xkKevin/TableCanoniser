<template>
    <div ref="editorWrapper" class="editor-container"></div>
</template>

<!-- <script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "CodeView",
});
</script> -->

<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, ref, watch } from "vue";
import { useTableStore } from "@/store/table";


const { codeType } = defineProps<{ codeType: "mapping_spec" | "transform_script" }>();

// const props = defineProps(['codeType'])
// const codeType: "mapping_spec" | "transform_script" = props.codeType;

// const { codeType} = defineProps({
//   codeType: {
//     type: String as () => "mapping_spec" | "transform_script",
//     required: true,
//   },
// });

// const codeType = defineProps(['codeType']).codeType as "mapping_spec" | "transform_script"; // incorrect way to use defineProps

const tableStore = useTableStore();

const editorDefaultOptions = {
    value: '',
    language: codeType === "mapping_spec" ? 'javascript' : 'python',
    theme: 'vs',
    fontSize: 14,
    glyphMargin: false,
    automaticLayout: false, // Automatic layout may cause "ResizeObserver loop completed with undelivered notifications." warning. To avoid this, set automaticLayout to false
    autoIndent: 'advanced',
    readOnly: false,
    minimap: {
        enabled: false,
    },
    lineNumbersMinChars: 1,
    scrollBeyondLastLine: false, // Prevent scrolling beyond the last line
    padding: {
        bottom: 80, // Adjust the bottom padding to 80px
    },
};

const editorWrapper = ref<HTMLElement | null>(null);

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// let mappingSpec: string = ""

const initEditor = () => {
    if (editor) { // if editor is already initialized, dispose it first
        editor.dispose();
    }
    const editorOptions = {
        ...editorDefaultOptions,
        value: tableStore[codeType],
    };
    editor = monaco.editor.create(editorWrapper.value!, editorOptions as monaco.editor.IEditorConstructionOptions);  // ! means that editorWrapper.value is not null
};

watch(() => tableStore.currentCase, (newVal) => {
    // mappingSpec = (await tableStore.loadCaseSpec(newVal)).spec;
    // mappingSpec = tableStore.mapping_spec;
    // initEditor();
    editor?.setValue(tableStore[codeType]);  // update editor content; ? means if editor is not null then call setValue, else do nothing
});

import { debounce } from 'lodash';
const handleResize = debounce(() => {
    if (editor) {
        editor.layout();
    }
}, 100); // Adjust the delay time, in milliseconds

// 监听整个窗口的大小变化，通常会引发更多不必要的回调执行，可能会影响性能。
// window.addEventListener('resize', handleResize);

const resizeObserver = new ResizeObserver(() => {
    // console.log("Resize observed", entries);
    handleResize();
});

onMounted(() => {
    if (editorWrapper.value) {
        initEditor();
        // 可以精确地监听元素大小变化，避免了全局 resize 事件可能带来的性能问题，尤其是当页面上有多个需要监听大小变化的元素时。
        resizeObserver.observe(editorWrapper.value);
    }
});


</script>


<style scoped lang="less">
.editor-container {
    width: 100%;
    height: 100%;
    /* You can adjust the height as needed */
}
</style>