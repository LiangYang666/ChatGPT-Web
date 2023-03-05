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
    """
    使用ChatGPT API获取回复
    :param message: 用户输入的消息
    :return: 回复的消息
    """
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
    """
    主页
    :return: 主页
    """
    global messages_history, chat_with_history
    messages_history.clear()
    chat_with_history = False
    return render_template('index.html')


@app.route('/returnMessage', methods=['GET', 'POST'])
def return_message():
    """
    获取用户发送的消息，调用get_chat_response()获取回复，返回回复，用于更新聊天框
    :return:
    """
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


@app.route('/changeModeNormal', methods=['GET'])
def change_mode_normal():
    global chat_with_history
    chat_with_history = True
    print("开启普通对话")
    return "0"


@app.route('/changeModeContinuous', methods=['GET'])
def change_mode_continuous():
    global chat_with_history
    chat_with_history = False
    print("开启连续对话")
    return "1"


@app.route('/resetHistory', methods=['GET'])
def reset_history():
    global messages_history
    messages_history.clear()
    print("清空上下文")
    return "2"


if __name__ == '__main__':

    if len(sys.argv) == 1:
        if len(openai.api_key) == 0:
            # 退出程序
            print("请在openai官网注册账号，获取api_key填写至程序内或命令行参数中")
            exit()
    else:
        openai.api_key = sys.argv[1]
        print("使用命令行参数作为api_key")

    app.run(host="0.0.0.0", port=5000, debug=True)
