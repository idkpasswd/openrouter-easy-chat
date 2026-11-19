# Nemotron Chat（GitHub Codespaces 版）

一个简单的对话网页。后端跑在 GitHub Codespaces 里，请求路线：

浏览器 → `xxx.app.github.dev`（GitHub）→ Codespace 服务器 → OpenRouter

- 默认模型：`nvidia/nemotron-3.5-super-vl:free`
- 对话和网页里填的 Key 存在浏览器本地（localStorage）
- 零依赖，不需要 `npm install`

## 第一次使用

1. 新建一个 GitHub 仓库（可以设为 Private），把这个文件夹里的**所有文件**上传进去。
   注意 `.devcontainer` 是隐藏文件夹，上传时别漏了。
2. 在仓库页面点绿色的 **Code** → **Codespaces** → **Create codespace on main**。
3. 等一两分钟，网页版 VS Code 打开后，服务器会自动启动，并自动打开聊天网页。
   - 如果网页没有自动打开：点底部的 **端口 (Ports)** 标签，找到 3000，点地球图标。
4. 在网页左下角填 OpenRouter Key 就能聊天了。

## 以后使用

打开 https://github.com/codespaces ，点之前建的那个 codespace 继续即可。

- Codespace 默认闲置 30 分钟会自动停止，再打开就会重新启动。
- 个人免费账号每月有一定免费额度（以 GitHub 官网为准），不用时可以在 github.com/codespaces 手动停止。

## 可选：不想每次在网页里填 Key

在 GitHub → Settings → Codespaces → **Secrets** 里新建 `OPENROUTER_API_KEY`，
并把这个仓库加入可访问列表，然后重建 codespace。

## 文件

```
public/index.html                 前端页面
server.js                         后端：转发到 OpenRouter，流式返回
.devcontainer/devcontainer.json   Codespaces 配置（自动启动服务器、转发 3000 端口）
```

## 如果服务器没启动

在 VS Code 底部的终端里运行：

```
node server.js
```
