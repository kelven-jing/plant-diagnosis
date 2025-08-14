# Coze Workflow Uploader (Next.js)

将本地图片上传到 Coze 文件 API，拿到 `file_id`，再把 `picture`（Image 类型）和 `position`（String 类型）传入 Coze 工作流。

## 快速开始

1. 克隆或拷贝本项目代码。
2. 复制 `.env.example` 为 `.env.local`，填入你的：
   - `COZE_API_KEY`
   - `COZE_WORKFLOW_ID`
   - `COZE_SPACE_ID`
3. 安装依赖并运行：
   ```bash
   npm i
   npm run dev

