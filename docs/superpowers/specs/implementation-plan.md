# 歪宝小窝 — 实施计划

## Task Breakdown

### Task 1: 项目初始化
**文件**: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`, `.env.local`, `.gitignore`, `docker-compose.yml`, `Dockerfile`
**操作**: 
- 创建 Next.js 项目结构
- 配置 Tailwind 主题（歪宝配色）
- 添加 Prisma, JWT, bcrypt 等依赖
- 配置 Docker (MySQL + App)
- 创建 `.env.local` 模板
**验证**: `npm run dev` 能正常启动

### Task 2: 全局样式 + 布局组件
**文件**:
- `src/app/globals.css` — 全局样式、Tailwind base
- `src/app/layout.tsx` — 根布局
- `src/components/layout/BottomNav.tsx` — 底部导航栏
- `src/components/layout/MainLayout.tsx` — 主布局（包裹 BottomNav）
- `src/components/ui/` — 基础 UI 组件 (Button, Card, Badge, Input, Modal)
**操作**:
- 实现歪宝风格的 Tailwind 主题色
- 实现底部导航（今日/天气/例假/心愿/我的）
- 创建基础 UI 组件库
**验证**: 页面显示底部导航，点击切换路由

### Task 3: 数据库 Prisma Schema
**文件**: `prisma/schema.prisma`, `src/lib/prisma.ts`
**操作**:
- 定义所有数据模型（User, Couple, ImportantDate, Diary, WeatherRecord, PeriodRecord, Todo, Wish, WardrobeItem, Notification）
- 配置 MySQL 连接
- 创建 Prisma 客户端单例
**验证**: `npx prisma generate` 成功，`npx prisma db push` 创建表

### Task 4: 认证系统（API + 前端页面）
**文件**:
- `src/lib/auth.ts` — JWT 工具函数
- `src/lib/middleware.ts` — API 认证中间件
- `src/app/api/auth/register/route.ts` — 注册 API
- `src/app/api/auth/login/route.ts` — 登录 API
- `src/app/api/auth/me/route.ts` — 获取当前用户
- `src/app/(auth)/login/page.tsx` — 登录页面
- `src/app/(auth)/register/page.tsx` — 注册页面
- `src/contexts/AuthContext.tsx` — 认证上下文
**操作**:
- 实现 JWT 签发与验证
- 注册/登录 API
- 登录/注册页面 UI（歪宝风格）
- AuthContext 管理登录状态
**验证**: 能注册新用户、登录、获取用户信息

### Task 5: 情侣绑定模块
**文件**:
- `src/app/api/couples/create/route.ts` — 创建绑定（生成邀请码）
- `src/app/api/couples/bind/route.ts` — 绑定（输入邀请码）
- `src/app/api/couples/status/route.ts` — 获取绑定状态
- `src/app/api/couples/unbind/route.ts` — 解绑
- `src/components/profile/BindSection.tsx` — 绑定页面 UI
**操作**:
- 生成唯一邀请码
- 绑定逻辑（A 生成 → B 输入）
- 显示绑定状态
**验证**: 两个用户能互相绑定

### Task 6: 今日首页
**文件**:
- `src/app/(main)/page.tsx` — 今日首页
- `src/components/today/Greeting.tsx` — 问候语（按时间变化）
- `src/components/today/LoveDays.tsx` — 恋爱天数
- `src/components/today/ImportantDates.tsx` — 重要日子提醒
- `src/components/today/WeatherBrief.tsx` — 天气简卡
- `src/components/today/TodoBrief.tsx` — 待办简卡
- `src/components/today/MoodEntry.tsx` — 今日心情/日记入口
- `src/app/api/important-dates/route.ts` — 重要日期 API
**操作**:
- 实现问候语时间逻辑
- 计算恋爱天数
- 查询并显示重要日子
- 简单天气卡片
- 待办事项列表
- 心情记录入口
**验证**: 今日首页完整展示所有卡片

### Task 7: 日记 + AI 情绪分析
**文件**:
- `src/app/(main)/diary/page.tsx` — 日记页面
- `src/components/today/DiaryForm.tsx` — 日记表单
- `src/components/today/AiComfort.tsx` — AI 安慰展示
- `src/app/api/diaries/route.ts` — 日记 CRUD
- `src/app/api/ai/analyze/route.ts` — AI 情绪分析
- `src/app/api/ai/comfort/route.ts` — AI 安慰文案
- `src/lib/ai.ts` — DeepSeek 客户端
**操作**:
- 集成 DeepSeek API
- 日记提交 → 情绪分析 → 返回安慰文案
- 情绪等级 0-4
- 存储分析结果
**验证**: 提交日记后能收到 AI 情绪分析和安慰

### Task 8: 天气模块
**文件**:
- `src/app/(main)/weather/page.tsx` — 天气页面
- `src/components/weather/WeatherMain.tsx` — 今日天气
- `src/components/weather/Forecast3Day.tsx` — 未来三天
- `src/components/weather/AdviceCard.tsx` — 穿衣/护肤建议
- `src/app/api/weather/route.ts` — 天气 API（模拟或对接）
**操作**:
- 显示今日天气 + 未来三天
- 穿衣/护肤建议
- 无需真实天气 API，先做模拟数据 + 可配置
**验证**: 天气页面展示完整

### Task 9: 待办模块
**文件**:
- `src/components/today/TodoFull.tsx` — 完整待办列表
- `src/components/today/TodoForm.tsx` — 新增待办表单
- `src/app/api/todos/route.ts` — 待办 CRUD
- `src/app/api/todos/[id]/route.ts` — 单条操作
**操作**:
- 增删改查待办
- 设置优先级、分类
- 完成鼓励文案
**验证**: 能新增、完成、删除待办

### Task 10: 心愿模块
**文件**:
- `src/app/(main)/wishes/page.tsx` — 心愿页面
- `src/components/wishes/WishList.tsx` — 心愿列表
- `src/components/wishes/WishForm.tsx` — 新增心愿
- `src/components/wishes/WishDetail.tsx` — 心愿详情
- `src/components/wishes/WishWall.tsx` — 心愿墙
- `src/app/api/wishes/route.ts` — 心愿 CRUD
- `src/app/api/wishes/[id]/route.ts` — 单条操作
**操作**:
- 心愿增删改查
- 分类、优先级、进度管理
- 认领逻辑（用于男朋友端）
**验证**: 能创建心愿、更新进度

### Task 11: 例假模块
**文件**:
- `src/app/(main)/period/page.tsx` — 例假页面
- `src/components/period/PeriodCalendar.tsx` — 日历视图
- `src/components/period/PeriodForm.tsx` — 记录表单
- `src/components/period/PeriodAdvice.tsx` — 经期建议
- `src/app/api/periods/route.ts` — 例假记录 CRUD
- `src/app/api/periods/predict/route.ts` — 预测下次
**操作**:
- 日历选择日期
- 记录开始/结束日期、疼痛、情绪、流量
- 预测下一次
- 经期建议
- 免责声明
**验证**: 能记录经期、查看日历

### Task 12: 个人中心
**文件**:
- `src/app/(main)/profile/page.tsx` — 个人中心
- `src/components/profile/UserInfo.tsx` — 用户信息编辑
- `src/components/profile/ImportantDatesManager.tsx` — 重要日期管理
- `src/components/profile/BindSection.tsx` — 情侣绑定（已绑定状态）
- `src/components/profile/PrivacySettings.tsx` — 隐私设置
- `src/app/api/users/profile/route.ts` — 更新资料
- `src/app/api/important-dates/route.ts` — 日期管理 API
**操作**:
- 编辑昵称、头像、生日等
- 管理重要日期 CRUD
- 隐私开关（是否共享心愿/情绪/经期）
**验证**: 能编辑资料、管理日期、设置隐私

### Task 13: 男朋友端
**文件**:
- `src/app/(main)/partner/page.tsx` — 男朋友首页
- `src/components/partner/PartnerStatus.tsx` — 歪宝状态
- `src/components/partner/PartnerWishes.tsx` — 心愿提醒
- `src/components/partner/ComfortButtons.tsx` — 一键哄哄
- `src/app/api/partner/status/route.ts` — 获取歪宝状态
- `src/app/api/partner/comfort/route.ts` — 一键哄哄
- `src/app/api/partner/claim-wish/route.ts` — 认领心愿
**操作**:
- 显示绑定对象的状态摘要
- 一键哄哄（生成关心文案）
- 查看/认领心愿
**验证**: 男朋友端能看到歪宝状态，能一键哄哄

### Task 14: Docker 部署配置
**文件**: `docker-compose.yml`, `Dockerfile`, `.dockerignore`, `entrypoint.sh`
**操作**:
- MySQL 服务配置
- App 服务配置（Next.js 自包含）
- 环境变量映射
- 初始化脚本
**验证**: `docker-compose up` 能启动整套服务
