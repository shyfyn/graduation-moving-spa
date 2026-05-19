# 百时教育化学反馈助手

基于 `React 18 + Vite + Tailwind CSS` 的轻量前端工具，用于快速整理课堂学情、选择化学考点并生成面向家长的反馈文案。

## 当前能力

- 常用学生保存与快速切换
- 分模块化学考点检索、勾选、自定义补充
- 课堂亮点、学情问题、作业规划录入
- 按学习阶段、课型、篇幅生成反馈
- 本地自动保存当前输入内容

## 本地运行

```powershell
npm install
npm run dev -- --host
```

## 构建

```powershell
npm run build
npm run preview -- --host
```

## 说明

- 站点当前通过前端直接请求 DeepSeek API
- 生产环境需要配置 `VITE_DEEPSEEK_API_KEY`
- 如需长期稳定使用，建议后续改为后端代理，避免在前端暴露密钥
