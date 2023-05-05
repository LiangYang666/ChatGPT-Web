export default function handler(req, res) {
    // 模拟一个数据对象
    const data = {
        code: 201
    };

    // 将数据对象转换为 JSON 格式
    const json = JSON.stringify(data);

    // 返回 JSON 响应
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(json);
}