# 歪宝小窝 — 架构设计方案

## 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 全栈一体化，前后端同仓，部署简便 |
| 语言 | TypeScript | 类型安全，全栈统一语言 |
| UI 风格 | Tailwind CSS 定制"歪宝主题" | 以 animal-island-ui 为灵感，暖色圆润可爱风 |
| 数据库 | MySQL + Prisma ORM | 关系型数据，Prisma 提供类型安全的查询 |
| 缓存/会话 | Redis (可选) | Session 存储、数据缓存 |
| AI | DeepSeek API | 情绪分析、文案生成 |
| 认证 | JWT (access + refresh token) | 无状态认证，适合 Web |
| 部署 | Docker + Docker Compose | 一键部署 |

## 项目结构

```
waibao-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 认证页面组
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/             # 主应用（底部导航栏）
│   │   │   ├── page.tsx        # 今日首页
│   │   │   ├── weather/        # 天气
│   │   │   ├── period/         # 例假
│   │   │   ├── wishes/         # 心愿
│   │   │   └── profile/        # 我的/宝宝
│   │   ├── partner/            # 男朋友端
│   │   │   ├── page.tsx
│   │   │   ├── wishes/
│   │   │   └── comfort/
│   │   └── api/                # 后端 API
│   │       ├── auth/
│   │       ├── users/
│   │       ├── couples/
│   │       ├── diaries/
│   │       ├── weather/
│   │       ├── periods/
│   │       ├── todos/
│   │       ├── wishes/
│   │       ├── important-dates/
│   │       └── ai/
│   ├── components/             # 共享组件
│   │   ├── ui/                 # 基础 UI（歪宝风格）
│   │   ├── today/              # 今日页面组件
│   │   ├── weather/
│   │   ├── period/
│   │   ├── wishes/
│   │   └── layout/             # 导航栏、头部等
│   ├── lib/                    # 工具库
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── ai.ts               # DeepSeek 集成
│   │   ├── auth.ts             # JWT 认证
│   │   └── utils.ts            # 通用工具
│   ├── hooks/                  # 自定义 Hooks
│   ├── types/                  # TypeScript 类型
│   └── styles/                 # 全局样式
├── prisma/
│   └── schema.prisma           # 数据库模型
├── public/                     # 静态资源
├── docker-compose.yml          # MySQL + App
├── .env.local                  # 环境变量
├── tailwind.config.ts
└── next.config.ts
```

## 数据库设计 (Prisma Schema)

### 用户表 User
- id, email, password, nickname, avatar, birthday, gender, role (waibao/partner), mbti, loveNickname, comfortStyle, createdAt, updatedAt

### 情侣绑定表 Couple
- id, userAId, userBId, bindCode, loveStartDate, status (active/unbound), createdAt

### 重要日期表 ImportantDate
- id, userId, coupleId, title, date, repeatType (yearly/none), remindDaysBefore, showOnHome, notifyPartner, createdAt

### 日记表 Diary
- id, userId, date, content, moodScore, aiComfortText, emotionLevel, emotionType, notifyPartner, createdAt

### 天气记录表 WeatherRecord
- id, userId, city, temperature, weather, rainProbability, clothingAdvice, skincareAdvice, createdAt

### 经期记录表 PeriodRecord
- id, userId, startDate, endDate, painLevel, mood, flowLevel, note, createdAt

### 待办表 Todo
- id, userId, title, description, dueDate, priority, completed, repeatType, category, completedAt, createdAt

### 心愿表 Wish
- id, userId, title, description, imageUrl, category, priority, progress, status (wanting/claimed/preparing/completed/archived), claimedById, createdAt

### 衣橱表 WardrobeItem
- id, userId, imageUrl, type, color, style, season, createdAt

### 推送通知表 Notification
- id, userId, targetUserId, type, content, read, createdAt

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| / | 今日首页 | 问候、恋爱天数、重要日子、天气、待办、心情 |
| /weather | 天气详情 | 今日+三日天气、穿衣护肤建议、OOTD |
| /period | 例假 | 日历、记录、预测、建议 |
| /wishes | 心愿 | 心愿列表、新增、进度、心愿墙 |
| /profile | 我的/宝宝 | 个人资料、重要日期、绑定、隐私设置 |
| /partner | 男朋友首页 | 歪宝状态、今日建议、心愿提醒 |
| /partner/wishes | 男朋友心愿 | 查看、认领心愿 |
| /partner/comfort | 哄哄 | 一键哄哄、发送关心、AI话术 |
| /login | 登录 | |
| /register | 注册 | |

## UI 主题设计（歪宝风格）

基于 animal-island-ui 的灵感，自定义 Tailwind 主题：

### 颜色
- **主色调**：#FF9B9B (暖粉红) — 温柔、可爱
- **辅助色**：#FFD93D (暖黄) — 温暖、阳光
- **强调色**：#6BCB77 (草绿) — 自然、生机
- **背景色**：#FFF8F0 (米白) — 柔和
- **卡片色**：#FFFFFF (白) + 轻微阴影
- **文字色**：#4A4A4A (深灰) — 不刺眼

### 风格特征
- 超大圆角 (rounded-2xl/3xl)
- 柔和阴影 (shadow-soft)
- 圆润按钮
- 可爱图标
- 温暖渐变
- 毛玻璃效果 (backdrop-blur)

## DeepSeek AI 集成

### API 用途
1. **情绪分析**：分析日记文本，输出情绪等级和类型
2. **安慰文案**：根据情绪生成暖心安慰
3. **天气建议**：生成穿衣、护肤文案
4. **经期建议**：生成经期关怀文案
5. **男朋友话术**：生成关心话术
6. **OOTD 推荐**：根据天气和衣橱推荐穿搭

### API 调用格式 (DeepSeek Chat)
```typescript
POST https://api.deepseek.com/chat/completions
{
  model: "deepseek-chat",
  messages: [...],
  temperature: 0.7
}
```

## 开发路线图 (MVP)

按以下顺序实现：

1. **项目初始化** — Next.js + Tailwind + Prisma + Docker
2. **数据库模型** — 完整 Prisma Schema + 迁移
3. **用户认证** — 注册/登录/ JWT
4. **情侣绑定** — 邀请码绑定
5. **个人中心** — 资料编辑 + 重要日期
6. **今日首页** — 问候 + 恋爱天数 + 重要日子卡片 + 天气简卡 + 待办 + 心情
7. **日记 + AI 情绪分析** — DeepSeek 集成
8. **天气模块** — 详情页 + 建议
9. **待办模块** — 增删改查
10. **心愿模块** — 心愿墙 + 认领
11. **例假模块** — 日历 + 记录
12. **男朋友端** — 状态查看 + 一键哄哄
13. **隐私设置** — 开关控制
14. **Docker 部署** — 容器化配置
