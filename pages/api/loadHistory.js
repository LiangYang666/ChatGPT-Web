export default function handler(req, res) {
    let user_id = req.headers['user_id'];
    let password = req.headers['password'];
    let apikey = req.headers['apikey'];
    let message_total = parseInt(req.query.message_total);
    if (user_id === undefined || user_id === null || user_id === '' || user_id === 'null') {
        res.send({"code": 200, "data": [{"role": "assistant", "content": "请先创建用户id"}]});
    } else if (message_total === 0) {
        let messages = [{"role": "assistant", "content": project_info}];
        res.send({"code": 201, data: messages});
    } else {
        res.send({"code": 201})
    }
}