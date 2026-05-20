#!/bin/bash
# ============================================
# 川名堂 一键部署脚本
# 适用系统: Ubuntu 24.04 / CentOS 7+
# 使用方法: 
#   1. 将项目上传到服务器（git clone 或 scp）
#   2. cd 到项目目录
#   3. chmod +x scripts/deploy.sh
#   4. sudo ./scripts/deploy.sh
# ============================================

set -e

echo "========================================"
echo "  川名堂 一键部署脚本"
echo "========================================"

# 配置区域 - 请修改为您的实际域名
DOMAIN="chuanmingtang.store"   # ← 改成您的域名
ADMIN_PASSWORD="cmt2024"       # ← 管理后台密码

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
  echo "请以 root 权限运行: sudo ./scripts/deploy.sh"
  exit 1
fi

echo ""
echo "📦 步骤1: 安装 Node.js 20.x"
echo "-------------------------"

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

echo ""
echo "📦 步骤2: 安装 Nginx"
echo "-------------------"

if ! command -v nginx &> /dev/null; then
  apt-get update
  apt-get install -y nginx
fi

echo ""
echo "📦 步骤3: 安装 PM2"
echo "-----------------"

if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

echo ""
echo "🔧 步骤4: 安装项目依赖并构建"
echo "---------------------------"

cd "$(dirname "$0")/.."
npm install
npm run build

echo ""
echo "🔧 步骤5: 创建 data 目录"
echo "-----------------------"

mkdir -p data

echo ""
echo "🔧 步骤6: 配置 PM2 启动"
echo "----------------------"

# 设置环境变量
export ADMIN_PASSWORD="$ADMIN_PASSWORD"

# 使用 PM2 启动
pm2 delete ecommerce 2>/dev/null || true
pm2 start npm --name "ecommerce" -- start
pm2 save

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root

echo ""
echo "🔧 步骤7: 配置 Nginx 反向代理"
echo "----------------------------"

cat > /etc/nginx/sites-available/ecommerce << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 将 HTTP 重定向到 HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL 证书（由 certbot 自动配置）
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "🔧 步骤8: 配置 SSL 证书（Let's Encrypt）"
echo "----------------------------------------"

if ! command -v certbot &> /dev/null; then
  apt-get install -y certbot python3-certbot-nginx
fi

# 先停止 nginx 以获取证书
systemctl stop nginx
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || true
systemctl start nginx

echo ""
echo "========================================"
echo "  ✅ 部署完成！"
echo "========================================"
echo ""
echo "  网站地址: https://$DOMAIN"
echo "  管理后台: https://$DOMAIN/admin"
echo "  管理密码: $ADMIN_PASSWORD"
echo ""
echo "  后续管理命令:"
echo "    pm2 status          # 查看进程状态"
echo "    pm2 logs ecommerce  # 查看日志"
echo "    pm2 restart ecommerce  # 重启"
echo ""
echo "  更新代码:"
echo "    git pull"
echo "    npm run build"
echo "    pm2 restart ecommerce"
echo ""
echo "========================================"
