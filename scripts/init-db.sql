-- 数据库初始化脚本（Docker 首次启动时自动执行）
CREATE DATABASE IF NOT EXISTS waibao_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'waibao'@'%' IDENTIFIED BY 'waibao123';
GRANT ALL PRIVILEGES ON waibao_db.* TO 'waibao'@'%';
FLUSH PRIVILEGES;
