# บทที่ 7: คู่มือการติดตั้งและ Deployment

## 7.1 ความต้องการของระบบ (System Requirements)

### ฮาร์ดแวร์ขั้นต่ำ (Development)
- **CPU**: 2 cores ขึ้นไป
- **RAM**: 4 GB ขึ้นไป
- **Storage**: 10 GB พื้นที่ว่าง
- **Network**: Internet connection

### ฮาร์ดแวร์แนะนำ (Production)
- **CPU**: 4 cores ขึ้นไป
- **RAM**: 8 GB ขึ้นไป
- **Storage**: 50 GB SSD
- **Network**: Stable internet, ความเร็วอย่างน้อย 10 Mbps

### ซอฟต์แวร์ที่ต้องการ
- **Node.js**: v18.17.0 หรือใหม่กว่า
- **PostgreSQL**: v14 หรือใหม่กว่า
- **npm**: v9.0.0 หรือใหม่กว่า (มากับ Node.js)
- **Git**: สำหรับ version control

## 7.2 การติดตั้งในเครื่อง Development

### 7.2.1 ติดตั้ง Node.js

#### Windows
1. ดาวน์โหลด Node.js จาก https://nodejs.org/
2. เลือก LTS version
3. รันไฟล์ติดตั้ง (.msi)
4. ติดตามขั้นตอนการติดตั้ง

#### macOS
```bash
# ใช้ Homebrew
brew install node

# หรือดาวน์โหลดจาก nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
# ใช้ NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ตรวจสอบการติดตั้ง
node --version
npm --version
```

### 7.2.2 ติดตั้ง PostgreSQL

#### Windows
1. ดาวน์โหลดจาก https://www.postgresql.org/download/windows/
2. รันไฟล์ติดตั้ง
3. จดจำ password ของ postgres user
4. เลือกติดตั้ง pgAdmin (GUI tool)

#### macOS
```bash
# ใช้ Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 7.2.3 สร้าง Database

```bash
# เข้าสู่ PostgreSQL shell
sudo -u postgres psql

# สร้าง database
CREATE DATABASE classroom_booking;

# สร้าง user (optional)
CREATE USER booking_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE classroom_booking TO booking_user;

# ออกจาก shell
\q
```

### 7.2.4 Clone Project

```bash
# Clone repository
git clone https://github.com/aekarach-jo/room-booking-nextjs.git
cd room-booking-nextjs

# ติดตั้ง dependencies
npm install
```

### 7.2.5 ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/classroom_booking"
DIRECT_URL="postgresql://postgres:password@localhost:5432/classroom_booking"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# RMUTI SSO (Optional - for production)
RMUTI_OAUTH_CLIENT_ID="your_client_id"
RMUTI_OAUTH_CLIENT_SECRET="your_client_secret"
RMUTI_OAUTH_CALLBACK_URL="http://localhost:3000/api/auth/rmuti/callback"
```

**หมายเหตุสำคัญ**:
- แก้ `password` ให้ตรงกับรหัสผ่าน PostgreSQL ของคุณ
- `JWT_SECRET` ควรเป็น random string ที่ยาวและซับซ้อน
- ใน Production ต้องใช้ HTTPS

### 7.2.6 รัน Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# รัน migrations
npx prisma migrate dev --name init

# (Optional) Seed ข้อมูลทดสอบ
npm run db:seed
```

### 7.2.7 เริ่มต้น Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## 7.3 การติดตั้งด้วย Docker (Alternative)

### 7.3.1 ติดตั้ง Docker

ดาวน์โหลดและติดตั้ง Docker Desktop จาก https://www.docker.com/

### 7.3.2 สร้าง Dockerfile

สร้างไฟล์ `Dockerfile` ที่ root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 7.3.3 สร้าง docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: classroom_booking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/classroom_booking"
      JWT_SECRET: "your-secret-key"
      NODE_ENV: "production"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 7.3.4 รันด้วย Docker Compose

```bash
# Build และรัน
docker-compose up -d

# ตรวจสอบ logs
docker-compose logs -f

# หยุดทำงาน
docker-compose down
```

## 7.4 Deployment ไปยัง Production

### 7.4.1 Deployment บน Vercel (แนะนำ)

Vercel เป็นแพลตฟอร์มที่สร้างโดยทีมพัฒนา Next.js เหมาะสำหรับ deploy Next.js มากที่สุด

#### ขั้นตอน:

1. **เตรียม Database**
   - ใช้ Vercel Postgres (แนะนำ) หรือ
   - ใช้ external database (Supabase, Neon, Railway)

2. **Push code ไปยัง GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy ผ่าน Vercel**
   - ไปที่ https://vercel.com/
   - Login ด้วย GitHub
   - คลิก "Import Project"
   - เลือก repository `room-booking-nextjs`
   - ตั้งค่า Environment Variables:
     ```
     DATABASE_URL
     DIRECT_URL
     JWT_SECRET
     NEXT_PUBLIC_APP_URL
     ```
   - คลิก "Deploy"

4. **รัน Database Migration บน Production**
   ```bash
   # ติดตั้ง Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # รัน migration
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

#### ข้อดีของ Vercel:
- Deploy อัตโนมัติเมื่อ push ไปยัง GitHub
- SSL certificate ฟรี
- CDN global
- Zero configuration
- Preview deployments สำหรับ Pull Requests

### 7.4.2 Deployment บน Railway

Railway เป็นแพลตฟอร์มที่รองรับทั้ง Next.js และ PostgreSQL

#### ขั้นตอน:

1. **สร้างบัญชี Railway**
   - ไปที่ https://railway.app/
   - Sign up ด้วย GitHub

2. **สร้าง Project**
   - คลิก "New Project"
   - เลือก "Deploy from GitHub repo"
   - เลือก repository `room-booking-nextjs`

3. **เพิ่ม PostgreSQL**
   - คลิก "New"
   - เลือก "Database" → "PostgreSQL"
   - Railway จะสร้าง DATABASE_URL ให้อัตโนมัติ

4. **ตั้งค่า Environment Variables**
   - ไปที่ Settings → Variables
   - เพิ่ม:
     ```
     JWT_SECRET
     NODE_ENV=production
     NEXT_PUBLIC_APP_URL=https://your-app.railway.app
     ```

5. **Deploy**
   - Railway จะ deploy อัตโนมัติ
   - รอ build เสร็จ (~5 นาที)

### 7.4.3 Deployment บน DigitalOcean App Platform

#### ขั้นตอน:

1. **สร้าง Database (Managed Database)**
   - ไปที่ DigitalOcean Console
   - สร้าง PostgreSQL Managed Database
   - คัดลอก Connection String

2. **สร้าง App**
   - คลิก "Create" → "Apps"
   - เชื่อมต่อ GitHub repository
   - เลือก branch `main`

3. **ตั้งค่า Build Command**
   ```
   npm install && npx prisma generate && npm run build
   ```

4. **ตั้งค่า Run Command**
   ```
   npm start
   ```

5. **เพิ่ม Environment Variables**
   - เพิ่มตัวแปรเหมือน Vercel
   - ใช้ Database Connection String ที่ได้จากขั้นตอนที่ 1

6. **Deploy**
   - คลิก "Deploy"

### 7.4.4 Self-Hosted Deployment (VPS)

สำหรับ deploy บน VPS เช่น DigitalOcean Droplet, AWS EC2, หรือ server ของตัวเอง

#### ขั้นตอน:

1. **เตรียม Server (Ubuntu 22.04)**
   ```bash
   # อัปเดตระบบ
   sudo apt update
   sudo apt upgrade -y
   
   # ติดตั้ง Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # ติดตั้ง PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # ติดตั้ง Nginx
   sudo apt install nginx -y
   
   # ติดตั้ง PM2 (Process Manager)
   sudo npm install -g pm2
   ```

2. **Clone และ Setup Project**
   ```bash
   # Clone
   git clone https://github.com/aekarach-jo/room-booking-nextjs.git
   cd room-booking-nextjs
   
   # ติดตั้ง dependencies
   npm ci --production
   
   # สร้าง .env
   nano .env
   # (กรอกข้อมูลตามขั้นตอน 7.2.5)
   
   # Generate Prisma Client
   npx prisma generate
   
   # รัน migrations
   npx prisma migrate deploy
   
   # Build
   npm run build
   ```

3. **รันด้วย PM2**
   ```bash
   # เริ่มแอป
   pm2 start npm --name "room-booking" -- start
   
   # บันทึก process list
   pm2 save
   
   # ตั้งให้รันตอน boot
   pm2 startup
   ```

4. **ตั้งค่า Nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/room-booking
   ```
   
   เพิ่มข้อมูล:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/room-booking /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **ติดตั้ง SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

6. **ตั้งค่า Firewall**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   sudo ufw enable
   ```

## 7.5 Database Backup และ Recovery

### 7.5.1 Backup

#### Manual Backup
```bash
# Backup ทั้ง database
pg_dump -U postgres -d classroom_booking > backup_$(date +%Y%m%d).sql

# Backup แบบ compressed
pg_dump -U postgres -d classroom_booking | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### Automated Backup (Cron Job)
```bash
# แก้ไข crontab
crontab -e

# เพิ่มบรรทัดนี้ (backup ทุกวันเวลา 02:00)
0 2 * * * pg_dump -U postgres classroom_booking | gzip > /backup/db_$(date +\%Y\%m\%d).sql.gz
```

### 7.5.2 Restore

```bash
# Restore จาก SQL file
psql -U postgres -d classroom_booking < backup.sql

# Restore จาก compressed file
gunzip -c backup.sql.gz | psql -U postgres -d classroom_booking
```

## 7.6 Monitoring และ Maintenance

### 7.6.1 Log Monitoring

#### ใช้ PM2 Logs
```bash
# ดู logs realtime
pm2 logs room-booking

# ดู error logs
pm2 logs room-booking --err

# Clear logs
pm2 flush
```

### 7.6.2 Health Check

สร้าง Health Check Endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
```

### 7.6.3 Database Maintenance

```bash
# ตรวจสอบขนาด database
psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('classroom_booking'));"

# Vacuum database (ล้างข้อมูลที่ไม่ใช้)
psql -U postgres -d classroom_booking -c "VACUUM ANALYZE;"
```

## 7.7 Troubleshooting

### ปัญหา: Database connection failed
**วิธีแก้**:
- ตรวจสอบ DATABASE_URL ใน `.env`
- ตรวจสอบว่า PostgreSQL กำลังรันอยู่
- ตรวจสอบ firewall settings

### ปัญหา: Port 3000 already in use
**วิธีแก้**:
```bash
# หา process ที่ใช้ port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### ปัญหา: Prisma Client not generated
**วิธีแก้**:
```bash
npx prisma generate
```

### ปัญหา: Migration failed
**วิธีแก้**:
```bash
# Reset database (development only!)
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy
```

## 7.8 Performance Optimization

### 7.8.1 Database Query Optimization
- ใช้ Prisma query optimization
- สร้าง indexes ที่เหมาะสม
- ใช้ connection pooling

### 7.8.2 Caching
- ใช้ Next.js built-in caching
- พิจารณาใช้ Redis สำหรับ session storage

### 7.8.3 CDN
- ใช้ CDN สำหรับ static assets
- Vercel และ Netlify มี CDN built-in

## 7.9 Security Checklist

- [ ] ใช้ HTTPS ใน production
- [ ] ตั้ง JWT_SECRET ที่แข็งแรง
- [ ] ไม่ commit `.env` file
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] Update dependencies เป็นประจำ
- [ ] ใช้ prepared statements (Prisma ทำให้อัตโนมัติ)
- [ ] Implement rate limiting
- [ ] Enable database encryption at rest
- [ ] Regular backup database
- [ ] Monitor error logs

## 7.10 Scaling Considerations

### Horizontal Scaling
- Deploy หลาย instances ของ Next.js app
- ใช้ Load Balancer (Nginx, AWS ALB)
- ใช้ Database Connection Pooling

### Vertical Scaling
- เพิ่ม CPU/RAM ของ server
- ใช้ Database read replicas
- Optimize queries และ indexes
