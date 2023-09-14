// 当鼠标移动到 bubble-left时显示复制按钮
$(document).on("mouseover", ".bubble-left", function () {
    let copyBtn = $("#menu");
    let copyBtnItem = $("#copy-btn");
    let offset = $(this).offset();
    // 右上角显示
    $("#resend-btn").hide();
    copyBtnItem.show();
    copyBtn.css("display", "block");
    copyBtn.css("top", offset.top);
    copyBtn.css("left", offset.left + $(this).width() - copyBtnItem.width() + 10);
    // 设置复制内容
    copyBtnItem.attr("data-clipboard-text", $(this).text());
});
// 移出bubble-left和菜单按钮时才恢复
$(document).on("mouseleave", ".bubble-left", function () {
    // 若进入了菜单按钮 不关闭
    if (event.toElement.className === "menu-btn") {
        return;
    } else {
        $("#menu").css("display", "none");
    }
});
$(document).on("mouseleave", "#menu", function () {
    $("#menu").css("display", "none");
});


// 当鼠标移动到 bubble-right时显示重发按钮
$(document).on("mouseover", ".bubble-right", function () {
    let menu = $("#menu");
    let resendBtn = $("#resend-btn");
    let offset = $(this).offset();
    // 右上角显示
    $("#copy-btn").hide();
    resendBtn.show();
    menu.css("display", "block");
    menu.css("top", offset.top);
    menu.css("left", offset.left + $(this).width() - resendBtn.width() + 10);
    // 设置复制内容
    resendBtn.attr("data-clipboard-text", $(this).text());
});
// 移出bubble-right和菜单按钮时才恢复
$(document).on("mouseleave", ".bubble-right", function () {
    // 若进入了菜单按钮 不关闭
    if (event.toElement.className === "menu-btn") {
        return;
    } else {
        $("#menu").css("display", "none");
    }
});
$(document).on("mouseleave", "#menu", function () { // 移出菜单按钮
    $("#menu").css("display", "none");
});

$(document).on("mousewheel DOMMouseScroll", function (e) {
    // 当鼠标滚动时，隐藏菜单
    $("#menu").css("display", "none");
});
