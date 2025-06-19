Page({
  data: {
    selectedItems: [],
    totalAmount: 0,
    address: {
      name: '测试用户',
      phone: '13800138000',
      address: '广州市天河区体育西路123号'
    },
    loading: false,
    errorMessage: ''
  },

  onLoad(options) {
    let selectedItems = [];
    let totalAmount = 0;
    
    try {
      console.log('订单页面接收到的参数:', JSON.stringify(options));
      
      if (options.items) {
        try {
          selectedItems = JSON.parse(decodeURIComponent(options.items)) || [];
          console.log('解析后的商品数据:', JSON.stringify(selectedItems));
        } catch (parseError) {
          console.error('解析商品数据失败:', parseError);
          my.showToast({
            type: 'fail',
            content: '商品数据解析失败',
            duration: 2000
          });
        }
      }
      
      if (options.totalAmount) {
        totalAmount = parseFloat(options.totalAmount) || 0;
        console.log('订单总金额:', totalAmount);
      }
      
      // 确保商品数据的完整性
      selectedItems = selectedItems.map(item => {
        return {
          ...item,
          product_id: item.product_id || item._id || '',
          name: item.name || item.title || '商品',
          image: item.image || item.url || '',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1
        };
      });
      
      this.setData({
        selectedItems,
        totalAmount,
        errorMessage: ''
      });
    } catch (error) {
      console.error('解析订单参数失败:', error);
      this.setData({
        errorMessage: '订单数据错误，请返回重试'
      });
      my.showToast({
        type: 'fail',
        content: '订单数据错误',
        duration: 2000
      });
    }
  },

  async onSubmitOrder() {
    if (this.data.loading) return;
    
    if (this.data.selectedItems.length === 0) {
      this.setData({
        errorMessage: '订单商品不能为空，请返回选择商品'
      });
      my.showToast({
        type: 'fail',
        content: '订单商品不能为空',
        duration: 2000
      });
      return;
    }
    
    if (!this.data.totalAmount || parseFloat(this.data.totalAmount) <= 0) {
      this.setData({
        errorMessage: '订单金额无效，请返回重试'
      });
      my.showToast({
        type: 'fail',
        content: '订单金额无效',
        duration: 2000
      });
      return;
    }
    
    this.setData({ 
      loading: true,
      errorMessage: '' 
    });
    
    try {
      // 1. 创建订单
      const orderItems = this.data.selectedItems.map(item => ({
        product_id: item.product_id || item._id || '',
        name: item.name || item.title || '未知商品',
        image: item.image || item.url || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      }));
      
      // 获取App全局实例和云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
      console.log('准备创建订单，商品数据:', JSON.stringify(orderItems));
      
      // 创建订单请求数据 - 确保所有必要字段都有值
      const orderData = {
        title: `订单-${new Date().toISOString().slice(0, 10)}`,
        amount: parseFloat(this.data.totalAmount).toFixed(2),
        items: orderItems,
        // 添加地址信息
        consignee: this.data.address.name || '测试用户',
        mobile: this.data.address.phone || '13800138000',
        address: this.data.address.address || '广州市天河区体育西路123号',
        message: '' // 可选的订单留言
      };
      
      console.log('发送创建订单请求数据:', JSON.stringify(orderData));
      
      // 检查数据完整性
      if (!orderData.title || !orderData.amount || !orderData.items || !orderData.items.length) {
        throw new Error('订单数据不完整，请重试');
      }
      
      // 调用创建订单云函数
      const orderRes = await this._callCloudFunction(context, 'createOrder', orderData);

      // 检查订单创建结果
      if (!orderRes || !orderRes.result) {
        throw new Error('创建订单失败: 服务器未返回有效响应');
      }
      
      if (!orderRes.result.success) {
        let errorMsg = orderRes.result.message || '创建订单失败';
        console.error('订单创建返回错误:', errorMsg);
        this.setData({ errorMessage: errorMsg });
        throw new Error(errorMsg);
      }

      if (!orderRes.result.orderId) {
        throw new Error('创建订单失败: 未返回订单ID');
      }

      console.log('订单创建成功，ID:', orderRes.result.orderId);

      // 2. 调用支付接口
      const payData = {
        orderId: orderRes.result.orderId,
        amount: parseFloat(this.data.totalAmount).toFixed(2),
        title: `支付${this.data.totalAmount}元`
      };
      
      console.log('发送支付请求:', JSON.stringify(payData));
      
      const payRes = await this._callCloudFunction(context, 'myPay', payData);

      // 检查支付结果
      if (!payRes || !payRes.result) {
        throw new Error('支付失败: 服务器未返回有效响应');
      }
      
      if (!payRes.result.success) {
        let errorMsg = payRes.result.message || '支付请求失败';
        console.error('支付返回错误:', errorMsg);
        this.setData({ errorMessage: errorMsg });
        throw new Error(errorMsg);
      }

      // 处理部分成功的情况（订单创建和支付成功，但状态更新可能有延迟）
      let successMessage = '支付成功';
      if (payRes.result.partialSuccess) {
        console.log('支付部分成功，状态更新可能有延迟');
        successMessage = payRes.result.message || '订单已创建，稍后可在订单列表查看';
      } else {
        console.log('支付完全成功，订单状态已更新');
      }
      
      // 3. 清空购物车中已购买的商品
      try {
        const selectedItemIds = this.data.selectedItems
          .filter(item => item._id) // 只保留有_id的项目
          .map(item => item._id);
        
        if (selectedItemIds.length > 0) {
          console.log('清空已购买商品:', JSON.stringify(selectedItemIds));
          await this._callCloudFunction(context, 'removeCartItem', { ids: selectedItemIds });
        }
      } catch (cartError) {
        // 清空购物车失败不影响主流程
        console.error('清空购物车异常:', cartError);
      }
      
      // 4. 显示成功提示并跳转
      this.setData({ errorMessage: '' });
      my.showToast({
        type: 'success',
        content: successMessage,
        duration: 2000
      });
      
      // 延迟跳转到订单列表
      setTimeout(() => {
        my.switchTab({
          url: '/pages/my/my'
        });
      }, 2000);
    } catch (error) {
      console.error('提交订单失败:', error);
      
      // 特殊处理：如果错误信息中包含"支付成功但"，表示订单已创建但状态更新失败
      // 这种情况我们应该引导用户去订单列表查看，而不是显示错误
      if (error.message && error.message.includes('支付成功但')) {
        console.log('订单已创建但状态更新失败，引导用户去订单列表');
        
        this.setData({ errorMessage: '' });
        my.showToast({
          type: 'success',
          content: '订单已创建，请在订单列表查看',
          duration: 2000
        });
        
        // 延迟跳转到订单列表
        setTimeout(() => {
          my.switchTab({
            url: '/pages/my/my'
          });
        }, 2000);
        
        return;
      }
      
      this.setData({
        errorMessage: error.message || '提交订单失败，请稍后重试'
      });
      
      my.showToast({
        type: 'fail',
        content: error.message || '提交订单失败',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 辅助函数：封装云函数调用为Promise
  _callCloudFunction(context, name, data) {
    return new Promise((resolve, reject) => {
      context.callFunction({
        name,
        data,
        success: (res) => {
          console.log(`云函数 ${name} 调用结果:`, JSON.stringify(res));
          resolve(res);
        },
        fail: (err) => {
          console.error(`云函数 ${name} 调用失败:`, JSON.stringify(err));
          reject(err);
        }
      });
    });
  },

  // 返回上一页
  goBack() {
    my.navigateBack();
  }
});