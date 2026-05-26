# 自有服务器部署

这套部署不依赖微信云服务。后端和网页端一起跑在你的服务器上，小程序通过 HTTPS 域名请求接口。

## 1. 服务器准备

服务器需要：

- Docker 和 Docker Compose
- 一个已备案/可访问的域名，例如 `api.example.com`
- HTTPS 证书，推荐用 Nginx + Let's Encrypt 或宝塔面板反向代理

## 2. 上传代码

在服务器上放到任意目录，例如：

```bash
mkdir -p /opt/waibao
cd /opt/waibao
```

把本项目文件上传到这个目录。

## 3. 配置环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

至少要填写：

- `JWT_SECRET`
- `DEEPSEEK_API_KEY`
- `WEATHER_API_KEY`

不要把 `.env.production` 提交到代码仓库。

高德地图 Web 服务 Key 如果开启了 IP 白名单，需要把服务器公网 IP 加进去：

```text
43.128.155.3
```

## 4. 启动服务

```bash
docker compose up -d --build
docker compose logs -f app
```

看到 `Starting Waibao app...` 后，测试：

```bash
curl http://127.0.0.1:3000/api/health
```

正常会返回 `success: true`。

## 5. 配置 Nginx 反向代理

把你的域名反代到本机 `3000` 端口：

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

正式小程序必须使用 HTTPS，所以证书配置好后，用：

```bash
curl https://api.example.com/api/health
```

确认可访问。

## 6. 修改小程序接口地址

修改 `miniprogram/env.js`：

```js
module.exports = {
  API_BASE_URL: 'https://api.example.com',
  API_BASE_URLS: [
    'https://api.example.com'
  ]
};
```

然后在微信公众平台后台添加 request/uploadFile 合法域名：

```text
https://api.example.com
```

## 7. 常用维护命令

查看日志：

```bash
docker compose logs -f app
```

重启：

```bash
docker compose restart app
```

更新代码后重新构建：

```bash
docker compose up -d --build
```

备份数据库和上传图片：

```bash
docker run --rm -v waibao_waibao-data:/data -v "$PWD":/backup alpine tar czf /backup/waibao-data.tar.gz -C /data .
docker run --rm -v waibao_waibao-uploads:/uploads -v "$PWD":/backup alpine tar czf /backup/waibao-uploads.tar.gz -C /uploads .
```
