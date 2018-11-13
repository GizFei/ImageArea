// 初始化加载首页
window.onload = function(){
    $(".comment-submit").on("click", submitComment);

    $(".carousel").carousel({
        interval: 5000
    });
    $("textarea").on("focus", function () {
        console.log("iii");
        $(".carousel").carousel('pause');
    }).on("blur", function () {
        console.log("iii2");
        $(".carousel").carousel('cycle');
    });

    $(".carousel").on("mouseover", function () {
        $(".carousel").carousel('pause');
    }).on("mouseout", function () {
        $(".carousel").carousel('cycle');
    });
    // 图像信息
    $.ajax({
        type:'post',
        url:'/images',
        data: {page: "home"},
        success: function (data) {
            // active页面图像信息
            // 上半区
            let eg = document.getElementById("item0");
            eg.name = data[0].uuid;
            eg.getElementsByTagName("img")[0].src = data[0].url;
            eg.getElementsByTagName("h3")[0].textContent = data[0].name;
            eg.getElementsByTagName("span")[0].textContent = data[0].tags;
            // 下半区
            let otherEg = document.getElementById("other-item0");
            otherEg.getElementsByTagName("span")[0].textContent = data[0].likes;
            otherEg.getElementsByTagName("span")[1].textContent = data[0].album.albumname;
            if(!data[0].download)
                $(otherEg.getElementsByTagName("span")[3]).children("a").addClass("disabled text-black");
            otherEg.getElementsByClassName("ownerAvatar")[0].src = data[0].avatar;
            otherEg.getElementsByClassName("ownerName")[0].textContent = data[0].owner;
            otherEg.getElementsByClassName("ownerName")[0].href = '/access/' + data[0].owner;
            // 页面评论
            if(data[0].messages.length > 0){
                for(let i=0;i<data[0].messages.length; i++) {
                    let comEg = document.getElementById("comment" + i);
                    comEg.style.display = "";
                    comEg.getElementsByTagName("img")[i].src = data[0].messages[0].avatar;
                    comEg.getElementsByTagName("a")[i].textContent = data[0].messages[0].username;
                    comEg.getElementsByTagName("a")[i].href =  '/access/' + data[0].messages[0].username;
                    comEg.getElementsByTagName("span")[2*i].textContent =  data[0].messages[0].msg;
                    comEg.getElementsByTagName("span")[2*i+1].textContent =  data[0].messages[0].date;
                }
            }

            // 循环获取非active页面的信息
            for(let i=1;i<5;i++) {
                // 上半区
                let copy = document.createElement("div");
                document.getElementById("item-par").appendChild(copy);
                copy.className = "carousel-item";
                copy.innerHTML = eg.innerHTML;
                copy.id = "item" + i.toString();
                copy.name = data[i].uuid;                                               //图像ID
                copy.getElementsByTagName("img")[0].src = data[i].url;                  //图像外链接
                copy.getElementsByTagName("h3")[0].textContent = data[i].name;      //图像名
                copy.getElementsByTagName("span")[0].textContent = data[i].tags;        //图像标签
                // 下半区
                let otherCopy = document.createElement("div");
                otherCopy.className = "carousel-item";
                otherCopy.innerHTML = otherEg.innerHTML;
                otherCopy.getElementsByTagName("span")[0].textContent = data[i].likes;       //图像点赞数
                otherCopy.getElementsByTagName("span")[1].textContent = data[i].album.albumname;       //图像相册
                if(!data[i].download)
                    $(otherCopy.getElementsByTagName("span")[3]).children("a").addClass("disabled text-black");
                otherCopy.getElementsByClassName("ownerAvatar")[0].src = data[i].avatar;
                otherCopy.getElementsByClassName("ownerName")[0].textContent = data[i].owner;
                otherCopy.getElementsByClassName("ownerName")[0].href = '/access/' + data[i].owner;
                document.getElementById("other-item-par").appendChild(otherCopy);
                // 评论
                for (let j = 0; j < 3; j++) {
                    if (data[i].messages.length > j) {
                        otherCopy.style.display = "";
                        otherCopy.getElementsByTagName("img")[j+1].src = data[i].messages[j].url;
                        otherCopy.getElementsByTagName("a")[j+1].textContent = data[i].messages[j].username;   //评论人
                        otherCopy.getElementsByTagName("a")[j+1].href = '/access/' + data[i].messages[j].username;
                        otherCopy.getElementsByTagName("span")[2 * j + 4].textContent = data[i].messages[j].msg;    //评论信息
                        otherCopy.getElementsByTagName("span")[2 * j + 5].textContent = data[i].messages[j].date;    //评论日期
                    }else{
                        $(otherCopy).children(".comment").addClass("hide");
                    }
                }
            }
        },
        error: function () {
            // alert("图像数据加载失败！");
        },
        dataType:"json"
    });

    $('.heart').each(function (idx, ele) {
        $(ele).on('click',function(){
            console.log("click");
            let photoId = document.getElementsByClassName("carousel-item active")[0].name;
            let ifLike = document.getElementsByClassName("heart")[0].getAttribute('rel');
            $.ajax({
                type:'post',
                url:'/like',
                data: {id: photoId},
                success: function () {
                    if(ifLike === 'like')
                    {
                        console.log("like");
                        $(".heart").eq(idx).addClass("heartAnimation").attr("rel", "unlike").css("background-position", "right");
                        // 点击后强制使图片停在最右边，
                    }
                    else
                    {
                        console.log("like");
                        $(".heart").eq(idx).removeClass("heartAnimation").attr("rel", "like").css("background-position", "left");
                        //点击后强制使红心变黑，否则显示悬停状态的红色的心
                    }
                },
                error: function () {
                    alert("点赞失败！");
                },
                dataType:"json"
            });
        });
    })
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

// 异步添加评论
function submitComment() {
    let parent = document.getElementsByClassName("carousel-item active")[1];
    let comParent = parent.getElementsByClassName("col-md-8")[0];
    let photoId = document.getElementsByClassName("carousel-item active")[0].name;
    let comment = document.getElementById("textarea-char-counter").value;
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
                for (let j = 0; j < 3; j++) {
                    if (res.messages.length > j) {
                        $(comParent).children(".row").eq(j).removeClass("hide");
                        comParent.getElementsByTagName("img")[j].src = res.messages[j].avatar;
                        comParent.getElementsByTagName("a")[j].textContent = res.messages[j].username;   //评论人
                        comParent.getElementsByTagName("a")[j].href = '/access/' + res.messages[j].username;
                        comParent.getElementsByClassName("comment-text")[j].textContent = res.messages[j].msg;    //评论信息
                        comParent.getElementsByClassName("date")[j].textContent = res.messages[j].date;    //评论日期
                    }
                    else
                        $(comParent).children(".row").eq(j).addClass("hide");
                }
            }
            else {
                alert(res.msg);
            }
        },
        error: function () {
            // console.log(data.toString());
            alert("提交评论失败！");
        },
        dataType:"json"
    });
}

$('#carousel-example-1').on('slide.bs.carousel', function () {
    let parent = document.getElementsByClassName("carousel-item active")[0];
    let pos = parent.id.indexOf('m');
    let num = parent.id.substring(pos + 1);
    $('#carousel-example-2').carousel(parseInt(num));
});