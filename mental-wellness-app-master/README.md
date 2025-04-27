# 心理健康支持应用

一个基于现代技术的心理健康支持应用程序，帮助用户更好地理解和追踪自己的情绪状态。

## 功能特点

### 1. 情绪追踪（Mood Tracker）
- 记录和追踪日常情绪状态
- 情绪历史记录和趋势分析
- 个性化情绪报告

### 2. 主动意识（Active Awareness）
- 实时面部情绪检测
- 多维度情绪分析
- 情绪状态可视化

### 3. 语音聊天（Voice Chat）
- 语音交互支持
- 智能对话系统
- 个性化心理支持

### 4. 资源中心（Resources）
- 心理健康教育资源
- 应对策略指南
- 专业支持信息

## 技术栈

- **前端框架**: React + TypeScript
- **构建工具**: Vite
- **机器学习**: TensorFlow.js
- **面部检测**: MediaPipe
- **样式管理**: Styled Components
- **路由管理**: React Router

## 开发环境设置

### 前提条件
- Node.js (推荐 v16 或更高版本)
- npm 或 yarn
- Git

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/Yardang/mental-wellness-app.git
cd mental-wellness-app
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 项目结构

```
mental-wellness-app/
├── src/
│   ├── components/      # 共享组件
│   ├── features/        # 功能模块
│   │   ├── active-awareness/  # 主动意识功能
│   │   ├── mood-tracker/      # 情绪追踪功能
│   │   ├── voice-chat/        # 语音聊天功能
│   │   ├── resources/         # 资源中心
│   │   └── profile/           # 个人资料
│   ├── App.tsx
│   └── index.tsx
├── public/              # 静态资源
├── docs/                # 项目文档
└── scripts/             # 工具脚本
```

## 开发指南

### 代码规范
- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 配置
- 使用函数式组件和 Hooks
- 保持组件单一职责

### 提交规范
- 使用清晰的提交信息
- 遵循约定式提交规范
- 保持提交的原子性

### 测试要求
- 单元测试覆盖核心功能
- 集成测试确保模块协作
- 性能测试关注关键路径

## 已知问题

1. 面部检测
   - WASM 文件加载问题
   - 初始化超时问题
   - 文件权限问题

2. 语音功能
   - 音频处理性能待优化
   - 网络连接稳定性
   - 错误处理机制待完善

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 文档

- [项目架构](./docs/architecture.mermaid)
- [开发日志](./docs/development_log.md)
- [技术文档](./docs/technical.md)
- [项目交接文档](./docs/project_handover.md)

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：[刘雅丹]
- 邮箱：[yardanglau@outlook.com]
- 项目链接：https://github.com/Yardang/mental-wellness-app
