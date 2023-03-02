# 使用最新ChatGPT最新API创建的聊天页面，模型回复效果与官网的ChatGPT一致
# 注册openai后送18美元，3个月内使用，API调用很便宜，0.2美分1000 token

## 使用前提
> 有openai账号，注册事项可以参考[此文章](https://juejin.cn/post/7173447848292253704) 
> 创建好api_key, 进入[OpenAI链接](https://platform.openai.com/),右上角点击，进入页面设置
![image](https://user-images.githubusercontent.com/38237931/222461544-260ef350-2d05-486d-bf36-d078873b0f7a.png)


## 使用方法
1. 打开`flask_main.py`文件
2. 将`openai.api_key`填写为自己的api key
3. 将os.environ['HTTP_PROXY']和os.environ['HTTPS_PROXY']设置成本机代理
4. 安装下flask 框架 执行`python flask_main.py`运行程序
5. 打开本地浏览器访问`127.0.0.1:5000`


## 介绍
### 开启程序后进入如下页面
![image](https://user-images.githubusercontent.com/38237931/222455785-96e6f077-5ee3-4a3b-b055-1f1c59c1d6df.png)


### 默认单聊模式，切换为串聊模式，chatgpt将会联系上下文回复你，但意味着花费会更多money  
### 用python写一个冒泡算法试试看  
![image](https://user-images.githubusercontent.com/38237931/222457039-71097e87-3647-47f1-99fc-7e3f5bcc694c.png)  
### 问用C语言呢？会联系上下文回答
![image](https://user-images.githubusercontent.com/38237931/222457182-4063b4eb-2544-4e48-a264-30332b537e5c.png)  

## TODO
- [ ] 界面优化
- [ ] 在串聊模式下支持多人同时使用，目前做不到
- [ ] 重载历史记录
