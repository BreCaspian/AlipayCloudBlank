Page({
  data: {
    testResult: '',
    isLoading: false,
    error: ''
  },
  
  onLoad() {
    console.log('Test页面加载');
  },
  
  // 测试云环境连接
  async testCloudEnv() {
    this.setData({
      isLoading: true,
      testResult: '',
      error: ''
    });
    
    try {
      console.log('开始测试云环境');
      // 获取全局云环境上下文
      const app = getApp();
      
      if (!app.getCloudContext) {
        throw new Error('app.getCloudContext方法不存在，请检查app.js');
      }
      
      // 尝试获取云环境上下文
      const context = await app.getCloudContext();
      console.log('云上下文获取成功:', context ? '成功' : '失败');
      
      // 尝试调用testEnv云函数
      const result = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'testEnv', // 使用新建的测试环境函数
          data: {
            timestamp: new Date().getTime(),
            client: 'miniprogram'
          },
          success: (res) => {
            console.log('云函数调用成功:', res);
            resolve(res);
          },
          fail: (err) => {
            console.error('云函数调用失败:', err);
            reject(err);
          }
        });
      });
      
      this.setData({
        testResult: JSON.stringify(result, null, 2),
        isLoading: false
      });
      
      my.showToast({
        type: 'success',
        content: '云环境连接成功!'
      });
    } catch (error) {
      console.error('测试云环境出错:', error);
      this.setData({
        error: error.message || '未知错误',
        isLoading: false
      });
      
      my.showToast({
        type: 'fail',
        content: '云环境连接失败!'
      });
    }
  },

  // 测试默认云函数
  async testHelloworld() {
    this.setData({
      isLoading: true,
      testResult: '',
      error: ''
    });
    
    try {
      console.log('开始测试helloworld云函数');
      const app = getApp();
      const context = await app.getCloudContext();
      
      // 调用helloworld云函数测试
      const result = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'helloworld',
          success: (res) => {
            console.log('helloworld调用成功:', res);
            resolve(res);
          },
          fail: (err) => {
            console.error('helloworld调用失败:', err);
            reject(err);
          }
        });
      });
      
      this.setData({
        testResult: JSON.stringify(result, null, 2),
        isLoading: false
      });
      
      my.showToast({
        type: 'success',
        content: 'helloworld调用成功!'
      });
    } catch (error) {
      console.error('helloworld调用出错:', error);
      this.setData({
        error: error.message || '未知错误',
        isLoading: false
      });
    }
  },
  
  // 调试商品数据
  async debugItemData() {
    this.setData({
      isLoading: true,
      testResult: '',
      error: ''
    });
    
    try {
      console.log('开始调试商品数据');
      const app = getApp();
      const context = await app.getCloudContext();
      
      // 调用debugItems云函数
      const result = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'debugItems',
          success: (res) => {
            console.log('调试函数返回:', res);
            resolve(res);
          },
          fail: (err) => {
            console.error('调试函数调用失败:', err);
            reject(err);
          }
        });
      });
      
      this.setData({
        testResult: JSON.stringify(result, null, 2),
        isLoading: false
      });
      
      my.showToast({
        type: 'success',
        content: '数据调试完成!'
      });
    } catch (error) {
      console.error('调试商品数据出错:', error);
      this.setData({
        error: error.message || '未知错误',
        isLoading: false
      });
    }
  }
});
