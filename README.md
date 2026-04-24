# 羽毛球报名网址系统 MVP

这是一个基于 `Next.js 14 + TypeScript + Tailwind CSS` 的羽毛球报名系统第一版，用来替代微信群里的接龙报名。

当前版本分为两部分：

- 用户端：查看活动、报名、取消报名、查询我的报名
- 管理后台：登录后创建活动、编辑活动、管理名单、编辑通知、导出 CSV

数据库运行策略是双环境：

- 本地默认使用 `SQLite`
- 部署到 Vercel 时使用 `PostgreSQL`

项目保留了 `prisma/schema.prisma` 作为数据库设计基线，但运行时数据库访问使用项目内的统一数据层，以保证本地开发简单、Vercel 部署稳定。

## 项目目录结构

```text
.
├── app
│   ├── admin
│   │   ├── (protected)
│   │   │   ├── events
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   ├── [id]/registrations/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── login/page.tsx
│   ├── api
│   │   ├── admin/...
│   │   ├── events/...
│   │   └── my-registrations/route.ts
│   ├── events/[id]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── my/page.tsx
│   └── page.tsx
├── components
│   ├── admin-event-form.tsx
│   ├── admin-login-form.tsx
│   ├── admin-notice-form.tsx
│   ├── admin-registration-manager.tsx
│   ├── empty-state.tsx
│   ├── event-card.tsx
│   ├── phone-query-form.tsx
│   ├── registration-panel.tsx
│   ├── site-nav.tsx
│   └── status-pill.tsx
├── lib
│   ├── auth.ts
│   ├── business.ts
│   ├── constants.ts
│   ├── dates.ts
│   ├── db.ts
│   ├── format.ts
│   ├── queries.ts
│   ├── types.ts
│   └── validators.ts
├── prisma
│   ├── schema.prisma
│   ├── dev.db
│   └── seed.ts
├── .env.example
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 已实现功能

### 用户端

- 活动列表页：展示未结束活动、报名人数、候补人数、活动状态
- 活动详情页：展示活动时间、场馆、说明、最新通知
- 报名功能：正式名额未满进入正式名单，满员后自动进入候补
- 取消报名：正式名单取消后，候补第一位自动递补
- 我的报名：支持查询自己的历史报名记录

### 管理后台

- 管理员登录
- 新建、编辑、删除活动
- 管理正式名单和候补名单
- 手动新增报名、手动删除报名
- 维护每场活动的最新通知
- 导出某场活动的报名 CSV

### 当前活动创建规则

- 管理员创建活动时不再需要单独填写“报名截止时间”
- 系统会自动把“开始时间”视为停止报名时间
- “活动说明”为选填，可留空创建

## 当前测试版取舍

为了方便你直接发给别人试用，当前前台和后台都已经改成“按姓名”识别：

- 报名只填姓名
- 取消只填姓名
- 我的报名按姓名查询
- 后台手动新增也只填姓名

这能降低试用门槛，但会带来一个已知限制：

- 如果两个人重名，系统会把他们视为同一个人

如果后面要正式上线，建议改成“姓名 + 手机号”或“微信授权登录”。

## 数据库设计

`prisma/schema.prisma` 中包含以下模型：

- `User`
- `Event`
- `Registration`
- `Notice`

`Registration.status` 支持：

- `CONFIRMED`
- `WAITLIST`
- `CANCELED`

并记录：

- `createdAt`：报名时间
- `canceledAt`：取消时间
- `waitlistPosition`：候补顺序

## 核心业务规则

项目中已经实现以下逻辑：

1. 报名人数未满时进入正式名单
2. 报名人数已满时进入候补名单
3. 正式名单取消时，候补第一位自动递补
4. 同一姓名不能重复报名同一活动
5. 到达活动开始时间后不能报名
6. 已取消活动不能报名
7. 已结束活动只可查看，不可报名

## 本地安装与启动

### 1. 安装依赖

推荐使用 `pnpm`：

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量文件：

```bash
cp .env.example .env
```

默认内容如下：

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="badminton123"
ADMIN_SECRET="replace-this-with-a-random-secret"
```

说明：

- `DATABASE_URL="file:./dev.db"` 表示本地使用 `prisma/dev.db`
- `ADMIN_SECRET` 建议替换成一串更长的随机字符串

### 3. 初始化数据库和种子数据

直接执行：

```bash
pnpm seed
```

这会自动创建本地 SQLite 数据表并写入测试数据。

### 4. 启动开发环境

```bash
pnpm dev
```

启动后访问：

- 用户端首页：[http://localhost:3000](http://localhost:3000)
- 管理后台登录页：[http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 默认管理员账号密码

- 账号：`admin`
- 密码：`badminton123`

如果你在 `.env` 里修改了 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，则以你的配置为准。

## 测试数据

`prisma/seed.ts` 已内置以下样例数据：

- 一个可继续报名的活动
- 一个正式名额已满且已有候补的活动
- 一个已取消活动
- 一个已结束活动

可以直接测试：

- 正式报名
- 候补报名
- 取消后递补
- 后台名单管理
- CSV 导出

## 部署到 Vercel

### 部署前准备

建议把项目放在普通本地目录后再提交 Git 仓库，不要长期在 iCloud Drive、OneDrive 这类同步目录里开发，以免原生依赖和文件监听不稳定。

### 推荐部署方式

Vercel 上不要继续使用 SQLite 文件数据库，推荐改用 `PostgreSQL`。本项目已经支持：

- 本地 `SQLite`
- Vercel `PostgreSQL`

### 上线步骤

1. 把项目推到 GitHub

```bash
git init
git add .
git commit -m "init badminton signup system"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

2. 登录 [Vercel](https://vercel.com/)，导入这个 GitHub 仓库

3. 在 Vercel 项目里添加环境变量：

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

推荐值示例：

```env
DATABASE_URL=postgresql://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SECRET=your-random-secret
```

4. 给项目接一个 Postgres 数据库

- 可以在 Vercel Marketplace 里添加 Neon 或其他 Postgres 集成
- 也可以使用你自己已有的 Postgres 数据库

5. 重新部署一次

环境变量修改后，需要重新部署才能生效。

6. 初始化线上测试数据

先把 Vercel 的环境变量拉到本地：

```bash
vercel env pull .env.vercel
```

然后执行：

```bash
set -a
source .env.vercel
set +a
pnpm seed
```

这样就会把测试数据写入你的线上 Postgres。

### Vercel 部署说明

- Next.js 项目导入 Vercel 后通常是零配置部署
- 新项目请通过 Vercel Marketplace 连接 Postgres，数据库凭据会作为环境变量注入项目
- 修改环境变量后，需要重新部署，新的值才会生效

## 常用命令

```bash
pnpm install
pnpm seed
pnpm dev
pnpm build
pnpm start
```

## 后续建议

如果你准备正式给球友长期使用，下一步推荐优先做这几项：

- 把姓名识别改回“手机号”或“微信登录”
- 增加管理员多账号
- 增加活动开始前提醒
- 增加活动分享卡片
- 增加支付状态或场地费记录
