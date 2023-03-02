
var Words = document.getElementById("words");
var Who = document.getElementById("who");
var TalkWords = document.getElementById("talkwords");
var TalkSub = document.getElementById("talksub");



$("#talksub").click(function () {
    
     //定义空字符串
     var str = "";
     if(TalkWords.value == ""){
          // 消息为空时弹窗
         alert("消息不能为空");
         return;
     }

     who.value = 1
     if(Who.value == 0){
         //如果Who.value为0n那么是 A说
         str = '<div class="atalk"><span>' + TalkWords.value +'</span></div>';
     }
     else{
         str = '<div class="btalk"><span>' + TalkWords.value +'</span></div>' ;  
     }
     Words.innerHTML = Words.innerHTML + str;

   
    $.ajax({
        url: "/returnMessage",
        data: {
            "send_message": TalkWords.value
        },
        type: "Post",
        dataType: "text",
        success: function (data) {
            str = '<div class="atalk"><span>' + data +'</span></div>';
            Words.innerHTML = Words.innerHTML + str;
        },
    })
    TalkWords.value = ""
})