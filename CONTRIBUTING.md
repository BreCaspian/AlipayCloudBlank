# 贡献指南

感谢您考虑为 AlipayCloudBlank 项目做出贡献！以下是一些指导原则，帮助您更好地参与项目开发。

## 开发环境设置

1. 克隆仓库
   ```bash
   git clone https://github.com/BreCaspian/AlipayCloudBlank.git
   cd AlipayCloudBlank
   ```

2. 安装云函数依赖
   ```powershell
   # 以管理员身份运行PowerShell
   Set-ExecutionPolicy RemoteSigned -Scope Process
   .\cloud-functions-manager.ps1 install
   ```

3. 使用支付宝开发者工具打开项目

## 代码风格

- 使用2个空格进行缩进
- 使用分号结束语句
- 遵循 ESLint 规则
- 变量和函数名使用驼峰命名法
- 注释使用中文，代码使用英文

## 提交规范

提交信息应该遵循以下格式：

```
<类型>: <简短描述>

<详细描述>
```

类型包括：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码风格更改（不影响代码运行）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

## 分支管理

- `main`: 主分支，保持稳定
- `develop`: 开发分支，新功能合并到这里
- `feature/xxx`: 新功能分支
- `fix/xxx`: 修复分支

## 提交PR流程

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'feat: 添加一些功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 云函数开发指南

1. 在 `cloud/functions` 目录下创建新的云函数目录
2. 添加 `index.js` 和 `package.json` 文件
3. 使用 `cloud-functions-manager.ps1` 安装依赖
4. 遵循现有云函数的错误处理和返回格式

## 测试

在提交代码前，请确保：
- 所有云函数都能正常工作
- 小程序页面在模拟器中正常显示
- 数据库操作正确无误

感谢您的贡献！ 