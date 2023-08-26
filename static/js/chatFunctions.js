/**
 * 聊天对话相关的函数定义
 */


function getSelectedChatInfo() {
    for (let i = 0; i < chats.length; i++) {
        if (chats[i].id === selectedChatId) {
            return chats[i];
        }
    }
    return {};
}

function getSelectedId() {
    for (let i = 0; i < chats.length; i++) {
        if (chats[i].selected === true) {
            return chats[i].id;
        }
    }
}

/**
 * 生成一个新的对话，初始化对话信息
 * @param id
 * @returns {{mode: string, assistant_prompt: string, last_summarize_index: number, name: string, memory_summarize: string, id, selected: boolean}}
 */
function generateChatInfo(id) {
    return {
        "id": id,
        "name": "默认对话",
        "assistant_prompt": "",
        "selected": true,
        "mode": "continuous",
        "memory_summarize": "你是一个AI助手",
        "last_summarize_index": 0,
        "context_size": 5,  // 连续对话时上下文发送的总数上限
        "context_have": 0,  // 连续对话时已经记录的上下文数量，当用户切换对话模式时，将其置为0
    };
}


/**
 * 渲染当前对话框的信息，显示对话名称和聊天记录数量
 */
function renderChatHeadInfo() {
    if (chats.length === 0) {   // 未登陆或授权
        $(".head-chat-name").text("未授权");
        $(".head-chat-info").text("当前浏览器未绑定用户或访问密码错误");
    } else {
        $(".head-chat-name").text(getSelectedChatInfo().name);
        // 判断 messages_of_chats 中是否存在selectedChatId
        if (messages_of_chats[selectedChatId] === undefined) {
            messages_of_chats[selectedChatId] = [];
        }
        $(".head-chat-info").text("共有" + messages_of_chats[selectedChatId].length + "条消息");
    }
}


/**
 * 获取当前用户的对话列表
 */
function loadChats() {
    console.log("start load chats");
    let headers = createHeaders();
    $.ajax({
        url: "/loadChats",
        type: "Get",
        headers: headers,
        dataType: "json",
        success: function (data) {
            console.log(data);
            if (data.code === 200) {
                chats = data.data;
                localStorage.setItem("chats", JSON.stringify(chats));
            }
            let html = "";
            for (let i = 0; i < chats.length; i++) {
                console.log(chats[i].name)
                console.log(chats[i].selected)
                if (chats[i].selected === true) {
                    selectedChatId = chats[i].id;
                    if (chats[i]["mode"] === "normal") {
                        $("#chmod-btn").text("当前为普通对话");
                    } else {
                        $("#chmod-btn").text("当前为连续对话");
                    }
                }
                html += '<div class="chat" id=' + chats[i].id + ' data-name=' + chats[i].name + ' data-selected=' + chats[i].selected + ' data-messages_total=' + chats[i].messages_total + '>' + chats[i].name + '</div>';
            }
            if (chats.length === 0) {     // 表示是未绑定用户状态
                $("#edit-chat-btn").hide();
                $("#chmod-btn").hide();
                $(".chat-list").hide();
            } else {
                $(".chat-list").append(html);
                $(".chat-list").append(newchat);
                // 将选中的selectedChat添加selected属性
                $("#" + selectedChatId).addClass("selected");
                // if ($("#"+selectedChatId).data('name')!=='默认对话'){
                //     $("#edit-chat-btn").html("删除对话");
                // } else {
                //     $("#edit-chat-btn").html("删除聊天记录");
                // }
            }
            renderChatHeadInfo();
        }
    })
}


/**
 * 加载该对话的所有聊天记录，并存入 messages_of_chats
 */
function loadHistory() {
    console.log("start load history");
    if (messages_of_chats[selectedChatId] === undefined) {
        messages_of_chats[selectedChatId] = [];
    }
    $.ajax({
        url: "/loadHistory",
        type: "Get",
        headers: createHeaders(),
        dataType: "json",
        data: {
            "message_total": messages_of_chats[selectedChatId].length,
        },
        success: function (data) {
            console.log(data);
            let messages = [];
            if (data.code === 200) {   //200 时使用云端给的
                messages = data.data;
                messages_of_chats[selectedChatId] = messages;
            } else if (data.code === 201) {                // 201时使用浏览器本地的
                if (messages_of_chats[selectedChatId].length === 0) {
                    messages_of_chats[selectedChatId] = data.data;
                }
                console.log('loadHistory' + 201);
                messages = messages_of_chats[selectedChatId];
            }
            localStorage.setItem("messages_of_chats", JSON.stringify(messages_of_chats));
            var html = "";
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].role === "user") {

                    let content = messages[i].content;
                    let chat_info = getSelectedChatInfo();
                    let assistant_prompt = chat_info["assistant_prompt"];
                    if(assistant_prompt !== ""){
                        if(chat_info["assistant_prompt"].indexOf("<<") !== -1 && chat_info["assistant_prompt"].indexOf(">>") !== -1){
                            let start_index = chat_info["assistant_prompt"].indexOf("<<");
                            let end_index = chat_info["assistant_prompt"].indexOf(">>");
                            let pre = chat_info["assistant_prompt"].substring(0, start_index);
                            let post = chat_info["assistant_prompt"].substring(end_index + 2);
                            if (pre!==""){
                                // 去除前缀
                                if(content.startsWith(pre)){
                                    content = content.substring(pre.length);
                                }
                            }
                            if (post!==""){
                                // 去除后缀
                                if(content.endsWith(post)){
                                    content = content.substring(0,content.length-post.length);
                                }
                            }
                        }
                    }
                    html += '<div class="item item-right"><div class="bubble bubble-right">' + marked.marked(content) + '</div><div class="avatar"><img src="./static/people.jpg" /></div></div>';
                } else if (messages[i].role === "assistant") {
                    html += '<div class="item item-left"><div class="avatar"><img src="./static/chatgpt.png" /></div><div class="bubble bubble-left markdown">' + marked.marked(messages[i].content) + '</div></div>';
                } else if (messages[i].role === "web-system") {
                    html += '<div class="item item-center"><span>' + messages[i].content + '</span></div>';
                }
            }
            $(".content").append(html);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, $(".content").get()]);   // 异步转换 放入队列中
            $(".content").scrollTop($(".content")[0].scrollHeight);

            let preList = $(".markdown pre");
            preList.each(function () {
                let btn = $("<span class=\"code-copy-btn\" onclick='codeCopy(this)'>复制代码</span>");
                btn.prependTo($(this));
            });
            renderChatHeadInfo();
        }
    });
}

/**
 * 编辑对话 首先本地storage保存，再请求服务器保存
 */
function editCurrentChat() {
    localStorage.setItem("chats", JSON.stringify(chats));
    let chat_info = getSelectedChatInfo();
    // 保存设置
    let headers = createHeaders();
    headers["Content-Type"] = "application/json";
    $.ajax({
        url: "/editChat",
        headers: headers,
        data: JSON.stringify(chat_info),
        type: "Post",
        success: function (data) {
            console.log(data);
            if (data["code"] === 200) {
                console.log("修改成功");
            } else {
                console.log("修改失败");
            }
        }
    });
}

/**
 * 代码段复制函数
 * @param obj
 */
function codeCopy(obj) {

    let btn = $(obj);
    console.log("复制代码");
    btn.text("");
    let code = btn.parent().text();
    btn.text("复制代码");

    // 使用 Clipboard.js 复制文本
    let clipboard = new ClipboardJS(obj, {
        text: function () {
            return code;
        }
    });

    // 显示复制结果
    clipboard.on('success', function (e) {
        console.log("复制成功");
        btn.text("复制成功");
        setTimeout(function () {
            btn.text("复制代码");
        }, 1000);
    });
    clipboard.on('error', function (e) {
        console.log("复制失败");
        btn.text("复制失败");
        setTimeout(function () {
            btn.text("复制代码");
        }, 1000);
    });
}

/**
 * 创建发送请求时的通用header
 * @returns {{password: null, "api-key": null, "user-id": string}}
 */
function createHeaders() {
    return {
        "password": config.password,
        "api-key": config.apiKey,
        "user-id": encodeURIComponent(config.userId)
    };
}


function getSummarize() {
    // TODO 暂不使用
    let summarize = "";
    let chat_info = getSelectedChatInfo();
    if ("mode" in chat_info && chat_info["mode"] === "normal") {  // 如果非连续对话模式，不进行总结
        return;
    }
    if ("memory_summarize" in chat_info) {
        summarize = chat_info.memory_summarize;
    } else {
        chat_info["memory_summarize"] = "";
    }
    let message_contexts = [{"role": "system", "content": "历史聊天记录前情提要总结：" + summarize}];
    let start_index = 0;
    if ("last_summarize_index" in chat_info) {
        start_index = chat_info["last_summarize_index"] + 1;
    } else {
        chat_info["last_summarize_index"] = 0;
    }
    let end_index = messages_of_chats[selectedChatId].length - config.chat_context_number + 1;
    if (end_index - start_index > 5) {  // 过长截断
        start_index = end_index - 5;
    }
    if (start_index < 1) {
        start_index = 1;
    }
    for (let i = start_index; i < end_index; i++) {
        let role = messages_of_chats[selectedChatId][i].role;
        if (role === "user" || role === "assistant") {
            message_contexts.push(messages_of_chats[selectedChatId][i]);
        }
    }
    if (message_contexts.length === 1) {       // 如果没有需要总结的内容，直接返回
        return;
    }
    message_contexts.push({
        "role": "system",
        "content": "简要总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 50 字以内",
        "send_time": get_time_str(new Date()),
        "display_time": false
    })
    let request_data = {
        "messages": message_contexts,
        "max_tokens": 2000,
        "model": "gpt-3.5-turbo",
        "temperature": 0.9,
        "stream": true,
        "continues_chat": true,
        "chat_id": selectedChatId,
        "save_message": false,
    };
    console.log("[Memory Request]");
    console.log(request_data);
    let response_text = "";
    let headers = createHeaders();
    headers["Content-Type"] = "application/json";
    $.ajax({
        url: "/returnMessage",
        headers: headers,
        data: JSON.stringify(request_data),
        type: "Post",
        dataType: "text",
        xhrFields: {
            onprogress: function (e) {
                response_text = e.currentTarget.response;
                console.log(response_text);
            },
        },
        complete: function (XMLHttpRequest, status, e) {
            if (status === 'timeout') {
                alert("请求超时");
            }
            chat_info["memory_summarize"] = response_text;
            chat_info["last_summarize_index"] = end_index - 1;
            console.log("[Memory Response]");
            console.log(response_text);
        }
    })
    // 改为fetch获取
    // let decoder = new TextDecoder("utf-8");
    // fetch("/returnMessage", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "user-id": config.userId,
    //     "password": config.password,
    //     "api-key": config.apiKey
    //   },
    //   body: JSON.stringify(request_data),
    // }).then((response) => {
    //   if (!response.ok) {
    //     throw new Error("Network response was not ok");
    //   }
    //   const reader = response.body.getReader();
    //   let responseText = '';
    //   return readStream();
//
    //   function readStream() {
    //     return reader.read().then(({ done, value }) => {
    //       if (done) {
    //         console.log(responseText);
    //         chat_info["memory_summarize"] = responseText;
    //         chat_info["last_summarize_index"] = end_index -1;
    //         return;
    //       }
    //       responseText += decoder.decode(value);
    //       console.log(responseText);
    //       return readStream();
    //     });
    //   }
//
    // }).catch((error) => {
    //   alert("Fetch API request failed with error:", error);
    // })

}


