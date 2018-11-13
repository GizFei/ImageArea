window.onload = function () {
    initAlpha();

    $("label").each(function (idx, ele) {
        setMoveTimer(ele);
        setDirectTimer(ele);
    }).on("mouseover", function () {
        var idx = getLabelPos(this);
        clearInterval(moveTimer[idx]);
        clearInterval(directTimer[idx]);
        $(this).css("opacity", 1);
    }).on("mouseout", function () {
        let idx = getLabelPos(this);
        this.style.opacity = opacities[idx];
        setMoveTimer(this);
        setDirectTimer(this);
    }).on("click", function () {
        let query = this.innerHTML;
        window.location.href = '/search?search=' + query;
    });

    $(".icon-back").on("click", function () {
        window.location.href = '/';
    })
};

window.onresize = function(){
    width = window.innerWidth - 100;
    height = window.innerHeight - 100;
    console.log("resize");
};

var count = $("label.test").toArray().length;
var xStep = 1;
var yStep = 1;
var alphaStep = 0.05;
var width = window.innerWidth - 100;
var height = window.innerHeight - 100;
var minAlpha = 0.5;

var moveTimer = new Array(count);
var directTimer = new Array(count);

var xF = new Array(count);
xF.fill(0);
xF.forEach(function (x, j) {
    xF[j] = Math.round(Math.random() * width);
    $("label").eq(j).css("left", xF[j] + "px");
});
console.log(xF);

var yF = new Array(count);
yF.fill(0);
yF.forEach(function (x, j) {
    yF[j] = Math.round(Math.random() * height);
    $("label").eq(j).css("top", yF[j] + "px");
});
console.log(yF);

var opacities = new Array(count);
opacities.fill(1);
//opacities.forEach(function (x, j) {
//    opacities[j] = Math.random() * 0.5 + 0.5;
//    $("label").eq(j).css("opacity", opacities[j]);
//});

var xD = new Array(count);
xD.fill(1);
var yD = new Array(count);
yD.fill(1);

var getLabelPos = function (label) {
    var labels = Array.from($("#tags-container")[0].children);
    return labels.indexOf(label);
};

var setMoveTimer = function (label) {
    var idx = getLabelPos(label);
    moveTimer[idx] = setInterval(function () {
        if (xF[idx] >= width) {
            xF[idx] = width;
            xD[idx] = -1;
        }
        if (xF[idx] <= 0) {
            xD[idx] = 1;
        }
        xF[idx] += xStep * xD[idx];
        $("label").eq(idx).css("left", xF[idx] + "px");

        if (yF[idx] >= height) {
            yF[idx] = height;
            yD[idx] = -1;
        }
        if (yF[idx] <= 0) {
            yD[idx] = 1;
        }
        yF[idx] += yStep * yD[idx];
        $("label").eq(idx).css("top", yF[idx] + "px");

    }, 100);
};

var setDirectTimer = function (label) {
    var idx = getLabelPos(label);
    directTimer[idx] = setInterval(function () {
        if (Math.random() * 2 - 1 > 0) {
            xD[idx] = 1;
        } else {
            xD[idx] = -1;
        }

        if (Math.random() * 2 - 1 > 0) {
            yD[idx] = 1;
        } else {
            yD[idx] = -1;
        }

    }, 10000);
};

var initAlpha = function () {
    let freq = [];
    $(".test").each(function (idx, ele) {
        freq.push(parseInt(ele.title));
    });
    freq.sort();
    let maxFreq = freq[freq.length - 1];
    $(".test").each(function (idx, ele) {
        opacities[idx] = (parseInt(ele.title) / maxFreq) * 0.5 + 0.5;
        ele.style.opacity = opacities[idx];
    });
};
