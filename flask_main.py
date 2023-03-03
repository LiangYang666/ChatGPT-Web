from flask import Flask, render_template, request
import os
import openai
import sys

app = Flask(__name__)

os.environ['HTTP_PROXY'] = 'socks5://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'socks5://127.0.0.1:7890'
# openai.api_key = "OPENAI_API_KEY"
openai.api_key = ""


chat_with_history = False

messages_history = []


def get_chat_response(message):
    if not chat_with_history:
        messages_history.clear()
    messages_history.append({"role": "user", "content": message})
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages_history
    )
    if completion.get("error"):
        return "出错"
    data = completion.choices[0].message.content
    if chat_with_history:
        messages_history.append({"role": "assistant", "content": data})

    return data


# 进入主页
@app.route('/', methods=['GET', 'POST'])
def index():
    global messages_history, chat_with_history
    messages_history.clear()
    chat_with_history = False
    return render_template('index.html')


@app.route('/returnMessage', methods=['GET', 'POST'])
def returnMessage():
    send_message = request.values.get("send_message")
    print("用户发送的消息：" + send_message)
    content = get_chat_response(send_message)
    # 解析换行符和空格以及tab制表符到html
    content = content.replace("\n", "<br>")
    content = content.replace(" ", "&nbsp;")
    # content = content.replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")

    # 按顺序遍历将代码开始标识符```转换为<pre>，结束标识符```转换为</pre>，两个pre代码框内灰白色
    content_list = content.split("```")
    for i in range(len(content_list)):
        if i % 2 == 1:
            content_list[i] = "<pre>" + content_list[i] + "</pre>"
    content = "".join(content_list)

    return content


@app.route('/changeModeDl', methods=['GET'])
def changeModeDl():
    global chat_with_history
    chat_with_history = True
    print("开启串聊")
    return "0"


@app.route('/changeModeCl', methods=['GET'])
def changeModeCl():
    global chat_with_history
    chat_with_history = False
    print("开启单聊")
    return "1"


@app.route('/resetHistory', methods=['GET'])
def resetHistory():
    global messages_history
    messages_history.clear()
    print("清空上下文")
    return "2"


if __name__ == '__main__':
    if len(openai.api_key) == 0 and len(sys.argv) == 1:
        # 退出程序
        print("请在openai官网注册账号，获取并填写api_key")
        exit()
    else:
        openai.api_key = sys.argv[1]
    app.run(host="0.0.0.0", port=5000, debug=True)
