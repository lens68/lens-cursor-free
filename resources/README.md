# Relay desktop resources

- `icon-source.svg` — 256×256 主图源（圆角渐变底 + 字形 R），编辑后执行 `npm run icon`。
- `icon.ico` — Windows / NSIS 用（含 16–256 多尺寸）。生成：`npm run icon`（`sharp` 渲染 SVG → `to-ico`）。
- 品牌色：`#0969da` / `#0550ae`（与 [`ui/styles/tokens.css`](../ui/styles/tokens.css) 一致）。
