@echo off
chcp 65001 >nul
title 歪宝小窝 - 启动器

echo ================================
echo   歪宝小窝 - 启动器
echo ================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 未安装 Node.js，请先安装：https://nodejs.org/
    pause
    exit /b
)
echo ✅ Node.js 已安装
node -v

:: 检查 npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 未安装 npm
    pause
    exit /b
)

:: 检查 node_modules
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ 安装失败，请尝试手动执行 npm install
        pause
        exit /b
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

:: 检查 Prisma 客户端
if not exist "node_modules\.prisma" (
    echo 🔧 正在生成 Prisma 客户端...
    call npx prisma generate
)

:: 检查 .env.local
if not exist ".env.local" (
    echo ⚠️  未找到 .env.local，正在从 .env.example 创建...
    copy .env.example .env.local >nul
    echo ⚠️  请编辑 .env.local 配置数据库连接和 DeepSeek API Key
)

echo.
echo ================================
echo 🚀 正在启动歪宝小窝...
echo.
echo 启动后将自动打开 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo ================================
echo.

npm run dev

pause
