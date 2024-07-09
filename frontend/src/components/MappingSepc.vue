<template>
    <div ref="editorWrapper" class="editor-container"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "MappingSepc"
});
</script>

<script setup lang="ts">
import * as monaco from "monaco-editor";
import { onMounted, ref, watch } from "vue";
import { useTableStore } from "@/store/table";

const tableStore = useTableStore();

const editorDefaultOptions = {
    value: '',
    language: 'javascript',
    theme: 'vs',
    fontSize: 14,
    glyphMargin: false,
    automaticLayout: true,
    autoIndent: 'advanced',
    readOnly: false,
    lineNumbersMinChars: 1,
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
        value: tableStore.mapping_spec,
    };
    editor = monaco.editor.create(editorWrapper.value!, editorOptions as monaco.editor.IEditorConstructionOptions);  // ! means that editorWrapper.value is not null
};

watch(() => tableStore.currentCase, (newVal) => {
    // mappingSpec = (await tableStore.loadCaseSpec(newVal)).spec;
    // mappingSpec = tableStore.mapping_spec;
    // initEditor();
    editor?.setValue(tableStore.mapping_spec);  // update editor content; ? means if editor is not null then call setValue, else do nothing
});

onMounted(() => {
    // mappingSpec = (await tableStore.loadCaseSpec(tableStore.currentCase)).spec;
    initEditor();
});


</script>


<style scoped lang="less">
.editor-container {
    width: 100%;
    height: 100%;
    /* You can adjust the height as needed */
}
</style>