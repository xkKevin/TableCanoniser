<template>
    <div :class="['meun-switch animated flex-row', uploadflag ? 'active rubberBand off' : 'leave jello']"
        @mouseleave="uploadleave" @mouseenter="uploadenter" v-if="uploadShow" @click.stop="logout">
        <a-tooltip title="Chat With GPT" color="cyan" placement="left" :mouseEnterDelay="1.2" :mouseLeaveDelay="0.05">
            <img :src="require('@/assets/robot-assistant.png')" id="chatbot" />
        </a-tooltip>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const uploadflag = ref(true);
const uploadShow = ref(false);
let chatClick = false;

const uploadenter = () => {
    uploadflag.value = true;
};

const uploadleave = () => {
    if (!chatClick) uploadflag.value = false;
};

const uploadanimated = () => {
    setTimeout(() => {
        uploadShow.value = true;
        setTimeout(() => {
            uploadleave();
        }, 2000);
    }, 1000);
};

const logout = () => {
    console.log('logout');
    chatClick = true;
    uploadflag.value = true;
};

onMounted(() => {
    uploadanimated();
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.id !== 'chatbot') {
            chatClick = false;
            uploadleave();
        }
    });
});

</script>


<style scoped>
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
    bottom: 80px;
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
