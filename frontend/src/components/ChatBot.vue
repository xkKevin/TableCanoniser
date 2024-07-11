<template>


    <a-popover v-model:open="visible" trigger="click" placement="topRight" @openChange="visibleChange">
        <template #title>
            <div>
                <span>Chat With GPT</span>
                <a @click="hide" style="right: 12px; position: absolute;">Close</a>
            </div>
        </template>

        <template #content>
            <div class="chatbot-view">
                <a-input-search v-model:value="chatText" placeholder="input search text">
                    <template #enterButton>
                        <img :src="require('@/assets/paper-plane.png')" style="height: 100%;">
                    </template>
                </a-input-search>
            </div>
        </template>

        <div :class="['meun-switch animated flex-row', uploadflag ? 'active rubberBand off' : 'leave jello']"
            @mouseleave="uploadleave" @mouseenter="uploadenter" v-if="uploadShow">
            <a-tooltip title="Chat With GPT" color="cyan" placement="left" :mouseEnterDelay="1.2"
                :mouseLeaveDelay="0.05">
                <img :src="require('@/assets/robot-assistant.png')" id="chatbot" />
            </a-tooltip>
        </div>
    </a-popover>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const uploadflag = ref(true);
const uploadShow = ref(false);
let visible = ref(false);
let chatClick = false;
let chatText = ref('');

const uploadenter = () => {
    uploadflag.value = true;
};

const uploadleave = () => {
    if (!chatClick) {
        uploadflag.value = false;
    };
};

const hide = () => {
    // click "close" button will not trigger visibleChange event
    visible.value = false;
    uploadflag.value = false;
    chatClick = false;
};

const visibleChange = (visible: boolean) => {
    uploadflag.value = visible;
    chatClick = visible;
}

const uploadanimated = () => {
    setTimeout(() => {
        uploadShow.value = true;
        setTimeout(() => {
            uploadleave();
        }, 2000);
    }, 1000);
};

// const logout = () => {
//     chatClick = true;
//     uploadflag.value = true;
// };

onMounted(() => {
    uploadanimated();
    // document.addEventListener('click', (event) => {
    //     const target = event.target as HTMLElement;
    //     console.log(target, target.id, target.className);
    //     if (target.id !== 'chatbot' && target.className != 'ant-popover-content') {
    //         chatClick = false;
    //         uploadleave();
    //     }
    // });
});

</script>


<style lang="less">
/* .chatbot-view {
    width: 300px;
    height: 400px;
    overflow: auto;
    padding: 10px;
    right: 50px;
    background-color: #f0f0f0;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)
} */

.ant-popover-content {
    position: relative;
    right: 35px;
    // pointer-events: auto; // Set the popover content to receive events

    // * {
    //     pointer-events: none; // Set all children elements to not receive events
    // }

    .chatbot-view {
        width: 400px;
        height: 400px;
        overflow: auto;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    button {
        padding: 4px 8px;
    }
}

.off {
    -webkit-animation: 0.8s seconddiv;
    animation: 0.8s seconddiv;
    background: transparent;
}

/* @keyframes seconddiv {
    0% {
        transform: scale(1.4, 1.4);
    }

    10% {
        transform: scale(1, 1);
    }

    25% {
        transform: scale(1.2, 1.2);
    }

    50% {
        transform: scale(1, 1);
    }

    70% {
        transform: scale(1.2, 1.2);
    }

    100% {
        transform: scale(1, 1);
    }
} */

@keyframes seconddiv {
    0% {
        transform: scale(1, 1);
    }

    10% {
        transform: scale(1.1, 1.1);
    }

    25% {
        transform: scale(1.2, 1.2);
    }

    50% {
        transform: scale(1, 1);
    }

    75% {
        transform: scale(1.2, 1.2);
    }

    100% {
        transform: scale(1.1, 1.1);
    }
}

.meun-switch {
    position: fixed;
    bottom: 60px;
    right: 0px;
    z-index: 2001;
    cursor: pointer;
    width: 90px;
    /* height: 150px; */
    padding: 5px;
    transition: all 0.2s;

    &.leave {
        right: -50px;
        transition: right 0.8s 0.2s;
        /* 设置离开的动画延迟时间为 1s，持续时间为 0.2s */
    }

    &.active {
        right: 0;
    }

    &:hover {
        transform: scale(1.1);
    }

    img {
        width: 90px;
        /* height: 90px; */
    }
}
</style>
