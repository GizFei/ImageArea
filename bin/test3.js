// 后端处理图像水印
/**
 * 传入图像，传出加水印后的图像
 */
const sharp = require('sharp');
const Text2SVG = require('text-to-svg');
const path = require('path');
const fs = require('fs');

// img = sharp('../uploads/5.jpg');
// img.metadata()
//     .then(function(metadata) {
//         // 获取宽和高
//         let left = metadata.width;
//         let top = metadata.height;
//         // 需要传入用户名
//         let text = "TK";
//         // Convert text to SVG path without native dependence
//         const text2SVG = Text2SVG.loadSync();
//         const attributes = { fill: 'white', opacity: 0.5 };
//         const options = {x: 0, y: 0, fontSize: 48, anchor: 'left top', attributes: attributes,  };
//         // Get the SVG
//         const svg = Buffer.from(text2SVG.getSVG(text, options));
//         return img.overlayWith(svg, { left, top })
//                 .toFile('../uploads/5.jpg');
//     });

function formWatermarkUrl(username, imgUrl) {
    let text = Buffer.from("@ " + username).toString("base64");
    let style = '?x-oss-process=image/watermark,type_d3F5LW1pY3JvaGVp,size_30,text_' + text + ',color_FFFFFF,t_60,g_se,x_10,y_10';
    return (imgUrl + style);
}

// console.log(formWatermarkUrl("Giz", "https://image-area.oss-cn-beijing.aliyuncs.com/Giz/public/%E5%8A%A8%E6%BC%AB/%E5%8A%A8%E6%BC%AB%E5%9B%BE%E7%89%87_0.jpg"));
// console.log(path.extname("https://image-area.oss-cn-beijing.aliyuncs.com/Giz/public/%E5%8A%A8%E6%BC%AB/%E5%8A%A8%E6%BC%AB%E5%9B%BE%E7%89%87_0.jpg"));
fs.unlinkSync("E:\\WebStormProject\\ImageArea\\detection\\upload_a57ab782b8a0e727dfbed78003bdb950.jpg");