Page({
  data: {
    orderId: '',
    orderInfo: null,
    loading: true,
    errorMessage: '',
    statusMap: {
      '0': '待付款',
      '1': '待发货',
      '2': '待收货',
      '3': '已完成'
    },
    statusBarHeight: 0 // 状态栏高度
  },
  
  onLoad(options) {
    const { orderId } = options;
    if (!orderId) {
      this.setData({
        loading: false,
        errorMessage: '订单ID不能为空'
      });
      return;
    }
    
    this.setData({ orderId });
    this.loadOrderDetail();
    
    // 获取系统信息设置状态栏高度
    this.getSystemInfo();
  },
  
  // 获取系统信息
  getSystemInfo() {
    my.getSystemInfo({
      success: (res) => {
        console.log('系统信息:', res);
        this.setData({
          statusBarHeight: res.statusBarHeight || 0
        });
        
        // 动态设置安全区域
        my.createSelectorQuery()
          .select('.order-detail-page')
          .boundingClientRect()
          .exec((ret) => {
            if (ret && ret[0]) {
              const dynamicStyle = `padding-top: ${this.data.statusBarHeight}px;`;
              my.setCanvasStyle({
                contentStyle: dynamicStyle,
                success: () => {
                  console.log('设置内容区域样式成功');
                }
              });
            }
          });
      }
    });
  },
  
  async loadOrderDetail() {
    this.setData({ loading: true, errorMessage: '' });
    
    try {
      const app = getApp();
      const context = await app.getCloudContext();
      
      const res = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'getOrder',
          data: { orderId: this.data.orderId },
          success: (result) => {
            console.log('获取订单详情成功:', result);
            resolve(result);
          },
          fail: (error) => {
            console.error('获取订单详情失败:', error);
            reject(error);
          }
        });
      });
      
      if (res.result && res.result.success && res.result.data) {
        this.setData({
          orderInfo: res.result.data
        });
      } else {
        this.setData({
          errorMessage: (res.result && res.result.message) || '获取订单详情失败'
        });
      }
    } catch (error) {
      console.error('加载订单详情异常:', error);
      this.setData({
        errorMessage: '加载订单详情失败: ' + (error.message || '未知错误')
      });
      my.showToast({
        type: 'fail',
        content: '加载订单详情失败',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 复制订单号
  copyOrderNo() {
    if (!this.data.orderInfo || !this.data.orderInfo.order_no) return;
    
    my.setClipboard({
      text: this.data.orderInfo.order_no,
      success: () => {
        my.showToast({
          type: 'success',
          content: '订单号已复制',
          duration: 2000
        });
      }
    });
  },
  
  // 确认收货
  async confirmReceived() {
    if (!this.data.orderInfo || this.data.orderInfo.status !== 2) return;
    
    try {
      const app = getApp();
      const context = await app.getCloudContext();
      
      my.confirm({
        title: '确认收货',
        content: '确认已收到商品吗？',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        success: async (result) => {
          if (result.confirm) {
            const res = await new Promise((resolve, reject) => {
              context.callFunction({
                name: 'updateOrder',
                data: {
                  orderId: this.data.orderId,
                  status: 3 // 确认收货，订单完成
                },
                success: resolve,
                fail: reject
              });
            });
            
            if (res.result && res.result.success) {
              my.showToast({
                type: 'success',
                content: '确认收货成功',
                duration: 2000
              });
              
              // 重新加载订单信息
              this.loadOrderDetail();
            } else {
              my.showToast({
                type: 'fail',
                content: '确认收货失败',
                duration: 2000
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('确认收货失败:', error);
      my.showToast({
        type: 'fail',
        content: '确认收货失败',
        duration: 2000
      });
    }
  },
  
  // 返回上一页
  goBack() {
    my.navigateBack();
  }
}); 