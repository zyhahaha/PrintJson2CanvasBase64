function w(i, r, h, n, s, t) {
  const o = [], l = "";
  let e = "";
  for (let a = 0; a < r.length; a++) {
    const f = r[a];
    i.measureText(e + f + l).width < s && f !== `
` ? e += f + l : (f === `
` && (e += f, a++), o.push(e), e = f + l);
  }
  return o.push(e), o.forEach((a) => {
    i.fillText(a.trim(), h, n), n += t;
  }), o.length;
}
function y(i, r, h, n) {
  const s = [], t = "";
  let o = "";
  i.font = `${n}px 宋体`;
  for (let l = 0; l < r.length; l++) {
    const e = r[l];
    i.measureText(o + e + t).width < h && e !== `
` ? o += e + t : (e === `
` && (o += e, l++), s.push(o), o = e + t);
  }
  return s.push(o), s.length;
}
function d(i, r, h) {
  switch (r.textAlign) {
    case "center":
      return h.width / 2;
    case "end":
    case "right":
      return h.width - 10;
    case "start":
    case "left":
    default:
      return 10;
  }
}
function p(i, r, h, n, s = 1) {
  const t = r[i + 1];
  if (!t)
    return !1;
  if (i < r.length - 1) {
    if (t.position === "absolute") {
      if (s === 1)
        return;
      h.value += (parseInt(n.fontSize) + 10) * (s - 1);
      return;
    }
    n.type === "text" && n.wrapText && (h.value += (parseInt(n.fontSize) + 10) * (s - 1)), t.type === "text" ? h.value += parseInt(t.fontSize, 10) + 10 : t.type === "barcode" || t.type === "image" ? h.value += t.height : (t.type === "solidLine" || t.type === "dashedLine") && (h.value += 20);
  }
}
function x(i, r, h) {
  if (!document)
    throw new Error("请在浏览器环境运行!");
  const n = document.createElement("canvas");
  n.width = r;
  let s = 0;
  const t = n.getContext("2d");
  t.fillStyle = "white", t.fillRect(0, 0, n.width, n.height);
  const o = [], l = { value: 0 };
  return i.forEach((e, a) => {
    const f = i[a + 1], u = e.maxWidth || n.width;
    if (t.fillStyle = "#231815", t.font = `${e.fontWeight} ${e.fontSize}px 宋体`, a === 0 && (l.value = Number(e.fontSize) + 20, s += l.value), e.type === "text" && o.push(() => {
      t.fillStyle = e.color || "#231815", t.font = `${e.fontWeight} ${e.fontSize}px 宋体`, t.textAlign = e.textAlign || "start";
      let c;
      e.wrapText ? c = w(t, e.content, d(t, e, n), l.value, u, parseInt(e.fontSize, 10) + 10) : t.fillText(e.content, d(t, e, n), l.value), p(a, i, l, e, c);
    }), (e.type === "solidLine" || e.type === "dashedLine") && o.push(() => {
      t.beginPath(), t.moveTo(0, l.value), t.lineTo(n.width, l.value), t.strokeStyle = "#231815", t.lineWidth = e.lineWidth || 2, e.type === "solidLine" ? t.setLineDash([]) : e.type === "dashedLine" && t.setLineDash([5, 5]), t.stroke(), p(a, i, l, e);
    }), e.type === "image" && o.push(() => {
      t.drawImage(h, n.width / 2 - e.width / 2, l.value - e.height, e.width, e.height), e.image_intro && (t.font = "16px 宋体", t.textAlign = "center", t.fillText(e.image_intro, n.width / 2, l.value)), p(a, i, l, e);
    }), a < i.length - 1) {
      let c = 1;
      if (e.wrapText && (c = y(t, e.content, u, e.fontSize)), f.position === "absolute") {
        if (c === 1)
          return;
        if (e.type === "text" && e.wrapText) {
          s += (parseInt(e.fontSize) + 10) * (c - 1);
          return;
        }
      }
      e.type === "text" && e.wrapText && (s += (parseInt(e.fontSize) + 10) * (c - 1)), f.type === "text" ? s += parseInt(f.fontSize, 10) + 10 : f.type === "barcode" || f.type === "image" ? s += f.height : (f.type === "solidLine" || f.type === "dashedLine") && (s += 20);
    }
  }), n.height = s, o.forEach((e) => {
    e();
  }), n.toDataURL();
}
export {
  x as PrintJson2CanvasBase64
};
