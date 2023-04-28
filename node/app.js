const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

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

app.use(express.static('../templates'));
app.use('/static', express.static('../static'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
// 定义index
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/loadHistory', (req, res) => {
    let user_id = req.headers['user_id'];
    let password = req.headers['password'];
    let apikey = req.headers['apikey'];
    let message_total = parseInt(req.query.message_total);
    if(user_id===undefined || user_id === null || user_id === '' || user_id==='null'){
        res.send({"code": 200, "data": [{"role": "assistant", "content": "请先创建用户id"}]});
    } else if (message_total === 0){
        let messages = [{"role": "assistant", "content": project_info}];
        res.send({"code": 201, data: messages});
    } else {
        res.send({"code": 201})
    }
});

app.get('/loadChats', (req, res) => {
    res.send({code: 201});
});


function get_response_stream_generate_from_ChatGPT_API(res, message_context, apikey, message_history,
                                                       model="gpt-3.5-turbo", temperature=0.9,
                                                       presence_penalty=0, max_tokens=2000) {
    if(!check_not_null(apikey)){
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
    // 使用代理访问
    let request_options = {
        url: "https://api.openai.com/v1/chat/completions",
        headers: headers,
        json: request_data,
    }
    if(check_not_null(process.env.HTTPS_PROXY)){
        // 适配本地部署时需要代理
        request_options.proxy = "1"+process.env.HTTPS_PROXY;
    }
    // 流式请求，并res.write()流式返回, 最后res.end()结束
    request.post(request_options)
        .on('error', (err) => {
            console.log(err)
            res.write(err.toString());
            res.end();
        }).on('data', (data) => {
        // console.log(data.toString());
            let lines = data.toString().split("\n");
            for (let i = 0; i < lines.length; i++) {
                let line_str = lines[i];
                if (line_str.startsWith("data:")) {
                    if (line_str.startsWith("data: [DONE]")) {
                        console.log("***--***" + line_str);
                        res.end();
                        return;
                    } else {
                        line_str = line_str.substring(5).trim();
                        // console.log(line_str);
                        let line_json = JSON.parse(line_str);
                        let content = line_json.choices[0].delta.content;
                        if (check_not_null(content)) {
                            res.write(content);
                            console.log(content);
                        }
                    }
                }
            }
        }).on('end', () => {
            console.log("end");
        });
}
app.post('/returnMessage', (req, res) => {
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


    if(!check_not_null(user_id)){
        res.send({"code": 201, "data": [{"role": "assistant", "content": "请先创建用户id"}]});
        return;
    }
    if (!check_not_null(apikey) && check_not_null(PASSWORD)){
        if (password !== PASSWORD){
            res.send({"code": 201, "data": [{"role": "assistant", "content": "访问受限，需要访问密码"}]});
            return;
        }
    }
    for(let i = 0; i < messages.length; i++){
        for(let key in messages[i]){
            if (key !== "role" && key !== "content"){
                delete messages[i][key];
            }
        }
    }

    res.setHeader('Content-type', 'application/octet-stream');
    get_response_stream_generate_from_ChatGPT_API(res, messages, apikey, [], model, temperature, 0, max_tokens);
});

app.get('/newChat', (req, res) => {
   let name = req.query.name;
   let time = req.query.time;
   let new_chat_id = req.query.chat_id;
   res.send({"code": 201, "data": {"name": name, "id": new_chat_id, "selected": true, "messages_total": 0}})
});

app.get('/selectChat', (req, res) => {
   res.send({"code": 201})
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

