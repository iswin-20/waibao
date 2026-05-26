# 歪宝小窝 — 启动指南

## 前置要求

- Node.js >= 18（推荐 22）
- MySQL >= 8.0（本地或 Docker）
- DeepSeek API Key（可选，无 key 时自动走模拟数据）

## 快速启动

### 方式一：本地启动（推荐）

#### 1. 安装依赖

```bash
cd E:\py_code\waiwai
npm install
```

> 如果网络慢，可使用镜像源：`npm install --registry https://registry.npmmirror.com`

#### 2. 配置数据库

确保 MySQL 已启动，然后执行：

```bash
# 创建数据库（连上 MySQL 后执行）
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS waibao_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 生成 Prisma 客户端
npx prisma generate

# 推送 Schema 到数据库（建表）
npx prisma db push

# 填充示例数据（可选）
npx tsx prisma/seed.ts
```

#### 3. 启动应用

```bash
npm run dev
```

浏览器打开 http://localhost:3000

### 方式二：Docker 启动（需要 Docker Desktop）

```bash
cd E:\py_code\waiwai

# 启动 MySQL + App
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

浏览器打开 http://localhost:3000

> 首次启动后需要手动执行 `npx prisma db push` 建表和 `npx tsx prisma/seed.ts` 填充数据

---

## 配置说明

### 环境变量（.env.local）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | MySQL 连接地址 | `mysql://waibao:waibao123@localhost:3306/waibao_db` |
| `JWT_SECRET` | JWT 签名密钥 | 开发环境有默认值，生产环境必须修改 |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 留空则走模拟数据 |

### DeepSeek AI 配置（可选）

如需使用真实的 AI 情绪分析，在 `.env.local` 中填入：

```
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

不配置也不影响运行，系统会自动使用模拟 AI 响应。

---

## 测试账号（种子数据）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 歪宝 | waibao@test.com | 123456 |
| 男朋友 | partner@test.com | 123456 |

邀请码：`WYTEST01`

---

## 项目结构

```
E:\py_code\waiwai\
├── prisma/              # 数据库模型 + 种子数据
├── src/
│   ├── app/
│   │   ├── (auth)/      # 登录/注册页面
│   │   ├── (main)/      # 主应用页面（底部导航）
│   │   │   ├── page.tsx           # 今日首页
│   │   │   ├── weather/           # 天气详情
│   │   │   ├── period/            # 例假日历
│   │   │   ├── wishes/            # 心愿清单
│   │   │   ├── diary/             # 日记详情
│   │   │   ├── partner/           # 男朋友端
│   │   │   └── profile/           # 个人中心
│   │   └── api/         # 25 个后端 API
│   ├── components/      # 21 个组件
│   │   ├── ui/          # 基础 UI 组件库
│   │   ├── today/       # 今日首页组件
│   │   ├── partner/     # 男朋友端组件
│   │   └── layout/      # 布局组件
│   ├── lib/             # 核心工具库
│   ├── types/           # TypeScript 类型
│   ├── contexts/        # React Context
│   └── middleware.ts    # API 认证中间件
├── docker-compose.yml   # Docker 一键部署
├── Dockerfile           # 应用镜像
├── tailwind.config.ts   # 歪宝主题配置
└── package.json
```

---

## 常用命令

```bash
# 开发
npm run dev           # 启动开发服务器
npm run lint          # 代码检查
npx prisma studio     # 数据库可视化

# 数据库
npx prisma generate   # 生成 Prisma 客户端
npx prisma db push    # 同步 Schema 到数据库
npx prisma migrate dev # 创建迁移
npx tsx prisma/seed.ts # 填充示例数据

# 构建
npm run build         # 生产构建
npm run start         # 启动生产服务器

# Docker
docker-compose up -d  # 启动服务
docker-compose down   # 停止服务
```
