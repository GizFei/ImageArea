window.onload = function(){
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
                    alert("修改成功");
                else
                    alert("修改失败");
            },
            error: function (err) {
                console.log(err);
            }
        });
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
        let pc = eleById("private-area").value;
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
                    alert("调整成功");
                }else{
                    alert("调整失败");
                }
            },
            error: function (err) {
                console.log(err);
                alert("调整失败");
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
                        alert("开通成功");
                    }else{
                        alert("邮箱输入错误，开通失败");
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
        alert("没有选择头像");
    }
}
var previewProfile = function(){
    $(".preview")[0].src = getObjectURL(eleById("profile").files[0]);
}





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