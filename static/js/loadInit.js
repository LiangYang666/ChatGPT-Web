window.onload = function () {     //页面加载完成后，自动将光标定位至输入框
    document.getElementById('textarea').focus();
}

let newchat = $("#newchat");

let selectedChatId = generateUUID();
let config = {
    "userId": null, "password": null, "apiKey": null, "chat_context_number": 5,
    "model_config": {"model": "gpt-3.5-turbo", "temperature": 0.9, "max_tokens": 2000}
};
let model_config = {"model": "gpt-3.5-turbo", "temperature": 0.9, "max_tokens": 2000};
let chats = [generateChatInfo(selectedChatId)];
let messages_of_chats = {[selectedChatId]: []};
if (localStorage.getItem("chats") !== null) {
    chats = JSON.parse(localStorage.getItem("chats"));
} else {
    localStorage.setItem("chats", JSON.stringify(chats));
}
if (localStorage.getItem("config") !== null) {
    config = JSON.parse(localStorage.getItem("config"));
} else {
    localStorage.setItem("config", JSON.stringify(config));
}
if (localStorage.getItem("messages_of_chats") !== null) {
    messages_of_chats = JSON.parse(localStorage.getItem("messages_of_chats"));
} else {
    localStorage.setItem("messages_of_chats", JSON.stringify(messages_of_chats));
}
selectedChatId = getSelectedId();


loadChats();

loadHistory();

let returnMessageAjax = null;

let last_time = 0;

/**
 * 自动滚动标志,当流式接收消息时自动将滚动条滚动至底部，但当用户翻阅聊天记录时，不应自动滚动
 * @type {boolean}
 */
let autoScrollFlag = true;
