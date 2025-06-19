Page({
  data: {
    orders: [],
    loading: false,
    currentStatus: '', // 当前查看的订单状态
    statusMap: {
      '0': '待付款',
      '1': '待发货',
      '2': '待收货',
      '3': '已完成'
    },
    errorMessage: '',
    statusBarHeight: 0 // 状态栏高度
  },
  
  onLoad(options) {
    // 获取传入的状态参数
    const status = options.status !== undefined ? options.status : '';
    this.setData({
      currentStatus: status
    });
    console.log('订单列表页面加载，状态:', status);
    
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
          .select('.order-list-page')
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
  
  onShow() {
    this.loadOrders();
  },
  
  async loadOrders() {
    if (this.data.loading) return;
    
    this.setData({ loading: true, errorMessage: '' });
    
    try {
      const app = getApp();
      const context = await app.getCloudContext();
      
      // 准备请求参数
      const requestData = {
        user_id: 'user123' // 使用默认测试用户ID，与其他函数保持一致
      };
      
      if (this.data.currentStatus !== '') {
        requestData.status = parseInt(this.data.currentStatus);
      }
      
      console.log('请求订单列表，参数:', requestData);
      
      const res = await this._callCloudFunction(context, 'getOrder', requestData);
      
      if (res && res.result && res.result.success) {
        // 确保数据是数组
        let orders = res.result.data || [];
        if (!Array.isArray(orders)) {
          console.error('订单数据不是数组:', orders);
          orders = [];
        }
        
        // 对订单按创建时间倒序排序
        orders.sort((a, b) => {
          return new Date(b.create_time || 0) - new Date(a.create_time || 0);
        });
        
        // 处理订单数据，确保所有字段格式正确
        const processedOrders = orders.map(order => {
          return {
            ...order,
            status: order.status !== undefined ? parseInt(order.status) : 0,
            statusText: this.data.statusMap[order.status] || '未知状态',
            total_price: parseFloat(order.total_price || 0).toFixed(2),
            items: Array.isArray(order.items) ? order.items : []
          };
        });
        
        this.setData({ orders: processedOrders });
        console.log('处理后的订单数据:', processedOrders);
      } else {
        console.error('获取订单列表失败:', res);
        this.setData({
          errorMessage: res && res.result ? res.result.message : '获取订单列表失败',
          orders: []
        });
      }
    } catch (error) {
      console.error('加载订单列表异常:', error);
      this.setData({
        errorMessage: '加载订单失败: ' + (error.message || '未知错误'),
        orders: []
      });
      my.showToast({
        type: 'fail',
        content: '加载订单失败',
        duration: 2000
      });
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
  
  // 查看订单详情
  viewOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    
    my.navigateTo({
      url: `/pages/orderDetail/orderDetail?orderId=${id}`
    });
  },
  
  // 切换订单状态标签
  switchStatus(e) {
    const { status } = e.currentTarget.dataset;
    this.setData({
      currentStatus: status
    });
    this.loadOrders();
  },
  
  // 返回上一页
  goBack() {
    my.navigateBack();
  }
}); 