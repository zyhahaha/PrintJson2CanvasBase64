const w = require("jsbarcode");
function g(i, c, f, n, s, t) {
  const o = [], l = "";
  let e = "";
  for (let r = 0; r < c.length; r++) {
    const a = c[r];
    i.measureText(e + a + l).width < s && a !== `
` ? e += a + l : (a === `
` && (e += a, r++), o.push(e), e = a + l);
  }
  return o.push(e), o.forEach((r) => {
    i.fillText(r.trim(), f, n), n += t;
  }), o.length;
}
function y(i, c, f, n) {
  const s = [], t = "";
  let o = "";
  i.font = `${n}px 宋体`;
  for (let l = 0; l < c.length; l++) {
    const e = c[l];
    i.measureText(o + e + t).width < f && e !== `
` ? o += e + t : (e === `
` && (o += e, l++), s.push(o), o = e + t);
  }
  return s.push(o), s.length;
}
function d(i, c, f) {
  switch (c.textAlign) {
    case "center":
      return f.width / 2;
    case "end":
    case "right":
      return f.width - 10;
    case "start":
    case "left":
    default:
      return 10;
  }
}
function u(i, c, f, n, s = 1) {
  const t = c[i + 1];
  if (!t)
    return !1;
  if (i < c.length - 1) {
    if (t.position === "absolute") {
      if (s === 1)
        return;
      f.value += (parseInt(n.fontSize) + 10) * (s - 1);
      return;
    }
    n.type === "text" && n.wrapText && (f.value += (parseInt(n.fontSize) + 10) * (s - 1)), t.type === "text" ? f.value += parseInt(t.fontSize, 10) + 10 : t.type === "barcode" || t.type === "image" ? f.value += t.height : (t.type === "solidLine" || t.type === "dashedLine") && (f.value += 20);
  }
}
function x(i, c, f) {
  if (!document)
    throw new Error("请在浏览器环境运行!");
  const n = document.createElement("canvas");
  n.width = c;
  let s = 0;
  const t = n.getContext("2d");
  t.fillStyle = "white", t.fillRect(0, 0, n.width, n.height);
  const o = [], l = { value: 0 };
  return i.forEach((e, r) => {
    const a = i[r + 1], p = e.maxWidth || n.width;
    if (t.fillStyle = "#231815", t.font = `${e.fontWeight} ${e.fontSize}px 宋体`, r === 0 && (l.value = Number(e.fontSize) + 20, s += l.value), e.type === "text" && o.push(() => {
      t.fillStyle = e.color || "#231815", t.font = `${e.fontWeight} ${e.fontSize}px 宋体`, t.textAlign = e.textAlign || "start";
      let h;
      e.wrapText ? h = g(t, e.content, d(t, e, n), l.value, p, parseInt(e.fontSize, 10) + 10) : t.fillText(e.content, d(t, e, n), l.value), u(r, i, l, e, h);
    }), (e.type === "solidLine" || e.type === "dashedLine") && o.push(() => {
      t.beginPath(), t.moveTo(0, l.value), t.lineTo(n.width, l.value), t.strokeStyle = "#231815", t.lineWidth = e.lineWidth || 2, e.type === "solidLine" ? t.setLineDash([]) : e.type === "dashedLine" && t.setLineDash([5, 5]), t.stroke(), u(r, i, l, e);
    }), e.type === "barcode" && o.push(() => {
      const h = document.createElement("canvas");
      h.width = e.width, h.height = e.height, w(h, e.content, {
        format: "CODE128",
        // 假设条形码格式为CODE128
        lineColor: "#000",
        // 条形码颜色
        displayValue: !0,
        // 根据需要决定是否在条形码下方显示文本值
        text: e.content,
        // 条形码下方的文本
        textMargin: e.textMargin,
        // 文本与条形码的间距
        width: 2,
        height: 40,
        background: ""
        // 条形码背景颜色
      }), e.position === "absolute" ? t.drawImage(h, n.width - h.width, l.value - h.height) : t.drawImage(h, n.width / 2 - h.width / 2, l.value - h.height), u(r, i, l, e);
    }), e.type === "image" && o.push(() => {
      t.drawImage(f, n.width / 2 - e.width / 2, l.value - e.height, e.width, e.height), e.image_intro && (t.font = "16px 宋体", t.textAlign = "center", t.fillText(e.image_intro, n.width / 2, l.value)), u(r, i, l, e);
    }), r < i.length - 1) {
      let h = 1;
      if (e.wrapText && (h = y(t, e.content, p, e.fontSize)), a.position === "absolute") {
        if (h === 1)
          return;
        if (e.type === "text" && e.wrapText) {
          s += (parseInt(e.fontSize) + 10) * (h - 1);
          return;
        }
      }
      e.type === "text" && e.wrapText && (s += (parseInt(e.fontSize) + 10) * (h - 1)), a.type === "text" ? s += parseInt(a.fontSize, 10) + 10 : a.type === "barcode" || a.type === "image" ? s += a.height : (a.type === "solidLine" || a.type === "dashedLine") && (s += 20);
    }
  }), n.height = s, o.forEach((e) => {
    e();
  }), n.toDataURL();
}
export {
  x as PrintJson2CanvasBase64
};
