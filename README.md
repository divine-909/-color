# Split Poster Studio

一个纯原生 HTML / CSS / JavaScript 的极简影像海报工具。

## 功能

- 图片上传后自动提取 6 个主色
- 顶部文案区支持纯色或双色情况下的线性渐变背景
- 底部图片支持拖拽移动、滚轮缩放、双指缩放
- 内置 `Time/Loc`、`Color Code`、`Poetry` 三种模板
- 支持 Serif / Sans-serif 字体切换
- 支持 EyeDropper 吸管取色
- 支持导出 2x PNG

## 运行方式

直接在浏览器中打开 [index.html](./index.html) 即可。

如果浏览器对本地文件的某些 API 限制较严，建议使用任意静态服务器打开，例如：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 依赖

- `ColorThief`
- `html2canvas`

当前版本通过 CDN 引入，适合快速原型与静态部署。
