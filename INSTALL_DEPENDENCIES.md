# 安装依赖说明

本项目使用了支付宝小程序云函数，需要安装相关依赖才能正常运行。

## 使用云函数管理工具

我们提供了一个综合管理工具 `cloud-functions-manager.ps1`，可以帮助您管理云函数依赖。

### 查看帮助

```
.\cloud-functions-manager.ps1 help
```

### 检查package.json文件

```
.\cloud-functions-manager.ps1 check
```

### 修复package.json文件编码问题

如果您遇到package.json文件编码问题，可以使用以下命令重新创建所有package.json文件：

```
.\cloud-functions-manager.ps1 recreate
```

### 安装所有云函数依赖

1. 以管理员身份打开 PowerShell（右键点击 PowerShell，选择"以管理员身份运行"）
2. 切换到项目根目录
3. 运行安装命令：
   ```
   .\cloud-functions-manager.ps1 install
   ```

### 安装单个云函数依赖

```
.\cloud-functions-manager.ps1 install-single getCategory
```

## 手动安装

如果自动安装失败，您可以手动安装每个云函数的依赖：

1. 打开命令提示符或 PowerShell
2. 对每个云函数执行以下操作：
   ```
   cd cloud/functions/[云函数名称]
   npm install
   cd ../../../
   ```

## 常见问题解决

### EPERM错误

如果安装过程中遇到 EPERM 错误，可以尝试清除 npm 缓存：

1. 以管理员身份打开 PowerShell
2. 执行：
   ```
   npm cache clean --force
   ```
3. 然后重新运行安装脚本

### 网络问题

如果遇到网络问题，可以尝试使用淘宝镜像源：

```
npm config set registry https://registry.npmmirror.com
```

## 云函数列表

以下是项目中的所有云函数：

1. addToCart - 添加商品到购物车
2. createOrder - 创建订单
3. getCartList - 获取购物车列表
4. getCategory - 获取商品分类
5. getOrder - 获取订单
6. getProduct - 获取商品
7. getSubCategory - 获取商品子分类
8. myPay - 支付功能
9. removeCartItem - 从购物车移除商品
10. updateCartItem - 更新购物车商品
11. updateOrder - 更新订单

## 注意事项

- 所有云函数都依赖于 `@alipay/faas-server-sdk` 包
- 安装过程中需要管理员权限 