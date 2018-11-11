window.onload = function(){
    canvasBg.src = $(".mask:first").parents(".overlay").children("img")[0].src;

    $(".mask").on("click", function(){
        console.log("click");
        console.log($(this).parents(".overlay").children("img")[0].src);
        canvasBg.src = $(this).parents(".overlay").children("img")[0].src;
    });

    $(".navbar-toggler").each(function (idx, ele) {
        $(this).attr("data-target", "#img-info" + String(idx));
        $(".collapse").eq(idx).attr("id", "img-info" + String(idx));
    });

    canvasBg.onload = function(){
        drawBlur();
    };
};

var canvas = document.getElementById("blurBg");
var canvasContext = canvas.getContext("2d");
var canvasBg = new Image();
canvasBg.crossOrigin = "Anonymous";

var drawBlur = function(){
    var w = canvas.width;
    var h = canvas.height;
    canvasContext.drawImage(canvasBg, 0, 0, w, h);
    console.log(canvasContext);
    stackBlurCanvasRGBA("blurBg", 0, 0, w, h, 100);
};