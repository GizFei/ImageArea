// 加载搜索结果的首页
window.onload = function() {
    let value;
    let query = window.location.href;
    let pairs = query.split("&");
    for(let i=0;i<pairs.length;i++) {
        let pos = pairs[i].indexOf('=');
        value = pairs[i].substring(pos + 1);
    }
    // URL传递中文乱码解决
    value = decodeURI(value);
    document.getElementById("fillPH").setAttribute('value', value);
    document.getElementById("fillPH").setAttribute('placeholder', "Search users/images...");
    document.getElementById("fillPH1").setAttribute('value', value);
    document.getElementById("fillPH1").setAttribute('placeholder', "Search users/images...");

    $("#progressModal").modal("show");
    // 异步获取搜索结果，上面也为有效代码
    $.ajax({
        type:'post',
        url:'/search',
        dataType: 'json',
        data: {page_id: "1", word: value, type: 'UI'},                  // 需要返回图像和用户的结果数目
        //
        //   {  image_total_num,
        //      user_total_num,
        //      images[ {...图像信息...} ]        // 三张卡片
        //      users[ {...用户信息...} ]         // 三张卡片
        //    }
        //
        success: function (data) {
            $("#progressModal").modal("hide");
            let imageNum = data.image_total_num;
            let userNum = data.user_total_num;
            let page1 = Math.ceil(imageNum/3);                          // 图像页数
            let page2 = Math.ceil(userNum/3);                           // 用户页数
            let par1 = document.getElementById("page-par1");            // 图片卡片页码条
            let par2 = document.getElementById("page-par2");            // 用户卡片页码条
            let eg1 = document.getElementById("page1");
            let eg2 = document.getElementById("ppage1");
            let imagePane = document.getElementById("IMAGES"); // 图片展示区
            let userPane = document.getElementById("USERS");   // 用户展示区
            for(let i=2;i<page1+1;i++) {                                // 总页数生成
                let copy = eg1.cloneNode(true);
                copy.id = "page"+i;
                $(copy).removeClass("active");
                $(copy).children()[0].textContent = i;
                par1.appendChild(copy);
            }
            for(let i=2;i<page2+1;i++) {                                // 总页数生成
                let copy = eg2.cloneNode(true);
                copy.id = "page"+i;
                $(copy).removeClass("active");
                $(copy).children()[0].textContent = i;
                par2.appendChild(copy);
            }
            $(".page-item").on('click', pageItemEvent);
            console.log(data);

            for(let i = 0; i < 3; i++) {
                if(i < data.images.length){
                    $(imagePane).find(".col-md-4").eq(i).removeClass("hide");
                    $(imagePane).find(".card-img-top")[i].src = data.images[i].url;
                    $(imagePane).find("h4")[i].textContent = data.images[i].name;
                    $(imagePane).find(".owner")[i].textContent = data.images[i].owner;
                    $(imagePane).find(".owner")[i].href = '/access/' + data.images[i].owner;
                }else{
                    $(imagePane).find(".col-md-4").eq(i).addClass("hide");
                }
            }
            for(let i = 0; i < 3;i++) {
                if(i < data.users.length){
                    $(userPane).find(".col-md-4").eq(i).removeClass("hide");
                    $(userPane).find("img")[i].src = data.users[i].avatar;
                    $(userPane).find(".owner")[i].textContent = data.users[i].username;
                    $(userPane).find(".owner")[i].href = '/access/' + data.users[i].username;
                    $(userPane).find(".intro")[i].textContent = data.users[i].introduction;
                }else{
                    $(userPane).find(".col-md-4").eq(i).addClass("hide");
                }
            }
        },
        error: function () {
            $("#progressModal").modal("hide");
            alert("搜索失败");
        }
    });

    setTimeout(function () {
        $("#progressModal").modal("hide");
    }, 2000);
};

$(document).ready(function () {
    $("#progressModal").modal("hide");
});

// var images = [];
// var users = [];

// 搜索页面刷新
function getSearch() {
    let value = document.getElementById("fillPH").value;
    window.location.href = "/search?search=" + value;
}

// 搜索输入接受回车事件
$(function(){
    $('#fillPH1').bind('keypress', function (event){
        if(event.keyCode == "13")
        {
            let value = document.getElementById("fillPH1").value;
            document.getElementById("fillPH").setAttribute('value', value);
            getSearch();
        }
    });
});

// 页码点击事件
var pageItemEvent = function () {
    console.log("click page");
    let ID, type;
    let pageId = this.id;
    let value = document.getElementById("fillPH1").value;
    if(pageId.substring(0,2) == "pp")
        type = "U";
    else
        type = "I";
    let pairs = pageId.split("e");
    for(let i=0;i<pairs.length;i++) {
        let pos = pairs[i].indexOf('e');
        ID = pairs[i].substring(pos + 1);
    }

    // ID为页码，获得请求
    $.ajax({
        type: 'post',
        url: '/search',
        data: {page_id: ID, word: value, type: type},
        dataType: 'json',
        success: function (data) {
            if(type === "I") {
                let imagePane = document.getElementById("IMAGES"); // 图片展示区
                $(imagePane).find(".page-item").removeClass("active");
                console.log(pageId);
                $(imagePane).find("#" + pageId).addClass("active");
                for(let i = 0; i < 3; i++) {
                    if(i < data.images.length){
                        $(imagePane).find(".col-md-4").eq(i).removeClass("hide");
                        $(imagePane).find(".card-img-top")[i].src = data.images[i].url;
                        $(imagePane).find("h4")[i].textContent = data.images[i].name;
                        $(imagePane).find(".owner")[i].textContent = data.images[i].owner;
                    }else{
                        $(imagePane).find(".col-md-4").eq(i).addClass("hide");
                    }
                }
            } else if(type === "U") {
                let userPane = document.getElementById("USERS"); // 图片展示区
                $(userPane).find(".page-item").removeClass("active");
                $(userPane).find(pageId).addClass("active");
                for(let i = 0; i < 3;i++) {
                    if(i < data.users.length){
                        $(userPane).find(".col-md-4").eq(i).removeClass("hide");
                        $(userPane).find(".img-fluid")[i].src = data.users[i].avatar;
                        $(userPane).find(".owner")[i].textContent = data.users[i].username;
                        $(userPane).find(".owner")[i].href = '/access/' + data.users[i].username;
                        $(userPane).find(".intro")[i].textContent = data.users[i].introduction;
                    }else{
                        $(userPane).find(".col-md-4").eq(i).addClass("hide");
                    }
                }
            }
        },
        error: function () {
            alert("翻页失败");
        }
    })
};

