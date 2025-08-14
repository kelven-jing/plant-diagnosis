# 植物诊断-qsyx（Next.js）

## 开发
1. 复制 `.env.example` 为 `.env.local`，填写：
   - `COZE_API_KEY`
   - `COZE_SPACE_ID`
   - `COZE_WORKFLOW_ID`
2. `npm i`
3. `npm run dev` 打开 http://localhost:3000

## 部署（Vercel）
1. 在 Vercel 项目里添加同名环境变量（Production/Preview/Development 全部勾选）。
2. 直接部署。**无需 `node-fetch`**，Node18 自带 `fetch`。
3. 构建失败如提示 `node-fetch`/ESM，说明项目里仍残留相关依赖或 `require`，删除即可。

## 前端/后端约定
- 前端上传图片 -> 读为 **dataURL(base64)** 传给 `/api/diagnose`。
- 后端会组装为工作流所需的：
  ```json
  {
    "space_id": "...",
    "workflow_id": "...",
    "parameters": {
      "picture": { "type": "image_base64", "mime_type": "image/png", "data": "..." },
      "position": "leaf|stem|root|fruit|auto"
    }
  }
