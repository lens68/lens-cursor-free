# Relay — 开源信任层

Relay 桌面客户端的**可审计开源部分**：界面、Electron 壳、IPC 契约与设计系统。

## 本仓库包含什么

- `ui/` — 用户界面与样式
- `electron/preload.cjs` — 渲染进程可调用的 IPC 面（`window.cursorFree`）
- `electron/main.ts` — 窗口、托盘与生命周期（薄壳）
- `core-api/` — 与核心模块的**类型契约**（无商业逻辑实现）
- `shared/` — 产品文案、构建标志、Hub URL 解析等开放配置

## 本仓库不包含什么

以下能力在私有仓库 **`lens-cursor-free-core`** 中维护，不在此公开：

- 许可证校验与租约策略
- 换号 / 占号流水线
- Cursor 注入与设备指纹
- Hub 协议客户端实现

普通用户请从 [Releases](https://github.com/lens68/lens-cursor-free/releases) 下载安装包，无需自行构建完整产品。

## 为何开源

公开 UI 与 IPC 边界，便于社区审查「客户端对用户展示了什么、调用了哪些通道」，建立信任。商业核心保持私有，由维护者在 CI 中联合构建后发布二进制。

## 参与贡献

欢迎针对 `ui/`、`core-api/` 类型与文档的 Pull Request。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

### 本地开发（仅信任层 + stub）

```bash
npm ci
npm run build    # 默认使用 packages/core-stub，可编译 UI 与壳
npm test
```

维护者配置 GitHub Actions Secrets：见 [docs/RELEASE-SETUP.md](docs/RELEASE-SETUP.md)。

完整产品构建（**仅维护者**，需已授权访问私有核心仓库）：

```bash
git clone git@github.com:lens68/lens-cursor-free-core.git   # 与本作库同级目录
npm run link:core
npm run build
npm start
```

## 安全反馈

请通过 GitHub Security Advisories 或仓库 Issue 联系维护者（勿在公开 Issue 中粘贴许可证密钥或 Hub 管理凭据）。

## 许可证

[MIT](LICENSE)
