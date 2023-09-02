// toggle-chats-btn按下 设置left-container可见
$(document).ready(function () {
    $("#toggle-chats-btn").click(function () {
        $(".left-container").toggle();
    });
    $("#toggle-setting-btn").click(function () {
        toggle_settings_dialog();
    });

});

// 以下为函数定义
function toggle_settings_dialog() {
    if ($("#settings-dialog").css("display") === "none") {
        $("#api-key").val(config.apiKey);
        $("#user-id").val(config.userId);
        $("#password").val(config.password);

        let top = $(".content").offset().top;
        let left = $(".content").offset().left;
        let width = $(".content").width();
        let height = $(".content").height() + $(".input-area").height();
        $("#settings-dialog").css("top", top);
        $("#settings-dialog").css("left", left);
        $("#settings-dialog").css("width", width);
        $("#settings-dialog").css("height", height);
    } else {
        // 获取设置值
        console.log("关闭设置");
        let user_change_flag = false;
        if (config.userId !== $("#user-id").val() || config.password !== $("#password").val()) {
            user_change_flag = true;
        }
        config.apiKey = $("#api-key").val();
        config.userId = $("#user-id").val();
        config.password = $("#password").val();
        // 保存设置
        localStorage.setItem("config", JSON.stringify(config));
        if (user_change_flag) {
            // 刷新页面
            location.reload();
        }
    }
    $("#settings-dialog").toggle();
}

function toggle_chat_setting_dialog() {
    if ($("#chat-setting-dialog").css("display") === "none") {

        console.log(getSelectedChatInfo()["assistant_prompt"]);
        console.log(getSelectedChatInfo().name);
        $("#chat-assistant-prompt").val(getSelectedChatInfo()["assistant_prompt"]);
        $("#chat-context-size").val(getSelectedChatInfo()["context_size"] ? getSelectedChatInfo()["context_size"] : 5);
        $("#chat-sticky-number").val(getSelectedChatInfo()["sticky_number"] ? getSelectedChatInfo()["sticky_number"] : 0);
        $("#chat-name").val(getSelectedChatInfo().name);

    } else {
        // 获取设置值
        console.log("关闭设置");
        let chat_info = getSelectedChatInfo();
        let original_name = chat_info["name"];
        let original_chat_sticky_number = chat_info["sticky_number"];
        chat_info["assistant_prompt"] = $("#chat-assistant-prompt").val();
        chat_info["name"] = $("#chat-name").val();
        chat_info["context_size"] = parseInt($("#chat-context-size").val());
        chat_info["sticky_number"] = parseInt($("#chat-sticky-number").val());
        editCurrentChat();
        if (original_name !== chat_info["name"]) {
            // 刷新页面
            location.reload();
        }
        if (original_chat_sticky_number !== chat_info["sticky_number"]) {
            // 刷新页面
            location.reload();
        }
    }

    $("#chat-setting-dialog").toggle();
}

