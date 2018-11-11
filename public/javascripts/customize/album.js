$(document).ready(function () {
    $("#albumNewBtn").on("click", function () {
        let albumName = $("input#albumInput").val();
        let policy = "public";
        let publicChecked = $("input#albumPublic")[0].checked;
        if(!publicChecked){
            policy = "private";
        }
        if(albumName === ""){
            alert("相册名不能为空！");
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
                        alert("添加成功");
                        window.location.href = '/personal/album/public';
                    }else{
                        alert("添加失败");
                    }
                },
                error: function (res) {
                    alert("添加失败，后台错误");
                }
            });
        }
    });
});