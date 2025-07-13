# 部署指南：GitHub + Cloudflare Pages

## 概述
本指南将帮助您将 Geopolitical Intelligence Engine 部署到 GitHub 和 Cloudflare Pages。

## 步骤 1：GitHub 仓库已准备就绪

✅ 您的 GitHub 仓库已创建：[https://github.com/Suan199812/geointel-engine](https://github.com/Suan199812/geointel-engine)

## 步骤 2：代码已推送到 GitHub

✅ 项目代码已成功推送到您的 GitHub 仓库

## 步骤 3：设置 Cloudflare Pages

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在左侧菜单中点击 "Pages"
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 授权 Cloudflare 访问您的 GitHub 账户
6. 选择您的 `geointel-engine` 仓库
7. 配置构建设置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (留空)
8. 点击 "Save and Deploy"

## 步骤 4：配置环境变量

在 Cloudflare Pages 项目设置中：

1. 进入您的 Pages 项目
2. 点击 "Settings" 标签
3. 在左侧菜单中点击 "Environment variables"
4. 添加以下环境变量：
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyCGDMYZ0eduT7P_xF3bevTxCDezPsSQzpY`
   - **Environment**: `Production`
5. 点击 "Save"

## 步骤 5：重新部署

1. 在 Cloudflare Pages 项目中点击 "Deployments" 标签
2. 点击 "Retry deployment" 或 "Redeploy"
3. 等待构建完成

## 步骤 6：自定义域名（可选）

1. 在 Pages 项目设置中点击 "Custom domains"
2. 添加您想要的域名
3. 按照 Cloudflare 的指示配置 DNS

## 故障排除

### 构建失败
- 检查 `package.json` 中的依赖是否正确
- 确保所有 TypeScript 错误都已修复
- 查看 Cloudflare Pages 的构建日志

### API 密钥问题
- 确保环境变量名称正确：`GEMINI_API_KEY`
- 检查 API 密钥是否有效
- 确保环境变量已设置为 "Production" 环境

### 依赖问题
如果遇到依赖问题，可以尝试：
```bash
npm install --legacy-peer-deps
```

## 本地开发

要在本地运行项目：

```bash
# 克隆仓库
git clone https://github.com/Suan199812/geointel-engine.git
cd geointel-engine

# 安装依赖
npm install

# 创建 .env 文件并添加 API 密钥
echo "GEMINI_API_KEY=AIzaSyCGDMYZ0eduT7P_xF3bevTxCDezPsSQzpY" > .env

# 启动开发服务器
npm run dev
```

## 更新部署

每次您推送代码到 GitHub 的 main 分支时，Cloudflare Pages 都会自动重新部署您的应用。

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## 项目仓库

- **GitHub**: [https://github.com/Suan199812/geointel-engine](https://github.com/Suan199812/geointel-engine)
- **Cloudflare Pages**: 部署完成后将提供链接 