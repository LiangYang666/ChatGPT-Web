/**
 * 工具函数
 */


/**
 * 生成UUID
 * @returns {string}
 */
function generateUUID() {
    let uuid = '', i, random
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += '-'
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16)
    }
    return uuid
}

function get_time_str(time) {
    let year = time.getFullYear(); //得到年份
    let month = time.getMonth() + 1;//得到月份
    let date = time.getDate();//得到日期
    let hour = time.getHours();//得到小时
    if (hour < 10) hour = "0" + hour;
    let minu = time.getMinutes();//得到分钟
    if (minu < 10) minu = "0" + minu;
    return year + "年" + month + "月" + date + "日 " + hour + ":" + minu
}