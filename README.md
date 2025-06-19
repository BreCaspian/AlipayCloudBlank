# <div align="center">🍰 AlipayCloudBlank 蛋糕商城小程序</div>

<div align="center">
  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/BreCaspian/AlipayCloudBlank)](https://github.com/BreCaspian/AlipayCloudBlank/issues)
[![GitHub stars](https://img.shields.io/github/stars/BreCaspian/AlipayCloudBlank)](https://github.com/BreCaspian/AlipayCloudBlank/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/BreCaspian/AlipayCloudBlank)](https://github.com/BreCaspian/AlipayCloudBlank/network)

</div>

<div align="center">
  <img src="README_Plot/商品浏览展示.gif" alt="商品浏览展示" width="200"/>
  <img src="README_Plot/购物车展示.gif" alt="购物车展示" width="200"/>
  <img src="README_Plot/订单管理展示.gif" alt="订单管理展示" width="200"/>
  <img src="README_Plot/用户中心展示.gif" alt="用户中心展示" width="200"/>
</div>

## 📋 项目概述

AlipayCloudBlank是一个基于支付宝小程序平台开发的蛋糕商城应用，集成了商品展示、购物车、订单管理以及支付等完整电商功能。项目使用支付宝小程序云开发技术栈，通过云函数实现后端业务逻辑，无需搭建独立服务器。

特色功能包括：
- 🎂 精美蛋糕、甜品和饮品展示与销售
- 🛒 全功能购物车管理
- 💳 便捷的订单处理与模拟支付流程
- 👤 个性化的用户中心体验

## 📑 目录

- [技术架构](#-技术架构)
- [功能模块](#-功能模块)
- [数据库结构](#-数据库结构)
- [云函数列表](#-云函数列表)
- [项目结构](#-项目结构)
- [安装与部署](#-安装与部署)
- [开发指南](#-开发指南)
- [业务流程](#-业务流程)
- [注意事项](#-注意事项)
- [测试数据](#-测试数据)
- [未来计划](#-未来计划)
- [技术支持](#-技术支持)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## 🔧 技术架构

### 🖥️ 前端
- 支付宝小程序 AXML、ACSS、JavaScript
- 组件化开发（自定义组件复用）
- 页面路由管理与生命周期控制
- 响应式界面设计

### ⚙️ 后端
- 支付宝小程序云函数（函数即服务 FaaS）
- 支付宝云数据库（文档型数据库）
- RESTful API设计模式
- 异步请求处理与错误管理

### 💾 存储
- 支付宝云数据库（MongoDB兼容）
- 云存储（图片资源，CDN加速）
- 本地缓存优化

## 🚀 功能模块

### 1. 🏪 商品浏览
<div align="center">
  <img src="README_Plot/商品浏览展示.gif" alt="商品浏览展示" width="300"/>
</div>

- 商品分类展示（千层、甜品、生日蛋糕、饮品）
- 子分类精确筛选
- 详细商品信息页面（价格、描述、库存）
- 高清图片展示与预览
- 相关商品推荐

### 2. 🛒 购物车
<div align="center">
  <img src="README_Plot/购物车展示.gif" alt="购物车展示" width="300"/>
</div>

- 添加商品到购物车（支持数量选择）
- 修改购物车商品数量（增加/减少）
- 选择/取消选择多个商品
- 一键删除选中商品
- 计算所选商品总价
- 购物车商品持久化存储
- 从购物车直接结算

### 3. 📦 订单管理
<div align="center">
  <img src="README_Plot/订单管理展示.gif" alt="订单管理展示" width="300"/>
</div>

- 创建新订单（支持填写配送地址）
- 订单支付流程（模拟）
- 订单状态实时更新（待付款、待发货、待收货、已完成）
- 订单列表分类查看
- 订单详情展示
- 订单历史记录

### 4. 👤 用户中心
<div align="center">
  <img src="README_Plot/用户中心展示.gif" alt="用户中心展示" width="300"/>
</div>

- 个人信息展示与管理
- 订单状态快速查看
- 收货地址管理
- 设置页面（清除缓存、检查更新等）
- 客户服务中心
- 帮助中心与常见问题

## 📊 数据库结构

项目使用支付宝云数据库存储数据，您可以使用 `Database/Database.zip` 文件直接导入完整数据结构和示例数据。

### 核心集合
- **t_category**: 商品主分类
  - id: 分类ID
  - name: 分类名称
  - icon: 分类图标URL

- **t_sub_category**: 商品子分类
  - id: 子分类ID
  - category_id: 所属主分类ID
  - name: 子分类名称

- **t_product**: 商品信息
  - id: 商品ID
  - category_id: 所属分类ID
  - sub_category_id: 所属子分类ID
  - name: 商品名称
  - price: 商品价格
  - description: 商品描述
  - url: 商品图片URL
  - stock: 库存数量
  - sales: 销售数量

- **t_cart**: 购物车
  - id: 购物车项ID
  - user_id: 用户ID
  - product_id: 商品ID
  - quantity: 数量
  - selected: 是否选中
  - create_time: 创建时间

- **t_order**: 订单信息
  - id: 订单ID
  - user_id: 用户ID
  - order_no: 订单编号
  - total_price: 订单总价
  - status: 订单状态（0:待付款, 1:待发货, 2:待收货, 3:已完成）
  - create_time: 创建时间
  - payment_time: 支付时间
  - ship_time: 发货时间
  - complete_time: 完成时间
  - items: 订单商品列表
  - address: 收货地址
  - consignee: 收货人
  - mobile: 联系电话

## 🔄 云函数列表

| 云函数名称 | 功能描述 | 主要参数 | 返回值 |
|---------|--------|--------|-------|
| **📥 addToCart** | 添加商品到购物车 | productId, quantity | 成功/失败状态和消息 |
| **📝 createOrder** | 创建订单 | items, amount, address, consignee, mobile | 订单ID和创建状态 |
| **📋 getCartList** | 获取购物车列表 | 无（基于固定用户ID） | 购物车商品列表（含商品详情） |
| **🗂️ getCategory** | 获取商品分类 | 无 | 分类列表 |
| **📊 getOrder** | 获取订单信息 | orderId（可选），status（可选） | 订单详情或订单列表 |
| **🔍 getProduct** | 获取商品信息 | productId（可选），categoryId（可选） | 商品详情或商品列表 |
| **📁 getSubCategory** | 获取商品子分类 | categoryId | 子分类列表 |
| **💰 myPay** | 支付功能（模拟） | orderId, amount, title | 支付结果和交易号 |
| **🗑️ removeCartItem** | 从购物车移除商品 | ids（商品ID数组） | 删除结果和数量 |
| **✏️ updateCartItem** | 更新购物车商品 | id, quantity（可选）, selected（可选） | 更新结果 |
| **🔄 updateOrder** | 更新订单状态 | orderId, status | 更新结果 |

## 📁 项目结构

```
AlipayCloudBlank/
├── 📁 .github/                     # GitHub配置文件
│   ├── 📁 ISSUE_TEMPLATE/          # Issue模板
│   │   ├── 📄 bug_report.md        # Bug报告模板
│   │   └── 📄 feature_request.md   # 功能请求模板
│   └── 📄 PULL_REQUEST_TEMPLATE.md # PR模板
├── 📁 cloud/                       # 云函数目录
│   └── 📁 functions/               # 各个云函数
│       ├── 📁 addToCart/           # 添加到购物车云函数
│       │   ├── 📄 index.js         # 云函数入口文件
│       │   └── 📄 package.json     # 依赖配置
│       ├── 📁 createOrder/         # 创建订单云函数
│       ├── 📁 getCartList/         # 获取购物车列表云函数
│       ├── 📁 getCategory/         # 获取分类云函数
│       ├── 📁 getOrder/            # 获取订单云函数
│       ├── 📁 getProduct/          # 获取商品云函数
│       ├── 📁 getSubCategory/      # 获取子分类云函数
│       ├── 📁 myPay/               # 支付功能云函数
│       ├── 📁 removeCartItem/      # 移除购物车商品云函数
│       ├── 📁 updateCartItem/      # 更新购物车商品云函数
│       └── 📁 updateOrder/         # 更新订单状态云函数
├── 📁 Database/                    # 数据库相关文件
│   ├── 📄 Database.zip             # 数据库备份文件
│   ├── 📄 DatabaseAPI.json         # 数据库API结构定义（JSON格式）
│   └── 📄 DatabaseAPI.txt          # 数据库API结构定义（文本格式）
├── 📁 miniprogram/                 # 小程序前端代码
│   ├── 📄 app.js                   # 全局脚本
│   ├── 📄 app.json                 # 全局配置
│   ├── 📄 app.acss                 # 全局样式
│   ├── 📁 components/              # 自定义组件
│   │   ├── 📁 ListItem/            # 列表项组件
│   │   │   ├── 📄 ListItem.axml    # 组件结构
│   │   │   ├── 📄 ListItem.js      # 组件逻辑
│   │   │   ├── 📄 ListItem.acss    # 组件样式
│   │   │   └── 📄 ListItem.json    # 组件配置
│   │   ├── 📁 MyCart/              # 购物车组件
│   │   └── 📁 OrderErrorTip/       # 订单错误提示组件
│   ├── 📁 images/                  # 通用图片资源
│   │   ├── 📄 gouwuche.jpg         # 购物车图标
│   │   ├── 📄 wode.jpg             # 我的图标
│   │   └── 📄 ...                  # 其他图标和图片
│   ├── 📁 Plot/                    # 商品图片资源
│   │   ├── 📁 千层/                # 千层蛋糕图片
│   │   ├── 📁 甜品/                # 甜品图片
│   │   ├── 📁 生日蛋糕/            # 生日蛋糕图片
│   │   └── 📁 饮品/                # 饮品图片
│   └── 📁 pages/                   # 页面目录
│       ├── 📁 index/               # 主页
│       │   ├── 📄 index.axml       # 页面结构
│       │   ├── 📄 index.js         # 页面逻辑
│       │   ├── 📄 index.acss       # 页面样式
│       │   └── 📄 index.json       # 页面配置
│       ├── 📁 detail/              # 商品详情页
│       ├── 📁 myCart/              # 购物车页面
│       ├── 📁 order/               # 订单页面
│       ├── 📁 orderList/           # 订单列表页面
│       ├── 📁 orderDetail/         # 订单详情页面
│       ├── 📁 my/                  # 我的页面
│       ├── 📁 settings/            # 设置页面
│       ├── 📁 helpCenter/          # 帮助中心页面
│       └── 📁 customerService/     # 客户服务页面
├── 📁 README_Plot/                 # README展示资源
│   ├── 📄 商品浏览展示.gif         # 商品浏览功能展示
│   ├── 📄 购物车展示.gif           # 购物车功能展示
│   ├── 📄 订单管理展示.gif         # 订单管理功能展示
│   └── 📄 用户中心展示.gif         # 用户中心功能展示
├── 📁 test-examples/               # 测试数据示例
│   ├── 📄 createOrder-test.json    # 创建订单测试数据
│   ├── 📄 getOrder-test.json       # 获取订单测试数据
│   ├── 📄 myPay-test.json          # 支付功能测试数据
│   └── 📄 updateOrder-test.json    # 更新订单测试数据
├── 📁 tools/                       # 工具脚本
│   └── 📄 debug-orders.js          # 订单调试工具
├── 📄 .gitignore                   # Git忽略文件配置
├── 📄 cloud-functions-manager.ps1  # 云函数管理工具
├── 📄 CONTRIBUTING.md              # 贡献指南
├── 📄 INSTALL_DEPENDENCIES.md      # 依赖安装指南
├── 📄 LICENSE                      # MIT许可证
├── 📄 mini.project.json            # 小程序项目配置
├── 📄 package.json                 # 项目依赖配置
└── 📄 README.md                    # 项目说明文档
```

## 🚀 安装与部署

### 🔧 环境要求
- 支付宝开发者工具（最新版）
- Node.js 12.0+ 
- npm 6.0+/yarn 1.22+
- Windows PowerShell 5.0+（用于运行管理脚本）

### 🔄 初始化步骤

1. 🔍 克隆项目到本地
   ```bash
   git clone https://github.com/BreCaspian/AlipayCloudBlank.git
   cd AlipayCloudBlank
   ```

2. 📱 使用支付宝开发者工具打开项目
   - 打开支付宝开发者工具
   - 选择"导入项目"
   - 定位到项目根目录
   - 配置AppID（可使用测试AppID）

3. ⚙️ 安装云函数依赖
   ```powershell
   # 以管理员身份运行PowerShell
   Set-ExecutionPolicy RemoteSigned -Scope Process
   .\cloud-functions-manager.ps1 install
   ```

### 📦 安装云函数依赖详解

项目提供了功能全面的云函数管理工具，使用PowerShell运行以下命令：

```powershell
# 查看帮助信息
.\cloud-functions-manager.ps1 help

# 检查所有云函数的package.json文件状态
.\cloud-functions-manager.ps1 check

# 一键安装所有云函数依赖
.\cloud-functions-manager.ps1 install

# 安装单个云函数依赖（例如getCartList）
.\cloud-functions-manager.ps1 install-single getCartList

# 重新创建所有package.json文件（解决编码问题）
.\cloud-functions-manager.ps1 recreate
```

遇到问题？请参考 `INSTALL_DEPENDENCIES.md` 文件获取更详细的安装指南。

### 🔌 配置云环境

1. 在支付宝开发者控制台创建云环境
2. 修改 `app.js` 中的云环境ID：
   ```javascript
   const context = await my.cloud.createCloudContext({
     env: '你的云环境ID' // 替换为你的云环境ID
   });
   ```
3. 导入示例数据到云数据库（参考 `Database/DatabaseAPI.json` 或使用 `Database/Database.zip` 直接导入）

## 💻 开发指南

### 🆕 添加新页面
1. 在 `miniprogram/pages` 目录下创建新页面文件夹（例如 `newPage`）
2. 创建四个基本文件：
   - `newPage.axml` - 页面结构
   - `newPage.js` - 页面逻辑
   - `newPage.acss` - 页面样式
   - `newPage.json` - 页面配置
3. 在 `app.json` 中的 `pages` 数组中添加页面路径：
   ```json
   "pages": [
     ...,
     "pages/newPage/newPage"
   ]
   ```

### ⚡ 添加新云函数
1. 在 `cloud/functions` 目录下创建新的云函数目录（例如 `newFunction`）
2. 添加基本文件：
   - `index.js` - 云函数主逻辑
   - `package.json` - 依赖配置
3. 编写云函数代码，基本结构如下：
   ```javascript
   const cloud = require('@alipay/faas-server-sdk');
   cloud.init();
   
   exports.main = async (event, context) => {
     console.log('函数参数:', event);
     
     // 业务逻辑...
     
     return {
       success: true,
       data: {} // 返回数据
     };
   };
   ```
4. 使用管理工具安装依赖：
   ```powershell
   .\cloud-functions-manager.ps1 install-single newFunction
   ```

### 🔍 本地调试技巧
- 使用支付宝开发者工具的模拟器进行UI测试
- 利用调试器控制台查看日志输出
- 使用 `test-examples` 目录中的测试数据进行功能测试
- 在 `app.js` 中启用详细日志：
  ```javascript
  console.log = (function(oriLogFunc) {
    return function(str) {
      // 添加时间戳
      oriLogFunc.call(console, `[${new Date().toISOString()}] ${str}`);
    }
  })(console.log);
  ```

### 📱 小程序页面开发流程
1. 设计页面UI和交互
2. 实现页面结构（AXML）
3. 编写页面样式（ACSS）
4. 实现页面逻辑（JS）
5. 配置页面属性（JSON）
6. 测试页面功能和性能
7. 优化用户体验

## 📱 业务流程

### 🛍️ 购物流程
1. 用户浏览商品列表
2. 查看商品详情
3. 将商品添加到购物车
4. 在购物车中调整数量和选择商品
5. 结算所选商品
6. 填写收货信息
7. 支付订单（模拟）
8. 查看订单状态

### 🔄 订单状态流转
- **待付款(0)** → **待发货(1)** → **待收货(2)** → **已完成(3)**

## ⚠️ 注意事项

1. 🔒 本项目使用模拟支付，无需接入真实支付API
2. 👤 用户身份使用固定ID（`user123`），实际项目中应接入支付宝登录授权
3. 📦 所有云函数都依赖于 `@alipay/faas-server-sdk` 包
4. 💾 首次使用请先初始化云数据库并导入示例数据
5. 🌐 部分功能需要在真机上测试，模拟器可能存在限制
6. 🔄 定期备份数据库以防数据丢失

## 🧪 测试数据

项目提供了多种测试数据资源：

- `test-examples/` 目录包含各云函数的测试数据示例：
  - `createOrder-test.json` - 创建订单测试数据
  - `getOrder-test.json` - 获取订单测试数据
  - `myPay-test.json` - 支付功能测试数据
  - `updateOrder-test.json` - 更新订单测试数据

- `Database/` 目录包含数据库相关文件：
  - `Database.zip` - 完整数据库备份，可直接导入
  - `DatabaseAPI.json` - 数据库API结构定义（JSON格式）
  - `DatabaseAPI.txt` - 数据库API结构详细说明（文本格式）

## 🔮 未来计划

- [ ] 🔍 搜索功能优化
- [ ] 👥 添加用户登录和认证
- [ ] 🌟 商品评价和评分系统
- [ ] 📱 小程序分享功能
- [ ] 🔔 订单状态变更通知
- [ ] 🎁 优惠券和促销活动
- [ ] 📊 销售数据统计和分析

## 📞 技术支持

如有问题，请通过以下方式寻求支持：
- 📚 参考项目源码和注释
- 📖 查阅[支付宝小程序开发文档](https://opendocs.alipay.com/mini/developer)
- 🔍 查看云函数运行日志排查问题
- 💬 提交Issues获取社区帮助

## 👥 贡献指南

我们欢迎您为AlipayCloudBlank项目做出贡献！请查看[贡献指南](CONTRIBUTING.md)了解如何参与项目开发。

## 📜 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解更多详情。
