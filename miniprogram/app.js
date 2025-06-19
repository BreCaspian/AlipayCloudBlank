App({
  // 全局云环境对象
  cloudContext: null,
  globalData: {
    networkAvailable: true,
    cloudInitialized: false,
    cloudInitError: null
  },
  
  async onLaunch(options) {
    // 第一次打开
    // options.query == {number:1}
    console.info('App onLaunch');
    
    // 检查网络状态
    this.checkNetworkStatus();
    
    // 监听网络状态变化
    my.onNetworkStatusChange((res) => {
      console.log('网络状态变化:', res.isConnected);
      this.globalData.networkAvailable = res.isConnected;
      if (!res.isConnected) {
        my.showToast({
          type: 'fail',
          content: '网络连接已断开',
          duration: 2000
        });
      }
    });
    
    // 初始化云环境
    try {
    await this.initializeCloud();
    } catch (error) {
      console.error('初始化云环境失败:', error);
      // 不阻止应用启动，但会在后续需要云服务时再次尝试初始化
    }
  },
  
  // 检查网络状态
  checkNetworkStatus() {
    my.getNetworkType({
      success: (res) => {
        console.log('当前网络类型:', res.networkType);
        this.globalData.networkAvailable = res.networkType !== 'NONE';
        if (res.networkType === 'NONE') {
          my.showToast({
            type: 'fail',
            content: '当前无网络连接',
            duration: 2000
          });
        }
      }
    });
  },
  
  // 初始化云环境
  async initializeCloud() {
    try {
      console.log('正在初始化云环境...');
      
      if (!my.cloud) {
        throw new Error('当前环境不支持云开发功能，请确认IDE版本是最新的');
      }
      
      const context = await my.cloud.createCloudContext({
        env: 'env-00jxtoex7l0t' // 云环境ID
      });
      
      if (!context) {
        throw new Error('云上下文创建失败');
      }
      
      await context.init();
      this.cloudContext = context;
      this.globalData.cloudInitialized = true;
      console.log('云环境初始化成功:', context);
      
      // 测试调用云函数，确认通信正常
      try {
        const testResult = await new Promise((resolve, reject) => {
          context.callFunction({
            name: 'getCategory', // 使用一个简单的函数测试
            data: {},
            success: resolve,
            fail: reject
          });
        });
        
        console.log('云函数测试调用成功:', testResult);
      } catch (testError) {
        console.warn('云函数测试调用失败:', testError);
        // 不抛出异常，继续初始化过程
      }
    } catch (error) {
      console.error('云环境初始化失败:', error);
      this.globalData.cloudInitError = error.message || '未知错误';
      this.globalData.cloudInitialized = false;
      
      // 显示错误提示
      my.showToast({
        type: 'fail',
        content: '云环境初始化失败，请重启应用',
        duration: 3000
      });
      
      throw error; // 向上抛出错误
    }
  },
  
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
  
  onTouchStart(e){
    e.preventDefault();
  },
  
  onPullDownRefresh() {
    console.log('下拉刷新触发');
    // 模拟刷新数据的操作，比如请求新的数据
    setTimeout(() => {
        console.log('数据刷新完成');
        // 停止下拉刷新动画
        my.stopPullDownRefresh();
    }, 2000);
  },

  // 获取云环境上下文的公共方法
  async getCloudContext() {
    // 检查网络状态
    if (!this.globalData.networkAvailable) {
      my.showToast({
        type: 'fail',
        content: '网络连接异常，请检查网络设置',
        duration: 2000
      });
      throw new Error('网络连接异常');
    }
    
    // 如果已经有云环境上下文，直接返回
    if (this.cloudContext) {
      return this.cloudContext;
    }
    
    // 如果之前初始化失败，再次尝试初始化
    if (this.globalData.cloudInitError) {
      console.error('之前云环境初始化失败，正在重试...');
      try {
      await this.initializeCloud();
        if (this.cloudContext) {
          return this.cloudContext;
        }
      } catch (error) {
        console.error('重试初始化云环境失败:', error);
        throw new Error(`云环境初始化失败: ${this.globalData.cloudInitError}`);
      }
    }
    
    // 如果以上都不成功，尝试创建新的云环境上下文
    try {
      console.log('创建新的云环境上下文...');
      const context = await my.cloud.createCloudContext({
        env: 'env-00jxtoex7l0t' // 云环境ID
      });
      
      if (!context) {
        throw new Error('创建云上下文失败');
      }
      
      await context.init();
      this.cloudContext = context;
      this.globalData.cloudInitialized = true;
      this.globalData.cloudInitError = null;
      return context;
    } catch (error) {
      console.error('获取云环境上下文失败:', error);
      this.globalData.cloudInitError = error.message;
      
      my.showToast({
        type: 'fail',
        content: '云服务连接失败，请重试',
        duration: 2000
      });
      throw error;
    }
  }
});