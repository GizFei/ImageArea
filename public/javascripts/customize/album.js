$(document).ready(function () {
    let snackBar = document.createElement("div");
    document.body.appendChild(snackBar);
    snackBar.textContent = "消息提示条";
    snackBar.id = "snackbar";

    $(".modal").on("shown.bs.modal", function () {
        $(".navbar").css("margin-right", "");
    });
    $("#albumNewBtn").on("click", function () {
        let albumName = $("input#albumInput").val();
        let policy = "public";
        let publicChecked = $("input#albumPublic")[0].checked;
        if(!publicChecked){
            policy = "private";
        }
        if(albumName === ""){
            showMessage("相册名不能为空");
        }else{
            $.ajax({
                type: 'post',
                url: '/personal/album/new',
                dataType: 'json',
                data:{
                    albumname: albumName,
                    policy: policy
                },
                cache: false,
                success: function (res) {
                    if(res.status === "success"){
                        $("#newAlbumModal").modal("hide");
                        $("#snackbar").text("添加成功").addClass("show");
                        setTimeout(function () {
                            $("#snackbar").text("消息提示条").removeClass("show");
                            window.location.href = '/personal/album/' + policy;
                        }, 2000);
                    }else{
                        showMessage("添加失败");
                    }
                },
                error: function () {
                    showMessage("添加失败，后台错误");
                }
            });
        }
    });
});

var showMessage = function (msg) {
    $("#snackbar").text(msg).addClass("show");
    setTimeout(function () {
        $("#snackbar").text("消息提示条").removeClass("show");
    }, 3000);
};