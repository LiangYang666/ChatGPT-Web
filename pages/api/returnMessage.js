let project_info = "## ChatGPT 网页版    \n" +
    " Code From  " +
    "[ChatGPT-Web](https://github.com/LiangYang666/ChatGPT-Web)  \n" +
    "发送`帮助`可获取帮助  \n"
function check_not_null(value) {
    return value !== undefined && value !== null && value !== '' && value !== 'null';
}
let PASSWORD = "";
PASSWORD = process.env.PASSWORD;
let API_KEY = "";
API_KEY = process.env.OPENAI_API_KEY;

function get_response_stream_generate_from_ChatGPT_API(res, message_context, apikey, message_history,
                                                       model = "gpt-3.5-turbo", temperature = 0.9,
                                                       presence_penalty = 0, max_tokens = 2000) {
    if (!check_not_null(apikey)) {
        apikey = API_KEY;
    }
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apikey
    }
    let request_data = {
        "model": model,
        "messages": message_context,
        "temperature": temperature,
        "presence_penalty": presence_penalty,
        "max_tokens": max_tokens,
        "stream": true,
    }
    let url = "https://api.openai.com/v1/chat/completions";
    // 使用代理访问
    let request_options = {
        headers: headers,
        body: request_data,
        method: 'POST'
    }
    if (check_not_null(process.env.HTTPS_PROXY)) {
        // 适配本地部署时需要代理
        request_options.proxy = process.env.HTTPS_PROXY;
    }

    // 流式请求，并res.write()流式返回, 最后res.end()结束
    // let request = new NextRequest();
    // request.post(request_options)
    //     .on('error', (err) => {
    //         console.log(err)
    //         res.write(err.toString());
    //         res.end();
    //     }).on('data', (data) => {
    //     // console.log(data.toString());
    //     let lines = data.toString().split("\n");
    //     for (let i = 0; i < lines.length; i++) {
    //         let line_str = lines[i];
    //         if (line_str.startsWith("data:")) {
    //             if (line_str.startsWith("data: [DONE]")) {
    //                 console.log("***--***" + line_str);
    //                 res.end();
    //                 return;
    //             } else {
    //                 line_str = line_str.substring(5).trim();
    //                 // console.log(line_str);
    //                 let line_json = JSON.parse(line_str);
    //                 let content = line_json.choices[0].delta.content;
    //                 if (check_not_null(content)) {
    //                     res.write(content);
    //                     console.log(content);
    //                 }
    //             }
    //         }
    //     }
    // }).on('end', () => {
    //     console.log("end");
    // });
    fetch(url, request_options)
        .then(response => {
            const reader = response.body.getReader();
            const stream = new ReadableStream({
                start(controller) {
                    // The following function handles each data chunk
                    function push() {
                        // "done" is a Boolean and value a "Uint8Array"
                        reader.read().then(({done, value}) => {
                            // Is there no more data to read?
                            if (done) {
                                // Tell the browser that we have finished sending data
                                controller.close();
                                return;
                            }
                            // Get the data and send it to the browser via the controller
                            controller.enqueue(value);
                            push();
                        });
                    }

                    push();
                }
            });
            return new Response(stream, {headers: {'Content-Type': 'text/html'}});
        })
    .then(response => {
        return response.text();
    })
    .then(text => {
        console.log(text);
        res.end();
    })
    .catch(err => {
        console.error(err);
        res.end();
    });


}
// server.post('/returnMessage', (req, res) => {
//     let user_id = req.headers['user_id'];
//     let password = req.headers['password'];
//     let apikey = req.headers['apikey'];
//
//
//     // messages = request_data.get("messages")
//     // max_tokens = request_data.get("max_tokens")
//     // model = request_data.get("model")
//     // temperature = request_data.get("temperature")
//     // stream = request_data.get("stream")
//     // continuous_chat = request_data.get("continuous_chat")
//     // save_message = request_data.get("save_message")
//
//     let messages = req.body.messages;
//     let max_tokens = req.body.max_tokens;
//     let model = req.body.model;
//     let temperature = req.body.temperature;
//     let stream = req.body.stream;
//     let continuous_chat = req.body.continuous_chat;
//     let save_message = req.body.save_message;
//
//
//     if (!check_not_null(user_id)) {
//         res.send({"code": 201, "data": [{"role": "assistant", "content": "请先创建用户id"}]});
//         return;
//     }
//     if (!check_not_null(apikey) && check_not_null(PASSWORD)) {
//         if (password !== PASSWORD) {
//             res.send({"code": 201, "data": [{"role": "assistant", "content": "访问受限，需要访问密码"}]});
//             return;
//         }
//     }
//     for (let i = 0; i < messages.length; i++) {
//         for (let key in messages[i]) {
//             if (key !== "role" && key !== "content") {
//                 delete messages[i][key];
//             }
//         }
//     }
//
//     res.setHeader('Content-type', 'application/octet-stream');
//     get_response_stream_generate_from_ChatGPT_API(res, messages, apikey, [], model, temperature, 0, max_tokens);
// });

export default function handler(req, res) {
    let user_id = req.headers['user_id'];
    let password = req.headers['password'];
    let apikey = req.headers['apikey'];


    // messages = request_data.get("messages")
    // max_tokens = request_data.get("max_tokens")
    // model = request_data.get("model")
    // temperature = request_data.get("temperature")
    // stream = request_data.get("stream")
    // continuous_chat = request_data.get("continuous_chat")
    // save_message = request_data.get("save_message")

    let messages = req.body.messages;
    let max_tokens = req.body.max_tokens;
    let model = req.body.model;
    let temperature = req.body.temperature;
    let stream = req.body.stream;
    let continuous_chat = req.body.continuous_chat;
    let save_message = req.body.save_message;


    if (!check_not_null(user_id)) {
        res.send({"code": 201, "data": [{"role": "assistant", "content": "请先创建用户id"}]});
        return;
    }
    if (!check_not_null(apikey) && check_not_null(PASSWORD)) {
        if (password !== PASSWORD) {
            res.send({"code": 201, "data": [{"role": "assistant", "content": "访问受限，需要访问密码"}]});
            return;
        }
    }
    for (let i = 0; i < messages.length; i++) {
        for (let key in messages[i]) {
            if (key !== "role" && key !== "content") {
                delete messages[i][key];
            }
        }
    }

    res.setHeader('Content-type', 'application/octet-stream');
    get_response_stream_generate_from_ChatGPT_API(res, messages, apikey, [], model, temperature, 0, max_tokens);

}