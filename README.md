# 毕业搬家行李管理系统

基于 `React 18 + TypeScript + Vite` 的本地优先单页面应用，用于毕业跨省搬家时管理物品、箱子、装箱进度、二维码和本地备份。

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Dexie.js + IndexedDB
- React Hook Form + Zod
- Lucide React
- react-qr-code + qrcode
- 手工接入 PWA（manifest + service worker）

## 本地运行

```powershell
npm install
npm run dev -- --host
```

## 推荐的手机安装方式

为了更稳定地添加到手机桌面，建议使用预览模式：

```powershell
npm run build
npm run preview -- --host
```

然后在手机浏览器打开终端输出的局域网地址。

- Android Chrome：浏览器菜单中选择“添加到主屏幕”或“安装应用”
- iPhone Safari：点击分享按钮，选择“添加到主屏幕”

## 目录结构

```text
src/
├─ app/              路由与整体布局
├─ components/       通用组件、物品组件、箱子组件、装箱组件
├─ constants/        枚举、主题、演示数据
├─ db/               Dexie 与仓储层
├─ hooks/            初始化、筛选、toast、confirm
├─ pages/            各业务页面
├─ schemas/          Zod 校验
├─ store/            Zustand 状态模块
├─ styles/           全局样式
├─ types/            核心类型定义
└─ utils/            业务规则、格式化、导入导出等工具
```

## 当前实现

- `/dashboard` 总览与统计
- `/items` 物品管理、筛选、搜索、批量更新
- `/boxes` 箱子管理
- `/boxes/:id` 箱子详情、状态流转、物流录入、二维码展示
- `/packing` 装箱工作台
- `/checklist` 搬家耗材清单
- `/settings` JSON 导入导出、初始化演示数据、清空数据、PWA 安装提示

## 说明

- 数据保存在当前浏览器的 IndexedDB 中
- 不依赖后端
- 不同设备或不同浏览器之间不会自动同步
- 重要数据请通过“设置”页导出 JSON 备份
