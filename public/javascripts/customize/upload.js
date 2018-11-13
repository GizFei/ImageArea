window.onload = function () {
    console.log("onload");
    $(".selectpicker").selectpicker();
    $("#submit").on("click", postData);
    getAlbumOptions();

    $('#batchUploadBtn').on("click", function () {
        window.location.href = '/upload/batchimages';
    });
    $("#newTagModal").on("shown.bs.modal", function (e) {
        // 第几张图片
        console.log("click modal");
        tagIndex = getIndex(e.relatedTarget);
    });
    $("#tag-new-btn").on("click", function () {
        var label = $('<label class="btn btn-primary z-depth-0 btn-sm tag">人物</label>')[0];
        label.innerText = $("input#tag")[0].value;
        label.onclick = tagEvent;
        $(".tag-container")[tagIndex].appendChild(label);
        tags[tagIndex].push(label.innerText);
        $("input#tag")[0].value = "";
        $("#newTagModal").modal("hide");
    });

    // 上传图片
    $("input[type=file]").on("change", inputFileEvent);
    $(".deleteIcon").on("click", deleteEvent);
    $("input.imgName").on("change", imgNameEvent);
    $(".card").on("mouseover", cardMouseOverEvent).on("mouseout", cardMouseOutEvent);
    $(".tag").on("click", tagEvent);
    $(".selectpicker").on("change", albumEvent);
    $("input.business").on("click", businessEvent);
    $("input.download").on("click", downloadEvent);
}

// 单张图片信息模板
var singleImg = $(".singleImg")[0];
var template = singleImg.cloneNode(true);

var inputFileEvent = function () {
    numOfImages += 1;
    console.log("change");
    if (this.files.length != 0) {
        var url = getObjectURL(this.files[0]);
        imgUrls.push(url);
        // 预览
        this.parentElement.getElementsByTagName("img")[0].src = url;
        $(this).parents(".singleImg").children(".imageInfo").removeClass("hide");
        $(this).parents(".singleImg").children(".instruction").addClass("hide");

        // 初始化
        var idx = numOfImages - 1;
        business[idx] = false;
        download[idx] = false;
        names[idx] = this.files[0].name.split(".")[0];
        files[idx] = this.files[0];
        albums[idx] = "默认相册";
        tags[idx] = [];
        // 初始化图片名
        $("input.imgName").eq(idx).val(names[idx]);

        if (numOfImages < 5) {
            // 最多添加5个
            // 添加一个新节点
            var newImgForm = template.cloneNode(true);
            $(newImgForm).children(".imageInfo").addClass("hide");
            $(newImgForm).children(".instruction").removeClass("hide");
            newImgForm.getElementsByTagName("label")[0].htmlFor = "file" + unique;
            newImgForm.getElementsByTagName("input")[0].id = "file" + unique;
            $(newImgForm).find("input[type=name]:eq(0)").attr("id", "name" + unique);
            $(newImgForm).find("label:eq(1)").attr("for", "name" + unique);
            $(newImgForm).find(".selectpicker").selectpicker();
            this.parentElement.getElementsByTagName("img")[0].src = url;
            $(newImgForm).find("img.preview").attr("src", "/images/photo.jpg");
            $(newImgForm).find("input[type=file]")[0].value = "";
            $(newImgForm).find("input[type=file]:eq(0)").on("change", inputFileEvent);

            // 绑定事件
            $(newImgForm).find(".deleteIcon").on("click", deleteEvent);
            $(newImgForm).find(".card").on("mouseover", cardMouseOverEvent).on("mouseout", cardMouseOutEvent);
            $(newImgForm).find("input[type=text]").on("change", imgNameEvent);
            $(newImgForm).find(".tag").on("click", tagEvent);
            $(newImgForm).find(".selectpicker").on("change", albumEvent);
            $(newImgForm).find("input.business").on("click", businessEvent);
            $(newImgForm).find("input.download").on("click", downloadEvent);

            container.appendChild(newImgForm);
            unique += 1;
        }
    }
};

var numOfImages = 0;
var unique = 1; // 使id不同
var imgUrls = [];

var names = [];
var albums = [];
var tags = [];
var business = [];
var files = [];
var download = [];

// 容器
var container = $(".image-container")[0];
var albumoptions = []; // 相册名
var tagIndex = -1;
//
var print = function () {
    console.log(names);
    console.log(albums);
    console.log(tags);
    console.log(business);
    console.log(download);
}
//
function getAlbumOptions() {
    var albummodel = document.getElementById("albummodel").options;
    for (var i = 1; i < albummodel.length; i++) {
        albumoptions.push(albummodel[i].text);
    }
    console.log(albumoptions);
}
//
var imgNameEvent = function () {
    var idx = getIndex(this);
    if(this.value === ""){
        this.value = names[idx];
    }else{
        names[idx] = this.value;
    }
};

var getIndex = function (ele) {
    var singleImg = $(ele).parents(".singleImg")[0];
    var idx = $(container).children().toArray().indexOf(singleImg);
    console.log("get index", idx);
    return idx;
}
//
var albumEvent = function () {
    var idx = getIndex(this);
    albums[idx] = this.value;
}
//
var tagEvent = function () {
    var index = getIndex(this);
    if (this.classList.contains("btn-light")) {
        $(this).removeClass("btn-light").addClass("btn-primary");
        tags[index].push(this.innerText);
    } else {
        $(this).removeClass("btn-primary").addClass("btn-light");
        // console.log(this.innerText);
        var idx = tags[index].indexOf(this.innerText);
        tags[index].splice(idx, 1);
    }
}

//
var businessEvent = function () {
    var idx = getIndex(this);
    business[idx] = this.checked;
}

var downloadEvent = function () {
    var idx = getIndex(this);
    download[idx] = this.checked;
}

//
var cardMouseOverEvent = function () {
    //        console.log("mouseover:", idx);
    var input = $(this).find("input[type=file]")[0];
    //        console.log(input.files);
    if (input.files.length != 0) {
        // 存在图片
        $(this).find(".mask").addClass("hide");
        $(this).find(".deleteArea").removeClass("slideOutDown").addClass("slideInUp").removeClass("hide");
    } else {
        $(this).find(".mask").removeClass("hide");
    }
}

var cardMouseOutEvent = function () {
    //        console.log("mouseout");
    var input = $(this).find("input[type=file]")[0];
    if (input.files != null) {
        $(this).find(".mask").addClass("hide");
        $(this).find(".deleteArea").removeClass("slideInUp").addClass("slideOutDown");
    } else {
        $(this).find(".mask").removeClass("hide");
    }
}
//
var deleteEvent = function () {
    numOfImages -= 1;
    console.log("delete onclick");
    var singleImg = $(this).parents(".singleImg")[0];
    var idx = $(container).children().toArray().indexOf(singleImg);
    // 删除该项数据
    deleteData(idx);
    container.removeChild(singleImg);

    if (idx == numOfImages) {
        $(".deleteArea").eq(idx).removeClass("slideInUp").addClass("slideOutDown");
    } else {}
}

var deleteData = function (idx) {
    imgUrls.splice(idx, 1);
    names.splice(idx, 1);
    albums.splice(idx, 1);
    tags.splice(idx, 1);
    business.splice(idx, 1);
    download.splice(idx, 1);
    files.splice(idx, 1);
}
//
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

var postData = function () {
    var formData = new FormData();
    var imageInfo = [];
    var date = new Date();
    var dateString = String(date.getFullYear()) + "-" + String(date.getMonth() + 1) + "-" + String(date.getDate());
    for (var i = 0; i < names.length; i++) {
        var image = {
            name: names[i],
            tags: tags[i],
            business: business[i],
            download: business[i],
            album: albums[i],
            date: dateString,
        };
        formData.append("info" + i, JSON.stringify(image));
        formData.append("img" + i, files[i]);
    }
    formData.append("num", String(names.length));
    console.log("post data", formData);
    $("#progressModal").modal("show"); // 显示进度条
    $.ajax({
        url: "/upload/images",
        type: 'POST',
        cache: false, //上传文件不需要缓存
        data: formData,
        dataType: "json",
        processData: false, // 告诉jQuery不要去处理发送的数据
        contentType: false, // 告诉jQuery不要去设置Content-Type请求头
        success: function (data) {
            console.log(data);
            $("#progressModal").modal("hide"); // 隐藏进度条
            if(data.status === 'success'){
                alert("上传成功");
                window.location.href = '/upload/images';
            }
            else
                alert("后台错误");
        },
        error: function (data) {
            console.log(data);
            $("#progressModal").modal("hide"); // 隐藏进度条
            alert("上传失败");
            window.location.href = '/upload/images';
        }
    })
};

