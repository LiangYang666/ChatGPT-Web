from flask import Flask, render_template, request, session
import os
import openai
import sys
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

os.environ['HTTP_PROXY'] = 'socks5://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'socks5://127.0.0.1:7890'
openai.api_key = os.getenv("OPENAI_API_KEY")        # 从环境变量中获取api_key,或直接设置api_key

chat_context_number = 5     # 连续对话模式下的上下文数量


def get_response_from_ChatGPT_API(message_context):
    try:
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message_context
        )
    except Exception as e:
        print(e)
        return "ChatGPT API error:\n"+str(e)
    data = completion.choices[0].message.content.strip()
    return data


def handle_messages_get_response(message, message_history, chat_with_history):

    message_history.append({"role": "user", "content": message})
    message_context = []
    if chat_with_history:
        if len(message_history) > chat_context_number:
            message_context = message_history[-chat_context_number:]
        else:
            message_context = message_history
    else:
        message_context.append(message_history[-1])

    response = get_response_from_ChatGPT_API(message_context)
    message_history.append({"role": "assistant", "content": response})
    # 换行打印messages_history
    print("message_history:")
    for i, message in enumerate(message_history):
        if message['role'] == 'user':
            print(f"\t{i}:\t{message['role']}:\t\t{message['content']}")
        else:
            print(f"\t{i}:\t{message['role']}:\t{message['content']}")

    return response


def check_session(current_session):
    """
    检查session，如果不存在则创建新的session
    :param current_session: 当前session
    :return: 当前session
    """
    if current_session.get('userid') is not None:   # 如果session存在
        userid = current_session.get('userid')
        print("existing session, userid:\t", userid)
    else:   # 如果session不存在
        userid = uuid.uuid1()
        current_session['userid'] = userid
        current_session['chat_with_history'] = False
        current_session['messages_history'] = []
        print("new session, userid:\t", userid)
    return current_session


# 进入主页
@app.route('/', methods=['GET', 'POST'])
def index():
    """
    主页
    :return: 主页
    """
    check_session(session)
    return render_template('index.html')


@app.route('/loadHistory', methods=['GET', 'POST'])
def load_messages():
    """
    加载聊天记录
    :return: 聊天记录
    """
    check_session(session)
    messages_history = session.get('messages_history')
    return messages_history



@app.route('/returnMessage', methods=['GET', 'POST'])
def return_message():
    """
    获取用户发送的消息，调用get_chat_response()获取回复，返回回复，用于更新聊天框
    :return:
    """
    check_session(session)
    send_message = request.values.get("send_message")
    chat_with_history = session.get('chat_with_history')
    messages_history = session.get('messages_history')
    print("用户发送的消息：" + send_message)
    content = handle_messages_get_response(send_message, messages_history, chat_with_history)
    session['messages_history'] = messages_history
    # 解析换行符和空格以及tab制表符到html
    # content = content.replace("\n", "<br>")
    # content = content.replace(" ", "&nbsp;")
    # # content = content.replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
    #
    # # 按顺序遍历将代码开始标识符```转换为<pre>，结束标识符```转换为</pre>，两个pre代码框内灰白色
    # content_list = content.split("```")
    # for i in range(len(content_list)):
    #     if i % 2 == 1:
    #         content_list[i] = "<pre>" + content_list[i] + "</pre>"
    # content = "".join(content_list)
    data = {
        "content": content,
        "content_id": f"content_id{len(messages_history) - 1}"
    }
    return data


@app.route('/changeModeNormal', methods=['GET'])
def change_mode_normal():
    """
    开启普通对话模式
    :return:
    """
    session['chat_with_history'] = False
    print("开启普通对话")
    return "0"


@app.route('/changeModeContinuous', methods=['GET'])
def change_mode_continuous():
    """
    开启连续对话模式
    :return:
    """
    session['chat_with_history'] = True
    print("开启连续对话")
    return "1"


@app.route('/resetHistory', methods=['GET'])
def reset_history():
    """
    清空上下文
    :return:
    """
    session['messages_history'] = []
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
