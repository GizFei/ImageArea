window.onload = function(){
    // 添加SnackBar
    let snackBar = document.createElement("div");
    document.body.appendChild(snackBar);
    snackBar.textContent = "消息提示条";
    snackBar.id = "snackbar";

    // 用量进度条设置
    $(".progress-bar").each(function (idx, ele) {
        let s = ele.innerHTML.split("/");
        let used = parseInt(s[0]);
        let total = parseInt(s[1]);
        console.log(used, total);
        ele.style.width = (used/total) * 100 + '%';
    });
    $(".modal").on("shown.bs.modal", function () {
        console.log("shown");
        $(".navbar").css("margin-right", "");
    })
    // 编辑头像
    $("#edit-profile").on("click", function(){ 
        $("#form-profile").removeClass("hide"); 
        $(this).addClass("hide");
    });
    $("#profile-form-cancel").on("click", function(){ 
        $("#form-profile").addClass("hide"); 
        $("#edit-profile").removeClass("hide");
        $(".preview").attr("src", originProfile);
        eleById("profile").value = "";
    });
    $("#profile-form-submit").on("click", formProfile);
    $("#profile").on("change", previewProfile);
    
    // 个人说明
    $("#intro-edit-btn").on("click", function(){
        $("#intro-submit-btn").removeClass("hide");
        $("#intro-cancel-btn").removeClass("hide");
        $("#intro-area").attr("disabled", false);
    });
    $("#intro-cancel-btn").on("click", function(){
        $("#intro-submit-btn").addClass("hide");
        $("#intro-cancel-btn").addClass("hide");
        $("#intro-area").attr("disabled", true);
    });
    $("#intro-submit-btn").on("click", function(){
        $("#intro-submit-btn").addClass("hide");
        $("#intro-cancel-btn").addClass("hide");
        $("#intro-area").attr("disabled", true);
        let intro = eleById("intro-area").value;
        $.ajax({
            url: "/personal/info/introduction",
            dateType: 'json',
            data: {
                intro: intro
            },
            cache: false,
            type: 'post',
            success: function (res) {
                if(res.status === "success")
                    showMessage("修改成功");
                else
                    showMessage("修改失败");
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    // 自定义标签的添加与删除
    $(".deleteTag").on("click", deleteTagEvent);
    $(".newTagBtn").on("click", function () {
        $("#newTagModal").modal("show");
    });
    $("#tag-new-btn").on("click", function () {
        let tag = $("input#tag").val();
        $("input#tag").val("");
        console.log(tag);
        if (tag === "") {
            showMessage("标签名不能为空");
        } else {
            // 提交标签
            $.ajax({
                url: '/personal/info/tag',
                data: {
                    tag: tag,
                    type: 'add'
                },
                dataType: 'json',
                type: 'post',
                cache: false,
                success: function (res) {
                    $("#newTagModal").modal("hide");
                    if (res.status === 'success') {
                        showMessage("添加成功");
                        let newTag = $('<label class="btn btn-light z-depth-0 px-3 custom-tag"></label>');
                        $(newTag).html(tag + '<i class="fa fa-times ml-3 deleteTag"></i>');
                        let p = $("#customTagContainer")[0];
                        p.insertBefore(newTag[0], p.lastChild);
                        $(".deleteTag").each(deleteTagEvent);
                    } else {
                        showMessage("添加失败");
                    }
                },
                error: function () {
                    $("#newTagModal").modal("hide");
                    showMessage("添加失败");
                }
            })
        }
    });

    // 调整私密量
    $("#private-range").on("input", function (e) {
        eleById("private-value").innerText = String(this.value);
    });
    $("#private-edit-btn").on("click", function(){
        $("#private-submit-btn").removeClass("hide");
        $("#private-cancel-btn").removeClass("hide");
        $("#private-range").attr("disabled", false);
    });
    $("#private-cancel-btn").on("click", function(){
        $("#private-submit-btn").addClass("hide");
        $("#private-cancel-btn").addClass("hide");
        $("#private-range").attr("disabled", true);
        eleById("private-value").innerText = originPc;
        eleById("private-range").value = originPc;
    });
    $("#private-submit-btn").on("click", function(){
        $("#private-submit-btn").addClass("hide");
        $("#private-cancel-btn").addClass("hide");
        $("#private-area").attr("disabled", true);
        let pc = eleById("private-range").value;
        originPc = pc;
        console.log("private capacity", pc);
        $.ajax({
            url: '/personal/info/pc',
            data: {
                pc: pc
            },
            dateType: "json",
            cache: false,
            type: 'post',
            success: function (res) {
                if(res.status === "success"){
                    showMessage("调整成功");
                }else{
                    showMessage("调整失败");
                }
            },
            error: function (err) {
                console.log(err);
                showMessage("调整失败");
            }
        });
    });

    // 开通会员
    $("#vip-open").on("click", function(){
        var email = prompt("开通会员", "请输入邮箱...");
        if(email){
            $.ajax({
                url: '/personal/vip/open',
                data: {
                    email: email
                },
                dataType: 'json',
                type: "post",
                cache: false,
                success: function(res){
                    if(res.status === "success"){
                        showMessage("开通成功");
                    }else{
                        showMessage("邮箱输入错误，开通失败");
                    }
                },
                error: function(err){
                    console.log(err);
                }
            });
        }
    });
    // 注销会员
    $("#vip-close").on("click", function(){
        var email = prompt("注销会员", "请输入邮箱...");
        if(email){
            $.ajax({
                url: '/personal/vip/close',
                data: {
                    email: email
                },
                dataType: 'json',
                type: "post",
                cache: false,
                success: function(res){
                    if(res.status === "success"){
                        showMessage("注销成功");
                    }else{
                        showMessage("邮箱输入错误，注销失败");
                    }
                },
                error: function(err){
                    console.log(err);
                }
            });
        }
    });
};

/* 全局变量 */
var eleById = function(id){
    return document.getElementById(id);
};

var originProfile = $(".preview")[0].src;
var originPc = eleById("private-value").innerText;

/* 编辑头像相关函数 */
var formProfile = function(){
    var input = eleById("profile");
    if(input.files.length !== 0){
        document.getElementById("profile-form").submit();
    }else{
        showMessage("没有选择头像");
    }
};
var previewProfile = function(){
    $(".preview")[0].src = getObjectURL(eleById("profile").files[0]);
};

// 删除标签事件
var deleteTagEvent = function (idx, ele) {
    ele.onclick = function(){
        $("#deleteTagModal").modal("show").on("shown.bs.modal", function (e) {
            console.log(e, ele);
            let tag = ele.parentElement.innerText;
            console.log("delete tag", tag);
            $("#tag-delete-btn").on("click", function () {
                $.ajax({
                    url: '/personal/info/tag',
                    data: {
                        tag: tag,
                        type: 'remove'
                    },
                    dataType: 'json',
                    type: 'post',
                    cache: false,
                    success: function (res) {
                        $("#deleteTagModal").modal("hide");
                        if (res.status === 'success') {
                            showMessage("删除成功");
                            $(ele).parent().remove();
                            $(".deleteTag").on("click", deleteTagEvent);
                        } else {
                            showMessage("删除失败");
                        }
                    },
                    error: function () {
                        $("#deleteTagModal").modal("hide");
                        showMessage("删除失败");
                    }
                })
            });
        });
    };
};

function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    console.log(url);
    return url;
}

var showMessage = function (msg) {
    $("#snackbar").text(msg).addClass("show");
    setTimeout(function () {
        $("#snackbar").text("消息提示条").removeClass("show");
    }, 3000);
};