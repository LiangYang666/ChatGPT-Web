$("#newchat").click(function () {
    console.log("请输入会话名称");
    let name = prompt("请输入会话名称");
    if (name === null) {
        return;
    }
    $.ajax({
        url: "/newChat",
        type: "Get",
        headers: createHeaders(),
        dataType: "json",
        data: {
            "name": name,
            "time": get_time_str(new Date()),
            "chat_id": generateUUID()
        },
        success: function (data) {
            console.log(data);
            if (data.code === 200 || data.code === 201) {
                let html = '<div class="chat" id=' + data.data.id + ' data-name=' + data.data.name + ' data-selected=' + data.data.selected + ' data-messages_total=' + data.data.messages_total + '>' + data.data.name + '</div>';
                // newchat.remove();
                $(".chat-list").find(".chat").eq(1).after(html);
                $("#" + selectedChatId).removeClass("selected");
                selectedChatId = data.data.id;
                $("#" + selectedChatId).addClass("selected");
                // $("#edit-chat-btn").html("删除对话");
                $('.content').empty();
                let chat_info = generateChatInfo(selectedChatId);
                chat_info["name"] = name;
                chats.push(chat_info);
                if (chat_info["mode"] === "normal") {
                    $("#chmod-btn").text("当前为普通对话");
                } else {
                    $("#chmod-btn").text("当前为连续对话");
                }
                messages_of_chats[selectedChatId] = [];
                localStorage.setItem("chats", JSON.stringify(chats));
                loadHistory();
                renderChatHeadInfo();
                editCurrentChat();
            }
        }
    })
})


$(".chat-list").on('click', '.chat', function () {
    let id = this.id;
    let click = this;
    console.log(id);
    $.ajax({
        url: "/selectChat",
        type: "Get",
        headers: createHeaders(),
        dataType: "json",
        data: {     // get 方法时 data放置于路径 ?id=
            "id": id
        },
        success: function (data) {
            console.log(data);
            if (data.code === 200 || data.code === 201) {
                let chat_info = getSelectedChatInfo();
                chat_info["selected"] = false;
                $("#" + selectedChatId).removeClass("selected");
                selectedChatId = id;
                $(click).addClass("selected");
                $('.content').empty();
                // if ($("#"+selectedChatId).data('name')!=='默认对话'){
                //     $("#edit-chat-btn").html("删除对话");
                // } else {
                //     $("#edit-chat-btn").html("删除聊天记录");
                // }
                chat_info = getSelectedChatInfo();
                chat_info["selected"] = true;
                if (chat_info["mode"] === "normal") {
                    $("#chmod-btn").text("当前为普通对话");
                } else {
                    $("#chmod-btn").text("当前为连续对话");
                }
                localStorage.setItem("chats", JSON.stringify(chats));
                if (messages_of_chats[selectedChatId] === undefined) {
                    messages_of_chats[selectedChatId] = [];
                }
                loadHistory();
                renderChatHeadInfo();
            }
        }
    })
})

// 当用户自己滚动时，停止自动滚动
$(".content").on('scroll', function () {
    // 当用户滚动到底部时
    if ($(".content").scrollTop() + $(".content").innerHeight() + 30 - $(".content")[0].scrollHeight >= 0) {
        autoScrollFlag = true;
    } else {
        autoScrollFlag = false;
    }
});

$("#send-btn").click(function () {
    console.log("click")
    var text = $("#textarea").val();
    console.log("text");
    console.log(text);
    if (text == "") {
        alert("请输入内容");
        return;
    }
    let html = ''
    let send_time = new Date();
    let send_time_str = get_time_str(send_time);
    let display_time = false;
    if (send_time.getTime() - last_time > 1000 * 60 * 5) {
        // 以'%Y年%#m月%#d日 %H:%M'格式显示时间
        html += '<div class="item item-center"><span>' + get_time_str(send_time) + '</span></div>';
        last_time = send_time.getTime();
        display_time = true;

    }
    html += '<div class="item item-right"><div class="bubble bubble-right markdown">' + marked.marked(text) + '</div><div class="avatar"><img src="./static/people.jpg" /></div></div>';
    $(".content").append(html);
    $("#textarea").val("");
    $(".content").scrollTop($(".content")[0].scrollHeight);
    if (text.startsWith('new:')) send_time_str = get_time_str(send_time)
    let chat_item = $('<div class="item item-left"><div class="avatar"><img src="./static/chatgpt.png" /></div><div class="bubble bubble-left markdown">正在等待回复</div></div>')
    $(".content").append(chat_item);
    $(".content").scrollTop($(".content")[0].scrollHeight);
    autoScrollFlag = true;  // 新的发送请求后，开启自动滚动
    let get_times = 0;
    let chat_info = getSelectedChatInfo();

    if (chat_info["context_have"] === undefined || chat_info["context_have"] <= 0) {
        chat_info["context_have"] = 0;
    }
    chat_info["context_have"] += 1;

    // 判断chat_info里是否有assistant_prompt字段，如果有，再判断是否包含“<<>>"字符，有的话向前向后拼接text
    if ("assistant_prompt" in chat_info && chat_info["assistant_prompt"].indexOf("<<") !== -1 && chat_info["assistant_prompt"].indexOf(">>") !== -1) {
        let start_index = chat_info["assistant_prompt"].indexOf("<<");
        let end_index = chat_info["assistant_prompt"].indexOf(">>");
        text = chat_info["assistant_prompt"].substring(0, start_index) + text + chat_info["assistant_prompt"].substring(end_index + 2);
    }
    messages_of_chats[selectedChatId].push({
        "role": "user",
        "content": text,
        "send_time": send_time_str,
        "display_time": display_time
    });
    renderChatHeadInfo();
    let start_index = 0;
    let get_total = 0;
    if (chat_info["context_size"] === undefined) {
        chat_info["context_size"] = 5;
    }
    let context_size = chat_info["context_size"];

    for (let i = messages_of_chats[selectedChatId].length - 1; i >= 1; i--) {
        let role = messages_of_chats[selectedChatId][i].role;
        if (role === "user" || role === "assistant") {
            start_index = i;
            get_total += 1;
            if (get_total === context_size || get_total === chat_info["context_have"]) {
                break;      // 获得上下文起始位置 start_index
            }
        }
    }

    let message_contexts = [];
    if ("mode" in chat_info && chat_info["mode"] !== "normal") {
        if ("memory_summarize" in chat_info) {
            message_contexts = [{
                "role": "system",
                "content": "历史聊天记录前情提要总结：" + chat_info.memory_summarize
            }];
        }
        for (let i = start_index; i < messages_of_chats[selectedChatId].length; i++) {
            let role = messages_of_chats[selectedChatId][i].role;
            if (role === "user" || role === "assistant") {
                message_contexts.push(messages_of_chats[selectedChatId][i]);
            }
        }
    } else {
        message_contexts = [messages_of_chats[selectedChatId][messages_of_chats[selectedChatId].length - 1]];
    }

    let request_data = {
        "messages": message_contexts,
        "max_tokens": config.model_config.max_tokens || 2000,
        "model": config.model_config.model || "gpt-3.5-turbo",
        "temperature": config.model_config.temperature || 0.9,
        "stream": true,
        "continues_chat": true,
        "chat_id": selectedChatId,
        "save_message": true,
    };
    console.log("[Request]");
    console.log(request_data);
    let response_text = "";
    let headers = createHeaders();
    headers["Content-Type"] = "application/json";
    let index = 0;
    let codeBacktickNum = 0;
    returnMessageAjax = $.ajax({
        url: "/returnMessage",
        headers: headers,
        data: JSON.stringify(request_data),
        type: "Post",
        dataType: "text",
        xhrFields: {
            onprogress: function (e) {
                let response = e.currentTarget.response;
                if (response.slice(index).includes("`")) {
                    if (response.slice(index).includes("```")) {
                        codeBacktickNum += 1;
                        index = response.length;
                    }
                    console.log("codeBacktickNum: " + codeBacktickNum);
                } else {
                    index = response.length;
                }
                if (codeBacktickNum % 2 === 1) {
                    response += "\n```"
                }
                response_text = response;
                // console.log(response);
                if (response.includes("url_redirect")) {
                    let response_json = JSON.parse(response.trim());
                    let url_redirect = response_json["url_redirect"];
                    // 判断user_id非空
                    if (response_json.hasOwnProperty("user_id") && response_json["user_id"] !== "") {
                        config.userId = response_json["user_id"];
                        localStorage.setItem("config", JSON.stringify(config));
                    }
                    window.location.href = url_redirect;

                } else {
                    get_times += 1;
                    if (get_times === 2) {
                        $("#stop-btn").show();
                    }
                    let div = document.createElement('div');
                    div.innerHTML = marked.marked(response);
                    MathJax.Hub.Typeset(div);
                    chat_item.find(".bubble").empty();
                    chat_item.find(".bubble").append(div);
                    if (autoScrollFlag) {
                        $(".content").scrollTop($(".content")[0].scrollHeight);
                    }
                }
            },
            onload: function (e) {
                $("#stop-btn").hide();
            }
        },
        timeout: 1000 * 60 * 2,
        complete: function (XMLHttpRequest, status, e) {
            if (status === 'timeout') {
                alert("请求超时");
            }
            $("#stop-btn").hide();
            let btn = $("<span class=\"code-copy-btn\" onclick='codeCopy(this)'>复制代码</span>");
            btn.prependTo(chat_item.find(".bubble").find("pre"));

            messages_of_chats[selectedChatId].push({
                "role": "assistant",
                "content": response_text,
                "send_time": get_time_str(new Date()),
                "display_time": false
            });
            localStorage.setItem("messages_of_chats", JSON.stringify(messages_of_chats));
            // getSummarize();
            chat_info["context_have"] += 1;
            renderChatHeadInfo();
            editCurrentChat();  // 保存当前对话的context_have
        }
    });
});

$(document).on("click", "#resend-btn", function () {
    // 渲染到输入框
    let text = $(this).attr("data-clipboard-text");
    $("#textarea").val(text);
    // 模拟点击事件
    $("#send-btn").click();
    // 光标回归
    $("#textarea").focus();
});

$("#stop-btn").click(function () {
    // 停止returnMessage请求
    if (returnMessageAjax != null) {

        returnMessageAjax.abort();
        returnMessageAjax = null;
    }
    $("#stop-btn").hide();
});
$("#textarea").keydown(function (e) {
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        $("#send-btn").click();
    }
});

$('#edit-chat-btn').click(function () {
    toggle_chat_setting_dialog();
});

$('#del-chat-btn').click(function () {
    // 弹窗提醒是否确认删除
    if (confirm("确认删除所有聊天记录吗？非默认对话时将会直接删除该对话")) {
        $.get("/deleteHistory", function (data) {
            console.log(data);
        });
        let chat_info = getSelectedChatInfo();
        if (chat_info.name === "默认对话") {
            messages_of_chats[selectedChatId] = []
        } else {
            delete messages_of_chats[selectedChatId];
        }
        selectedChatId = chats[0].id;
        chats[0].selected = true;
        localStorage.setItem("messages_of_chats", JSON.stringify(messages_of_chats));
        localStorage.setItem("chats", JSON.stringify(chats));
        window.location.reload()
    }
});
$('#chmod-btn').click(function () {
    let chat_info = getSelectedChatInfo();
    if (!("mode" in chat_info)) {
        chat_info["mode"] = "continuous";
    }
    let display_content = "";
    if (chat_info["mode"] === "normal") {
        chat_info["mode"] = "continuous";
        display_content = "切换为连续对话";
        $("#chmod-btn").text("当前为连续对话");
    } else {
        chat_info["mode"] = "normal";
        display_content = "切换为普通对话";
        $("#chmod-btn").text("当前为普通对话");
    }

    var html = '<div class="item item-center"><span>' + display_content + '</span></div>'
    chat_info["context_have"] = 0;  // 切换模式后，上下文数量清零
    $(".content").append(html);
    $(".content").scrollTop($(".content")[0].scrollHeight);
    editCurrentChat();
});


$(document).on("click", "#copy-btn", function () {
    let clipboard = new ClipboardJS('#copy-btn');
    clipboard.on('success', function (e) {
        console.log(e);
        // 将显示字符更改为复制成功，一秒后改回
        $("#copy-btn").text("复制成功");
        setTimeout(function () {
            $("#copy-btn").text("复制");
        }, 2000);
    });
    clipboard.on('error', function (e) {
        console.log(e);
    });
    // 光标回归
    $("#textarea").focus();
});


$("#userDictFileDownload").click(function () {
    // 弹出选择框，选项有两个，覆盖或合并
    let all = confirm("是否需要下载所有用户记录？\n下载所有用户记录需要管理员密码，点击取消将下载个人记录");
    let adminPassword = undefined;
    if (all) {
        adminPassword = prompt("请输入管理员密码");
        if (adminPassword === null) {
            return;
        }
        console.log("下载所有用户记录");
    } else {
        console.log("下载个人记录");
    }
    let headers = createHeaders();
    headers["admin-password"] = adminPassword;
    headers["cache-control"] = "no-cache"
    $.ajax({
        url: "/downloadUserDictFile",
        type: "Get",
        headers: headers,
        xhrFields: {        // 必要，不能设置为blob，不然将数据乱码，因为blob是高级封装，不是原始数据
            responseType: "arraybuffer"
        },
        success: function (data, status, xhr) {
            // 判断若不是文件
            if (xhr.getResponseHeader('Content-Type') !== "application/octet-stream") {
                console.log("不是文件");
                alert(data);
                return;
            }

            let filename = "";
            let contentDisposition = xhr.getResponseHeader('Content-Disposition');
            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                let matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            let binaryData = [];
            binaryData.push(data);
            let url = window.URL.createObjectURL(new Blob(binaryData, {type: "application/octet-stream"})); // 将二进制流转换为 URL 对象
            let a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.setAttribute("download", filename);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            a = null;
        }
    });
});
$("#userDictFileUpload").change(function () {
    let file = this.files[0];
    let formData = new FormData();
    formData.append("file", file);
    let all = confirm("是否需要合并所有用户记录？\n合并所有用户记录需要管理员密码，点击取消将合并个人记录");
    let adminPassword = undefined;
    if (all) {
        adminPassword = prompt("请输入管理员密码");
        if (adminPassword === null) {
            return;
        }
        console.log("合并所有用户记录");
    } else {
        console.log("合并个人记录");
    }
    let headers = createHeaders();
    headers["admin-password"] = adminPassword;
    headers["cache-control"] = "no-cache"
    $.ajax({
        url: "/uploadUserDictFile",
        type: "POST",
        headers: headers,
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            alert(data);
            window.location.reload();
        }
    });
});
