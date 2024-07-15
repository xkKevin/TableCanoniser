<template>

    <a-modal v-model:open="configFlag" title="Set GPT Role" centered @ok="setConfig" okText="Confirm">
        <a-textarea v-model:value="configRole" :rows="8"></a-textarea>
    </a-modal>

    <a-popover v-model:open="visible" trigger="click" placement="topRight" @openChange="visibleChange">
        <template #title>
            <div>
                <span>Chat With GPT</span>
                <span style="right: 12px; position: absolute;">
                    <!-- <a-button type="default" @click="clearHistory">
                        <img :src="require('@/assets/broom.png')" style="height: 100%;">
                    </a-button> -->
                    <a @click="openConfig">Role</a>
                    <a @click="clearHistory">Clear</a>
                    <a @click="hide">Close</a>
                </span>
            </div>
        </template>

        <template #content>
            <div class="chatbot-view">
                <!--
                <div class="chatbot-content">
                    <div v-for="(item, index) in chatList" :key="index">
                        <div v-if="item.role === 'user'">
                            <div class="user">
                                <img :src="require('@/assets/user.png')" style="height: 15px;">
                                <p>{{ item.content }}</p>
                            </div>
                        </div>
                        <div v-else>
                            <div class="gpt">
                                <img :src="require('@/assets/gpt.png')" style="height: 15px;">
                                <p>{{ item.content }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            -->
                <div class="chatbot-content">
                    <ul>
                        <li v-for="(message, index) in chatList" :key="index">
                            <div v-if="message.role === 'user'" class="chat-user">
                                <div class="chat-img"><img src="@/assets/user.png"></div>
                                <!-- <div class="chat-time"><cite>{{ message.role }}<i>{{ message.time }}</i></cite></div> -->
                                <p> {{ message.content }}</p>
                            </div>
                            <div v-else class="chat-gpt">
                                <div class="chat-img"><img src="@/assets/gpt.png"></div>
                                <!-- <div class="chat-time"><cite>{{ message.role }}<i>{{ message.time }}</i></cite></div> -->
                                <p>{{ message.content }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <a-input-group compact>
                    <a-textarea v-model:value="chatText" placeholder="input your prompt" :rows="1"
                        style="width: calc(100% - 40px)"></a-textarea>
                    <a-button type="primary" @click="sendMessage">
                        <img :src="require('@/assets/paper-plane.png')" style="height: 100%;">
                    </a-button>
                </a-input-group>
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
const uploadShow = ref(true);
const configFlag = ref(false);
const configRole = ref('You are a data transformation assistant. Your task is to generate a transformation script that converts messy, non-standard tabular data into a standardized relational table. The script should be clear, efficient, and easy to understand. Follow best practices for data manipulation and ensure the output matches the specified format.');

let visible = ref(true);
let chatClick = true;
let chatText = ref('');

let chatContentDiv: HTMLDivElement | null = null

let chatList = ref([
    {
        role: 'user',
        content: 'hello, how are you?',
        time: '09:00'
    },
    {
        role: 'gpt',
        content: 'I am fine, thank you. And you?',
        time: '09:01'
    },
    {
        role: 'user',
        content: 'I am also fine',
        time: '09:02'
    },
    {
        role: 'gpt',
        content: 'Great. What about you?',
        time: '09:03'
    },
    {
        role: 'user',
        content: 'messy_data = [["Unsupervised DA", "", "SOTA (image-based)", ""], ["baseline", "93.78", "DeepFace", "91.4"], ["PCA", "93.56", "FaceNet", "95.12"], ["CORAL", "94.5", "CenterFace", "94.9"], ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]]',
        time: '09:04'
    }, {
        role: 'gpt',
        content: 'The output DataFrame should contain the following columns: Method, Accuracy, Category.',
        time: '09:05'
    },
    {
        role: 'user',
        content: 'hello, how are you?',
        time: '09:00'
    },
    {
        role: 'gpt',
        content: 'I am fine, thank you. And you?',
        time: '09:01'
    },
    {
        role: 'user',
        content: 'I am also fine',
        time: '09:02'
    },
    {
        role: 'gpt',
        content: 'Great. What about you?',
        time: '09:03'
    },
    {
        role: 'user',
        content: 'messy_data = [["Unsupervised DA", "", "SOTA (image-based)", ""], ["baseline", "93.78", "DeepFace", "91.4"], ["PCA", "93.56", "FaceNet", "95.12"], ["CORAL", "94.5", "CenterFace", "94.9"], ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]]',
        time: '09:04'
    }, {
        role: 'gpt',
        content: 'The output DataFrame should contain the following columns: Method, Accuracy, Category.',
        time: '09:05'
    }
]);

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

function sendMessage() {
    console.log(chatText.value);
    chatList.value.push({
        role: 'user',
        content: chatText.value,
        time: '09:00'
    });
    chatText.value = '';

    // scroll to bottom
    setTimeout(() => {
        if (chatContentDiv) {
            chatContentDiv.scrollTop = chatContentDiv.scrollHeight;
        }
    }, 100);
}

function clearHistory() {
    chatList.value = [];
    // if (chatContentDiv) {
    //     // chatContentDiv.scrollTop = 0;
    //     chatContentDiv.style.overflowY = 'hidden';
    //     setTimeout(() => {
    //         chatContentDiv!.style.overflowY = 'auto'; // 恢复滚动条样式
    //     }, 0);
    // }
}

function openConfig() {
    configFlag.value = true;
}

function hideConfig() {
    configFlag.value = false;
}

function setConfig() {
    console.log(configRole.value);
}

onMounted(() => {
    uploadanimated();
    chatContentDiv = document.querySelector('.chatbot-content');
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
@img-width: 18px;
@img-margin: 6px;

.ant-popover-content {
    position: relative;
    right: 35px;
    // pointer-events: auto; // Set the popover content to receive events

    // * {
    //     pointer-events: none; // Set all children elements to not receive events
    // }

    .ant-popover-title {
        a {
            margin-left: 6px;
        }
    }

    .chatbot-view {
        width: 450px;
        height: 500px;
        overflow: auto;
        padding: 8px;

        .chatbot-content {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            height: calc(100% - 32px);

            img {
                height: @img-width;
                margin-top: 5px;
            }

            p {
                word-break: break-all;
                white-space: pre-wrap; // keep new line
                margin-bottom: 5px;
                padding: 4px;
            }

            .chat-gpt {
                display: flex;
                flex-direction: row;

                img {
                    margin-right: @img-margin;
                }

                p {
                    margin-right: @img-margin + @img-width;
                }
            }

            .chat-user {
                display: flex;
                flex-direction: row-reverse;

                img {
                    margin-left: @img-margin;
                }

                p {
                    margin-left: @img-margin + @img-width;
                    background-color: #f0f0f0;
                    padding: 4px 8px;
                    border-radius: 5px;
                    box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
                }
            }


        }
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
