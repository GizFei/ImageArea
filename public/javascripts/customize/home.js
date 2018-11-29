// onload函数
window.onload = function(){
    console.log("READY");
    // 添加SnackBar
    let snackBar = document.createElement("div");
    document.body.appendChild(snackBar);
    snackBar.textContent = "消息提示条";
    snackBar.id = "snackbar";
    // 初始化
    let mCarousel = document.getElementById("mCarousel");
    let item = document.getElementsByClassName("carousel-item active")[0];
    let controlActive = mCarousel.getElementsByClassName("mCarousel-li active")[0];
    controlActive.getElementsByTagName("img")[0].style.border = "2px #76c1f9 solid";
    controlActive.getElementsByTagName("div")[1].className = "mask rgba-black-light";

    let slides = document.getElementById("slides");
    let controls = document.getElementById("controls");

    let slides2 = document.getElementById("slides2");
    let item2 = document.getElementsByClassName("carousel-item active")[1];

    // 异步请求首页数据
    $.ajax({
        type: 'post',
        url: '/images',
        data: {page: "home"},
        success: function (data) {
            console.log(data);
            for(let i=0;i<5;i++) {
                //第一个元素
                if(i === 0) {
                    controls.getElementsByTagName("img")[i].src = data[i].url;
                    item.name = data[i].uuid;
                    item.getElementsByTagName("img")[0].src = data[i].url;
                    item.getElementsByTagName("h3")[0].textContent = data[i].name;
                    item.getElementsByTagName("span")[0].textContent = data[i].tags;
                    item.getElementsByTagName("span")[1].textContent = data[i].likes;
                    item.getElementsByTagName("span")[2].innerHTML = "<a href='/access/" + data[i].album.albumurl + "'>" + data[i].album.albumname + "</a>";
                    if(!data[i].download)
                        $(item.getElementsByTagName("span")[4].firstChild).addClass("disabled");
                    else{
                        item.getElementsByTagName("span")[4].firstChild.href = data[i].url;
                        $(item.getElementsByTagName("span")[4].firstChild).attr("download", data[i].name + ".png");
                    }
                    item.getElementsByClassName("ownerAvatar")[0].src = data[i].avatar;
                    item.getElementsByClassName("ownerName")[0].textContent = data[i].owner;
                    item.getElementsByClassName("ownerName")[0].href = '/access/' + data[i].owner;
                    if(data[i].iflike){
                        $(".heart").eq(i).attr("rel", 'unlike')
                            .css("background-position", "right");
                    }
                    //评论部分
                    if(data[i].messages.length > 0){
                        for(let j=0; j<data[i].messages.length; j++) {
                            let comment = item2.getElementsByClassName("row comment")[j];
                            comment.style.display = "";
                            comment.getElementsByTagName("img")[0].src = data[i].messages[j].avatar;
                            comment.getElementsByTagName("a")[0].textContent = data[i].messages[j].username;
                            comment.getElementsByTagName("a")[0].href =  '/access/' + data[i].messages[j].username;
                            comment.getElementsByTagName("span")[0].textContent =  data[i].messages[j].msg;
                            comment.getElementsByTagName("span")[1].textContent =  data[i].messages[j].date;
                        }
                    }
                }
                //第二到第五元素
                else {
                    //上半区的复制与填充
                    controls.getElementsByTagName("img")[i].src = data[i].url;
                    let temp = document.createElement("div");
                    temp.className = "carousel-item";
                    temp.name = data[i].uuid;
                    temp.innerHTML = item.innerHTML;
                    temp.getElementsByTagName("img")[0].src = data[i].url;
                    temp.getElementsByTagName("h3")[0].textContent = data[i].name;
                    temp.getElementsByTagName("span")[0].textContent = data[i].tags;
                    temp.getElementsByTagName("span")[1].textContent = data[i].likes;
                    temp.getElementsByTagName("span")[2].innerHTML = "<a href='/access/" + data[i].album.albumurl + "'>" + data[i].album.albumname + "</a>";
                    if(!data[i].download)
                        $(temp.getElementsByTagName("span")[4].firstChild).addClass("disabled");
                    else{
                        temp.getElementsByTagName("span")[4].firstChild.href = data[i].url;
                        $(temp.getElementsByTagName("span")[4].firstChild).attr("download", data[i].name + ".png");
                    }
                    temp.getElementsByClassName("ownerAvatar")[0].src = data[i].avatar;
                    temp.getElementsByClassName("ownerName")[0].textContent = data[i].owner;
                    temp.getElementsByClassName("ownerName")[0].href = '/access/' + data[i].owner;
                    if(data[i].iflike){
                        $('.heart').eq(i).attr("rel", 'unlike')
                            .css("background-position", "right");
                    }
                    slides.appendChild(temp);

                    //下半区的复制与填充
                    let temp2 = document.createElement("div");
                    temp2.className = "carousel-item";
                    temp2.innerHTML = item2.innerHTML;
                    // 评论部分
                    for(let j=0; j<3; j++) {
                        if(j < data[i].messages.length) {
                            let comment = temp2.getElementsByClassName("row comment")[j];
                            comment.style.display = "";
                            comment.getElementsByTagName("img")[0].src = data[i].messages[j].avatar;
                            comment.getElementsByTagName("a")[0].textContent = data[i].messages[j].username;
                            comment.getElementsByTagName("a")[0].href =  '/access/' + data[i].messages[j].username;
                            comment.getElementsByTagName("span")[0].textContent =  data[i].messages[j].msg;
                            comment.getElementsByTagName("span")[1].textContent =  data[i].messages[j].date;
                        }
                        else {
                            temp2.getElementsByClassName("row comment")[j].style.display = "none";
                        }
                    }
                    slides2.appendChild(temp2);
                }
            }
            $(".comment-submit").on("click", submitComment);
            $(".heart").each(likeEvent);
        },
        error: function () {
           showMessage("首页加载失败");
        }
    });
};

window.onscroll = function(){
    if(window.scrollY >= $(".signal-head")[0].offsetHeight - 64){
        $("nav").addClass("animated fadeIn primary-color");
        $("form").eq(0).removeClass("hide");
    }else{
        $("nav").removeClass("animated fadeIn primary-color");
        $("form").eq(0).addClass("hide");
    }
};

// 切换时消失边框并加上遮罩
$('#mCarousel').on('slide.bs.carousel', function () {
    let mCarousel = document.getElementById("mCarousel");
    let controlActive = mCarousel.getElementsByClassName("mCarousel-li active")[0];
    controlActive.getElementsByTagName("img")[0].style.border = "";
    controlActive.getElementsByTagName("div")[1].className = "mask rgba-black-strong";
});

// 异步添加评论
var submitComment = function() {
    console.log("提交评论");
    let parent = document.getElementsByClassName("carousel-item active")[0];
    let comParent = document.getElementsByClassName("carousel-item active")[1];
    let photoId = parent.name;
    let comment = comParent.getElementsByClassName("textarea-char-counter")[0].value;
    let owner = parent.getElementsByClassName("ownerName")[0].textContent;
    let date = new Date();
    let dateString = String(date.getFullYear()) + "-" + String(date.getMonth() + 1) + "-" + String(date.getDate());
    $.ajax({
        type:'post',
        url:'/messages',
        // 同时提交评论信息
        data: {id: photoId, msg: comment, date: dateString, owner: owner},
        success: function (res) {
            if(res.status === 'success') {
                console.log(res.messages);
                comParent.getElementsByClassName("textarea-char-counter")[0].value = "";
                for (let j = 0; j < 3; j++) {
                    if (res.messages.length > j) {
                        let commentArea = $(comParent).find(".comment").eq(j);
                        commentArea.css('display', '');
                        commentArea.find(".comment-profile").attr("src", res.messages[j].avatar);
                        commentArea.find(".name").text(res.messages[j].username);   //评论人
                        commentArea.find(".name").attr('href', '/access/' + res.messages[j].username);
                        commentArea.find(".comment-text").text(res.messages[j].msg);    //评论信息
                        commentArea.find(".date").text(res.messages[j].date);    //评论日期
                    }
                }
            }
            else {
                showMessage(res.msg);
            }
        },
        error: function () {
            showMessage("提交评论失败");
        },
        dataType:"json"
    });
};

// 切换时出现边框并隐藏遮罩
// 联动
$('.mCarousel-li').click( function () {
    this.getElementsByTagName("img")[0].style.border = "2px #76c1f9 solid";
    this.getElementsByTagName("div")[1].className = "mask rgba-black-light";
    let pos = this.id.indexOf('l');
    let ID = parseInt(this.id.substring(pos+1));
    $('#mCarousel2').carousel(ID);
});

// 点赞事件
var likeEvent = function (idx, ele) {
    $(ele).on('click',function(){
        console.log("click");
        let item = document.getElementsByClassName("carousel-item active")[0];
        let photoId = item.name;
        let ifLike = item.getElementsByClassName("heart")[0].getAttribute('rel');
        let jIfLike = ifLike === 'like';
        let owner = item.getElementsByClassName("ownerName")[0].textContent;
        console.log(photoId, ifLike, owner);
        $.ajax({
            type:'post',
            url:'/like',
            data: {id: photoId, ifLike: jIfLike, owner: owner},
            success: function (res) {
                console.log(res);
                if(res.status === 'success'){
                    if(ifLike === 'like')
                    {
                        console.log("like");
                        $(".heart").eq(idx).addClass("heartAnimation").attr("rel", "unlike").css("background-position", "right");
                        let likes = parseInt(item.getElementsByTagName("span")[1].textContent);
                        item.getElementsByTagName("span")[1].textContent = likes + 1;
                        // 点击后强制使图片停在最右边，
                    }
                    else
                    {
                        console.log("unlike");
                        $(".heart").eq(idx).removeClass("heartAnimation").attr("rel", "like").css("background-position", "left");
                        let likes = parseInt(item.getElementsByTagName("span")[1].textContent);
                        item.getElementsByTagName("span")[1].textContent = likes - 1;
                        //点击后强制使红心变黑，否则显示悬停状态的红色的心
                    }
                }else{
                    showMessage(res.msg);
                }
            },
            error: function () {
                showMessage("点赞失败");
            },
            dataType:"json"
        });
    });
};

var showMessage = function (msg) {
    $("#snackbar").text(msg).addClass("show");
    setTimeout(function () {
        $("#snackbar").text("消息提示条").removeClass("show");
    }, 3000);
};
