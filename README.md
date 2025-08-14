# AI 植物急诊室

这是一个基于 **Next.js** 和 **Coze 工作流** 的 AI 植物诊断网站。
用户可以上传植物照片并输入所在城市，系统会调用 Coze 工作流进行分析并返回诊断结果。

---

## 🚀 功能
- 前端简洁绿色风格
- 支持本地图片文件上传（非 URL）
- 将图片转换为 Base64 并传递给 Coze 工作流
- 后端 API 负责安全调用 Coze API（隐藏密钥）
- 环境变量存储 API Key、工作流 ID、空间 ID

---

## 📦 环境变量
在项目根目录创建 `.env.local` 文件，内容如下：

```env
COZE_API_KEY=你的_Coze_API_Key
COZE_WORKFLOW_ID=你的_Coze_工作流_ID
COZE_SPACE_ID=你的_Coze_空间_ID
