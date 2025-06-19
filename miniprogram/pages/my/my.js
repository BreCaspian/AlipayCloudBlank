Page({
  data: {
    userInfo: {
      avatar: '/images/R-C.png',
      nickname: 'Joe'
    },
    orderStats: {
      waitPay: 0,
      waitShip: 0,
      waitReceive: 0,
      completed: 0
    },
    loading: false
  },

  onShow() {
    this.loadOrderStats();
  },

  async loadOrderStats() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
      const res = await this._callCloudFunction(context, 'getOrder');

      if (res && res.result && res.result.success) {
        const statusCount = res.result.statusCount || {};
        
        this.setData({
          orderStats: {
            waitPay: parseInt(statusCount.waitPay || 0),
            waitShip: parseInt(statusCount.waitShip || 0),
            waitReceive: parseInt(statusCount.waitReceive || 0),
            completed: parseInt(statusCount.completed || 0)
          }
        });
        
        console.log('订单统计数据已更新:', this.data.orderStats);
      } else {
        console.error('获取订单统计失败:', res);
        // 不显示错误提示，使用默认值
      }
    } catch (error) {
      console.error('加载订单统计失败:', error);
      // 不显示错误提示，使用默认值
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 辅助函数：封装云函数调用为Promise
  _callCloudFunction(context, name, data = {}) {
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

  // 跳转到订单列表
  navigateToOrders(e) {
    const { status } = e.currentTarget.dataset;
    my.navigateTo({
      url: `/pages/orderList/orderList?status=${status || ''}`
    });
  },
  
  // 跳转到设置页面
  navigateToSettings() {
    my.navigateTo({
      url: '/pages/settings/settings'
    });
  },
  
  // 跳转到帮助中心
  navigateToHelpCenter() {
    my.navigateTo({
      url: '/pages/helpCenter/helpCenter'
    });
  },
  
  // 跳转到联系客服
  navigateToCustomerService() {
    my.navigateTo({
      url: '/pages/customerService/customerService'
    });
  }
});