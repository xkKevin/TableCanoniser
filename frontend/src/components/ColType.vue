<template>
    <div class="icons-container">
        <div v-for="colInfo in sortedColInfos" :key="colInfo.index" :style="{ width: colInfo.width + 'px' }"
            class="icon-column">
            <img v-for="icon in colInfo.sortedIcons" :key="icon.type" :src="icons[icon.type]" :alt="`${icon.type} icon`"
                class="icon" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import stringIcon from '@/assets/text.png';
import numberIcon from '@/assets/number.png';
import nullIcon from '@/assets/empty.png';

import { useTableStore } from "@/store/table";
// const { colInfos } = defineProps<{ colInfos: ColInfo[] }>();
const { tblType } = defineProps<{ tblType: "input_tbl" | "output_tbl" }>();  // | "transformScript"

const tableStore = useTableStore();

// Example data
// const colInfos = [
//     { index: 0, string: [0, 1], number: [2], null: [], width: 250 },
//     { index: 1, string: [], number: [0, 1, 2], null: [1], width: 150 },
//     { index: 2, string: [0], number: [], null: [1, 2], width: 200 },
//     { index: 3, string: [0], number: [1], null: [2], width: 300 },
// ];

// Define icons map
const icons = {
    string: stringIcon,
    number: numberIcon,
    null: nullIcon
};

type IconType = keyof typeof icons;

// Compute sorted column info  tableStore[tblType].colInfo
const sortedColInfos = computed(() => {
    return tableStore[tblType].colInfo.map(colInfo => {
        const iconCounts = [
            { type: 'string' as IconType, count: colInfo.string.length },
            { type: 'number' as IconType, count: colInfo.number.length },
            { type: 'null' as IconType, count: colInfo.null.length }
        ]
            .filter(icon => icon.count > 0) // Remove types with zero count
            .sort((a, b) => b.count - a.count); // Sort by count in descending order

        return {
            ...colInfo,
            sortedIcons: iconCounts
        };
    });
});
</script>

<style scoped>
.icons-container {
    display: flex;
    padding-left: 50px;
    overflow: hidden;
    /* Horizontal layout for columns */
}

.icon-column {
    display: flex;
    align-items: center;
    /* Center icons vertically within the column */
}

.icon {
    width: 15px;
    /* Set appropriate icon size */
    height: 15px;
    margin: 0 2px;
    /* Horizontal spacing between icons */
}
</style>