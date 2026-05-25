# 公开仓发版 Secrets 配置（维护者）

在 GitHub 配置以下项后，[`release.yml`](../.github/workflows/release.yml) 才能在打 `v*` tag 时拉取私有核心并构建安装包。

仓库：**Settings → Secrets and variables → Actions → New repository secret**

## 1. `RELAY_CORE_DEPLOY_KEY`（必填）

用于 Actions 以只读方式 checkout **`lens68/lens-cursor-free-core`**。

### 生成专用 Deploy Key（推荐，与日常 push 密钥分开）

在本机 PowerShell（路径按你本机调整，**不要**写进公开文档）：

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\relay_core_deploy" -N '""' -C "lens-cursor-free-ci"
```

1. 复制 **公钥** 内容（`relay_core_deploy.pub`）
2. 打开 https://github.com/lens68/lens-cursor-free-core/settings/keys
3. **Add deploy key**
   - Title：`lens-cursor-free-ci`
   - Key：粘贴公钥
   - **勾选 Allow write access：不要勾**（只读）
4. 复制 **私钥** 全文（`relay_core_deploy` 无 `.pub` 的文件）
5. 打开 https://github.com/lens68/lens-cursor-free/settings/secrets/actions
6. **New repository secret**
   - Name：`RELAY_CORE_DEPLOY_KEY`
   - Secret：粘贴私钥全文

## 2. `BUILD_CONFIG_JSON`（发版必填）

生产环境 `build-config.json` 的 **一整段 JSON 字符串**（勿提交到 git）。

示例结构（值请换成你的生产配置）：

```json
{
  "defaultHubUrl": "https://your-hub.example.com",
  "autoStartupRotate": true,
  "productDisplayName": "Relay",
  "productTagline": "账号切换助手",
  "supportUrl": "https://your-support.example.com",
  "purchaseUrl": "https://your-shop.example.com/licenses",
  "enableOpsTools": false
}
```

在公开仓 Secrets 中新建：

- Name：`BUILD_CONFIG_JSON`
- Secret：将上述 JSON **压缩为一行**或保持格式化均可（workflow 会 `JSON.parse`）

本地可先验证：

```powershell
$env:BUILD_CONFIG_JSON = Get-Content .\build-config.prod.example.json -Raw
node scripts/write-build-config-from-secret.mjs
```

## 3. 可选：`GITHUB_TOKEN`

默认 `permissions: contents: write` 通常足够创建 Release。若上传附件失败，再检查仓库 **Settings → Actions → General → Workflow permissions** 设为 **Read and write permissions**。

## 发版流程简述

1. 合并并推送 **私有仓** `main`
2. 在公开仓本地：`node scripts/update-core-lock.mjs` → 提交 `core.lock.json`
3. 推送公开仓 `main`，打 tag：`git tag v0.1.9 && git push origin v0.1.9`
4. 在 **Actions** 查看 **Release** workflow；成功后到 **Releases** 下载 `Relay-Setup-*.exe`

手动触发：Actions → Release → **Run workflow**（可填 `core_ref` 覆盖锁文件）。

## Fork PR 说明

来自 Fork 的 PR **不会**使用上述 Secrets，仅跑 stub 的 `ci.yml`，这是预期行为。
