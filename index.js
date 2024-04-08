// var JsBarcode = require('jsbarcode');
// 换行文本绘制
function wrapTextFn (context, text, x, startY, maxWidth, lineHeight) {
    const lines = [];
    const space = '';
    let line = '';

    for (let i = 0; i < text.length; i++) {
        const word = text[i];
        const width = context.measureText(line + word + space).width;
        if (width < maxWidth && word !== '\n') {
            line += (word + space);
        } else {
            if (word === '\n') {
                line += word;
                i++; // Skip the newline character
            }
            lines.push(line);
            line = word + space;
        }
    }
    lines.push(line); // Push the last line
    lines.forEach((line) => {
        context.fillText(line.trim(), x, startY);
        startY += lineHeight;
    });

    return lines.length;
}

// 计算换行的行数，便于摆放Y的位置
function calculateTextLines (context, text, maxWidth, fontSize) {
    const lines = [];
    const space = '';
    let line = '';
    context.font = `${fontSize}px 宋体`;

    for (let i = 0; i < text.length; i++) {
        const word = text[i];
        const width = context.measureText(line + word + space).width;
        if (width < maxWidth && word !== '\n') {
            line += (word + space);
        } else {
            if (word === '\n') {
                line += word;
                i++; // Skip the newline character
            }
            lines.push(line);
            line = word + space;
        }
    }
    lines.push(line);
    return lines.length; // 返回总行数
}

// 摆放x的位置
function calculateX (ctx, item, canvas) {
    switch (item.textAlign) {
        case 'center':
            return canvas.width / 2;
        case 'end':
        case 'right':
            return canvas.width - 10; // 假设右边距为10px
        case 'start':
        case 'left':
        default:
            return 10; // 假设左边距为10px
    }
}

// 执行绘制方法
function calculateAfterDrugStaryYValue (index, drawingData, dragStartY, item, line = 1) {
    const NEXT_ROW_DATA = drawingData[index + 1]
    if (!NEXT_ROW_DATA) return false;

    if (index < drawingData.length - 1) {
        if (NEXT_ROW_DATA.position === "absolute") {
            if (line === 1) {
                return
            } else {
                dragStartY.value += ((parseInt(item.fontSize) + 10) * (line - 1));
                return;
            }
        };
        if (item.type === 'text' && item.wrapText) {
            // 如果是多行，则应该给前面的N行都加上高度，然后最后一行应该添加的高度，根据下一个要添加的元素添加
            dragStartY.value += ((parseInt(item.fontSize) + 10) * (line - 1));
        }
        if (NEXT_ROW_DATA.type === 'text') {
            dragStartY.value += parseInt(NEXT_ROW_DATA.fontSize, 10) + 10; // 更新 Y 坐标
        } else if (NEXT_ROW_DATA.type === 'barcode') {
            dragStartY.value += NEXT_ROW_DATA.height; // 更新 Y 坐标
        } else if (NEXT_ROW_DATA.type === 'image') {
            dragStartY.value += NEXT_ROW_DATA.height; // 更新 Y 坐标
        } else if (NEXT_ROW_DATA.type === 'solidLine' || NEXT_ROW_DATA.type === 'dashedLine') {
            dragStartY.value += 20; // 更新 Y 坐标
        }
    }
}

// 核心绘制方法
export function PrintJson2CanvasBase64(drawingData, canvasWidth, imageData) {
    if (!document) {
        throw new Error('请在浏览器环境运行!');
    }
    // console.log('drawingDatadrawingData', drawingData)
    // console.log('imageDataimageData', imageData)
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth; // 设定 Canvas 的宽度
    let canvasY = 0; // 初始化 Canvas 的 Y 坐标，预留标题和顶部边距
    const ctx = canvas.getContext('2d');
    // // 清空画布
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 将背景设置成白色
    // 初始化绘制列表
    const drawList = [];
    const dragStartY = { value: 0 }; // 初始化文字的 Y 坐标
    drawingData.forEach((item, index) => {
        const NEXT_ROW_DATA = drawingData[index + 1]
        const maxWidth = item.maxWidth || canvas.width;
        /**
         * 关于距离，大概要算的是下一行是什么，再进行添加，而不是直接添加本身的值。比如下一行是线，那就添加线的20，而不是文字的36.
         */
        ctx.fillStyle = "#231815"; // 默认文字颜色
        ctx.font = `${item.fontWeight} ${item.fontSize}px 宋体`; // 设置字体
        if (index === 0) {
            dragStartY.value = Number(item.fontSize) + 20;
            canvasY += dragStartY.value;
        }
        if (item.type === 'text') {
            drawList.push(() => {
                ctx.fillStyle = item.color || "#231815"; // 默认文字颜色
                ctx.font = `${item.fontWeight} ${item.fontSize}px 宋体`; // 设置字体
                ctx.textAlign = item.textAlign || 'start'; // 默认文本对齐方式
                let line;
                if (item.wrapText) {
                    // console.log('item.maxWidth', item.maxWidth)
                    // let maxWidth = item.maxWidth > 0 ? item.maxWidth : canvas.width;
                    line = wrapTextFn(ctx, item.content, calculateX(ctx, item, canvas), dragStartY.value, maxWidth, parseInt(item.fontSize, 10) + 10);
                } else {
                    ctx.fillText(item.content, calculateX(ctx, item, canvas), dragStartY.value);
                }
                calculateAfterDrugStaryYValue(index, drawingData, dragStartY, item, line);
            });
        }
        if (item.type === 'solidLine' || item.type === 'dashedLine') {
            drawList.push(() => {
                ctx.beginPath();
                ctx.moveTo(0, dragStartY.value); // 线条的起始位置
                ctx.lineTo(canvas.width, dragStartY.value); // 线条的结束位置

                ctx.strokeStyle = "#231815"; // 默认线条颜色
                ctx.lineWidth = item.lineWidth || 2; // 线条宽度

                // 根据线条类型设置样式
                if (item.type === 'solidLine') {
                    ctx.setLineDash([]); // 实线
                } else if (item.type === 'dashedLine') {
                    ctx.setLineDash([5, 5]); // 设置为虚线样式
                }

                ctx.stroke(); // 执行绘制
                calculateAfterDrugStaryYValue(index, drawingData, dragStartY, item);
            });
        }

        // if (item.type === 'barcode') {
        //     drawList.push(() => {
        //         const barcodeCanvas = document.createElement('canvas');
        //         barcodeCanvas.width = item.width; // 条形码的宽度
        //         barcodeCanvas.height = item.height; // 条形码的高度
        //         JsBarcode(barcodeCanvas, item.content, {
        //             format: "CODE128", // 假设条形码格式为CODE128
        //             lineColor: "#000", // 条形码颜色
        //             displayValue: true, // 根据需要决定是否在条形码下方显示文本值
        //             text: item.content, // 条形码下方的文本
        //             textMargin: item.textMargin, // 文本与条形码的间距
        //             width: 2,
        //             height: 40,
        //             background: "" // 条形码背景颜色
        //         });
        //         // 将条形码绘制到主canvas上
        //         if (item.position === "absolute") {
        //             ctx.drawImage(barcodeCanvas, canvas.width - barcodeCanvas.width, dragStartY.value - barcodeCanvas.height);
        //         } else {
        //             ctx.drawImage(barcodeCanvas, canvas.width / 2 - barcodeCanvas.width / 2, dragStartY.value - barcodeCanvas.height);
        //         }
        //         calculateAfterDrugStaryYValue(index, drawingData, dragStartY, item);
        //     })
        // }
        if (item.type === 'image') {
            // const img = new Image(); // 创建一个新的Image对象
            // img.src = item.src; // 设置图片源URL，开始加载图片=
            drawList.push(() => {
                // 在图片加载完成后执行绘制
                ctx.drawImage(imageData, canvas.width / 2 - item.width / 2, dragStartY.value - item.height, item.width, item.height);
                // 更新 startY 位置为图片下方，留出一些间距
                // dragStartY.value += item.height + 10; // 图片与注释之间留10px的间距

                // 绘制图片注释的文字信息（如果有）
                if (item.image_intro) {
                    ctx.font = "16px 宋体"; // 设置注释文字的字体大小和样式
                    ctx.textAlign = "center"; // 注释文字居中对齐
                    ctx.fillText(item.image_intro, canvas.width / 2, dragStartY.value); // 绘制注释文字
                }
                calculateAfterDrugStaryYValue(index, drawingData, dragStartY, item);
            })
        }
        // 计算canvasY的值
        if (index < drawingData.length - 1) {
            // if (NEXT_ROW_DATA.position === "absolute") return;
            let line = 1;
            if (item.wrapText) {
                line = calculateTextLines(ctx, item.content, maxWidth, item.fontSize);
            }
            if (NEXT_ROW_DATA.position === "absolute") {
                if (line === 1) {
                    return;
                } else {
                    if (item.type === 'text' && item.wrapText) {
                        // 如果是多行，则应该给前面的N行都加上高度，然后最后一行应该添加的高度，根据下一个要添加的元素添加
                        canvasY += ((parseInt(item.fontSize) + 10) * (line - 1));
                        return;
                    }
                }
            };
            if (item.type === 'text' && item.wrapText) {
                // 如果是多行，则应该给前面的N行都加上高度，然后最后一行应该添加的高度，根据下一个要添加的元素添加
                canvasY += ((parseInt(item.fontSize) + 10) * (line - 1));
            }
            if (NEXT_ROW_DATA.type === 'text') {
                canvasY += parseInt(NEXT_ROW_DATA.fontSize, 10) + 10; // 更新 Y 坐标
            } else if (NEXT_ROW_DATA.type === 'barcode') {
                canvasY += NEXT_ROW_DATA.height; // 更新 Y 坐标
            } else if (NEXT_ROW_DATA.type === 'image') {
                canvasY += NEXT_ROW_DATA.height; // 更新 Y 坐标
            } else if (NEXT_ROW_DATA.type === 'solidLine' || NEXT_ROW_DATA.type === 'dashedLine') {
                canvasY += 20; // 更新 Y 坐标
            }
        }
    });
    canvas.height = canvasY;
    drawList.forEach(draw => {
        draw();
    });
    return canvas.toDataURL();
}
