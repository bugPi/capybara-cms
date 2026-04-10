# Capybara CMS

一个现代化的内容管理系统，基于 Next.js 构建。

## 技术栈

- **框架**: [Next.js 16](https://nextjs.org) - React 全栈框架
- **前端**: [React 19](https://react.dev) - 用户界面库
- **样式**: [Tailwind CSS 4](https://tailwindcss.com) - 原子化 CSS 框架
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com) - 可定制的 React 组件库
- **图标**: [Lucide](https://lucide.dev) - 精美的开源图标库
- **语言**: [TypeScript](https://www.typescriptlang.org) - 类型安全的 JavaScript 超集
- **包管理**: [pnpm](https://pnpm.io) - 快速、节省磁盘空间的包管理器

## 开始使用

### 环境要求

- Node.js 18.17 或更高版本
- pnpm 8.0 或更高版本

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
capybara-cms/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
│   └── ui/             # shadcn/ui 组件
├── lib/                 # 工具函数和共享逻辑
├── public/              # 静态资源文件
└── ...配置文件
```

## 开发

### 代码检查

```bash
pnpm lint
```

### 添加 shadcn/ui 组件

```bash
pnpm dlx shadcn add <component-name>
```

## 部署

### Vercel 部署

最简单的部署方式是使用 [Vercel Platform](https://vercel.com/new)，由 Next.js 的创作者提供。

查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详情。

## 文档资源

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API
- [React 文档](https://react.dev) - 学习 React
- [Tailwind CSS 文档](https://tailwindcss.com/docs) - 探索 Tailwind CSS
- [shadcn/ui 文档](https://ui.shadcn.com/docs) - 组件使用指南

## 许可证

MIT License