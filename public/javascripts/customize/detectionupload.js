$(window).on("load", function () {
    // 添加SnackBar
    let snackBar = document.createElement("div");
    document.body.appendChild(snackBar);
    snackBar.textContent = "消息提示条";
    snackBar.id = "snackbar";

    let sp = $(".selectpicker").eq(0);
    if(sp.attr("chosen")){
        album = sp.attr("chosen");
        sp.selectpicker('val', sp.attr("chosen"));
    }else{
        sp.selectpicker('val', '默认相册');
        album = "默认相册";
    }
    $(".modal").on("shown.bs.modal", function () {
        console.log("shown");
        $(".navbar").css("margin-right", "");
    });
    $(batchInput).on("change", function () {
        console.log(this.nodeType);
        if (this.files.length + files.length > 8) {
            showMessage("一次上传图片不能超过8张");
            $(this).val("");
        } else if (this.files.length > 0) {
            if(files.length == 0){
                $(".imageInfo").removeClass("hide");
                $(".instruction").addClass("hide");
            }
            $("input.imgName").eq(0).val(this.files[0].name.split(".")[0]);
            console.log(this.files[0].name.split(".")[0]);
            for (let i = 0; i < this.files.length; i++) {
                let newPreview = previewModel.cloneNode(true);
                $(newPreview).find(".preview").attr("src", getObjectURL(this.files[i]));
                container.appendChild(newPreview);
                files.push(this.files[i]);
                $(newPreview).find(".deleteIcon").on("click", deleteImage);
                $(newPreview).on("mouseover", previewOverEvent).on("mouseout", previewOutEvent);
            }
            $(this).val("");
        }
    });
    $("#tag-new-btn").on("click", function () {
        var label = $('<label class="btn btn-primary z-depth-0 btn-sm tag">人物</label>')[0];
        label.innerHTML = $("input#tag")[0].value;
        tags.push(label.innerHTML);
        label.onclick = tagEvent;
        $(".tag-container")[0].appendChild(label);
        $("input#tag")[0].value = "";
        $("#newTagModal").modal("hide");
    });
    $(".tag").on("click", tagEvent);
    $("input.imgName").on("change", imgNameEvent);
    $(".selectpicker").on("change", albumEvent);
    $("input.business").on("click", businessEvent);
    $("input.download").on("click", downloadEvent);
    $("input.watermark").on("click", watermarkEvent);

    $("#submit").on("click", function () {
        if (files.length === 0) {
            showMessage("还没选择图片呢");
        } else {
            $("#progressModal").modal("show"); // 显示进度条
            var formData = new FormData();
            var date = new Date();
            var dateString = String(date.getFullYear()) + "-" + String(date.getMonth() + 1) + "-" + String(date.getDate());
            for (let i = 0; i < files.length; i++) {
                formData.append("img"+i, files[i]);
            }
            formData.append('num', String(files.length));
            formData.append("name", name);
            formData.append("album", album);
            formData.append("tags", JSON.stringify(tags));
            formData.append("business", business);
            formData.append("download", download);
            formData.append("watermark", watermark);
            formData.append("date", dateString);
            $.ajax({
                url: "/upload/batchimages",
                type: 'post',
                dataType: 'json',
                data: formData,
                cache: false,
                processData: false, // 告诉jQuery不要去处理发送的数据
                contentType: false, // 告诉jQuery不要去设置Content-Type请求头,
                success: function(res){
                    $("#progressModal").modal("hide"); // 隐藏进度条
                    if(res.status === "success"){
                        $("#snackbar").text("上传成功").addClass("show");
                        setTimeout(function () {
                            $("#snackbar").text("消息提示条").removeClass("show");
                            window.location.href = '/upload/batchimages';
                        }, 2000);
                    }else{
                        showMessage("上传失败");
                    }
                },
                error: function(){
                    $("#progressModal").modal("hide"); // 隐藏进度条
                    showMessage("后台错误");
                }
            });
        }
    });

    // 图片识别
    $("#detectionBtn").on("click", function () {
        if (files.length === 0) {
            showMessage("还没上传图片");
        } else {
            $("#progressModal2").modal("show");
            var formData = new FormData();
            for(let i = 0; i < files.length; i++){
                formData.append('image' + i, files[i]);
            }
            console.log(formData);
            $.ajax({
                url: '/experiment/objectdetection',
                type: 'post',
                dataType: 'json',
                data: formData,
                processData: false, // 告诉jQuery不要去处理发送的数据
                contentType: false, // 告诉jQuery不要去设置Content-Type请求头,
                cache: false,
                success: function (res) {
                    $("#progressModal2").modal("hide");
                    let tagsResult = res.tags;
                    console.log(tagsResult);
                    for(let i = 0; i < tagsResult.length; i++){
                        var label = $('<label class="btn btn-primary z-depth-0 btn-sm tag">人物</label>')[0];
                        label.innerHTML = tagsResult[i];
                        label.onclick = tagEvent;
                        tags.push(label.innerHTML);
                        $(".tag-container")[0].appendChild(label);
                        // $("input#tag")[0].value = "";
                    }
                },
                error: function () {
                    $("#progressModal2").modal("hide");
                    showMessage("识别失败");
                }
            });
        }
    });
});

var container = $("#previewContainer")[0];
var batchInput = $(":file")[0];
var previewModel = $("#previewModal")[0].firstElementChild;

var files = [];
var name="";
var album="";
var tags = [];
var business = false;
var download = false;
var watermark = false;

var deleteImage = function () {
    let img = $(this).parents(".col-md-4")[0];
    console.log(img);
    let idx = imageIndex(img);
    container.removeChild(img);
    files.splice(idx, 1);
    if(files.length == 0){
        $(".imageInfo").addClass("hide");
        $(".instruction").removeClass("hide");
    }
};

var print = function () {
    console.log(name);
    console.log(album);
    console.log(tags);
    console.log(business);
    console.log(download);
    console.log(watermark);
};
var previewOverEvent = function () {
    $(this).find(".deleteArea").addClass("slideInUp").removeClass("slideOutDown hide");
};
var previewOutEvent = function () {
    $(this).find(".deleteArea").addClass("slideOutDown");
};
var tagEvent = function(){
    if (this.classList.contains("btn-light")) {
        $(this).removeClass("btn-light").addClass("btn-primary");
        tags.push(this.innerText);
    } else {
        $(this).removeClass("btn-primary").addClass("btn-light");
        var idx = tags.indexOf(this.innerText);
        console.log(idx);
        tags.splice(idx, 1);
    }
};
var imgNameEvent = function () {
    if(this.value === ""){
        this.value = name;
    }else{
        name = this.value;
    }
};
var albumEvent = function () {
    album = this.value;
};
var businessEvent = function () {
    business = this.checked;
};
var downloadEvent = function () {
    download = this.checked;
};
var watermarkEvent = function () {
    watermark = this.checked;
};

var imageIndex = function (preview) {
    var previews = $(container).children().toArray();
    return previews.indexOf(preview);
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
