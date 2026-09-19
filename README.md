完整的设计和开发文档见 `docs/设计和开发文档.docs`。

```markdown
# HandSignSys 智能手语识别系统

基于 YOLOv8 + SpringBoot + Flask + Vue3 + UniApp 的智能手语识别系统，支持图片识别、视频识别、摄像头实时识别，覆盖 PC 端和微信小程序双端，面向聋哑人士、健听人士及教育工作者提供无障碍沟通解决方案。

## 系统架构

本系统采用微服务架构，分为四层：

- **前端应用层**：Vue3 PC 端 + UniApp 微信小程序
- **后端服务层**：SpringBoot（业务逻辑、权限控制、接口路由）
- **模型服务层**：Flask + YOLOv8（手语识别推理）
- **数据存储层**：MySQL（业务数据）+ 文件存储 + Redis（缓存）

## 技术栈

**前端**
- Vue3 + Vite + Element Plus（PC 端）
- UniApp（微信小程序）
- Axios + Socket.IO-Client（HTTP + WebSocket）
- ECharts（数据可视化）

**后端**
- SpringBoot + MyBatis-Plus
- JWT Token 身份认证
- BCrypt 密码加密
- WebSocket 实时通信

**模型服务**
- Flask + Flask-SocketIO
- YOLOv8（手语目标检测）
- OpenCV（图像/视频处理）
- FFmpeg（视频编码与格式转换）

**数据库**
- MySQL 8.0（用户表、图片记录表、视频记录表、摄像头记录表）
- Redis（模型缓存、会话缓存、验证码缓存）

## 核心功能

- **图片识别**：上传手语图像，支持中英文模型选择与置信度调节，输出识别类别与置信度
- **视频识别**：上传手语视频，逐帧分析并通过 WebSocket 实时推送处理进度，支持导出报告
- **实时识别**：调用摄像头实时采集手语动作，低延迟识别并同步展示结果
- **记录管理**：支持图片/视频/摄像头识别记录的查询、筛选、详情查看与删除
- **用户管理**：注册登录、个人信息维护、JWT 权限控制

## 项目结构

```
HandSignSys/
├── HandSign_flask/        # Flask AI推理后端
├── HandSign_springboot/   # SpringBoot 业务后端
├── HandSign_uniapp/       # UniApp 微信小程序
└── HandSign_vue/          # Vue3 PC 端
```

## 系统启动顺序

1. 启动 MySQL 数据库
2. 启动 SpringBoot 业务后端（端口 9999）
3. 启动 Flask AI 推理后端（端口 5000）
4. 启动 Vue3 前端（端口 8888）或微信小程序

## 部署说明

**数据库**：安装 MySQL 8.0，创建 `handsign` 数据库，导入 `handsign.sql`

**SpringBoot 后端**：修改 `application.properties` 中的数据库连接配置，运行 `KcsjApplication.java`

**Flask 后端**：安装依赖 `pip install flask flask-socketio ultralytics opencv-python requests numpy`，执行 `python main.py`

**Vue3 前端**：执行 `npm install` 后 `npm run dev`

**微信小程序**：使用 HBuilderX 打开项目，运行到微信开发者工具

> 注意：FFmpeg 可执行文件需自行下载并配置到 `HandSign_flask/ffmpeg/bin/` 目录下。

## 性能指标

| 指标 | 设计目标 | 测试结果 |
| :--- | :--- | :--- |
| 图片识别准确率 | ≥95% | 98% |
| 视频识别准确率 | ≥90% | 93.5% |
| 实时识别准确率 | ≥90% | 94% |
| 实时识别延迟 | ≤300ms | 210ms |
| 单帧识别耗时 | ≤100ms | 72ms |
| 100路并发成功率 | ≥99% | 99.8% |
