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

### 构建能力说明

| 目标 | 是否可在本公开仓完成 | 配置如何注入 |
|------|----------------------|--------------|
| 信任层编译（`npm run build`） | **可以**（默认 `@relay/core` stub） | 无 `build-config.json` 时自动从 `build-config.local.example.json` 生成；`prebuild` 写入 `shared/build-config.ts` |
| 完整安装包 / 换号能力 | **不可以单独完成** | 需私有仓 `lens-cursor-free-core` + `npm run link:core`；生产参数由维护者本地 `prepare-build-config prod` 或 CI Secret `BUILD_CONFIG_JSON` 注入 |
| GitHub Release（打 `v*` tag） | 维护者 CI | `RELAY_CORE_DEPLOY_KEY` + `BUILD_CONFIG_JSON`（见私有仓 `docs/RELEASE-SETUP.md`） |

仓库内**只提交模板**：`build-config.*.example.json` 与占位符版 `shared/build-config.ts`；真实 Hub / 购买链接等写在 **gitignore 的** `build-config.json` 或 CI Secret 中，构建时自动生成，勿手改 `shared/build-config.ts`。

### 本地开发（仅信任层 + stub）

```bash
npm ci
npm run build    # 自动 ensure 本地 example → build-config.json → gen-build-config
npm test
```

完整产品构建（**仅维护者**，需已授权访问私有核心仓库；发版与 Secrets 配置见私有仓文档）：

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
