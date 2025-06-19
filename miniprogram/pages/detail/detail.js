Page({  
  data: {  
    schoolId: '',  
    id: '',  
    goodsList: [],  
    productsList: [],  
    productId: '',
    productDetail: null,
    loading: true
  },  

  async onLoad(options) {  
    // 先保存参数  
    this.setData({  
      id: options.id || '',  
      schoolId: options.schoolId || ''  
    });  

    // 初始化云环境  
    try {  
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();

      my.showLoading({ content: '加载中...', delay: 100 });  

      // 调用云函数获取产品列表  
      const res = await new Promise((resolve, reject) => {  
        context.callFunction({  
          name: 'getItem3',  
          success: resolve,  
          fail: reject  
        });  
      });  

      my.hideLoading();  
      
      // 检查结果格式
      console.log('产品列表数据:', res);
      
      this.setData({  
        productsList: res.result || []
      });  
      console.log('productsList:', this.data.productsList);  
    } catch (error) {  
      my.hideLoading();  
      console.error('云函数调用失败:', error);  
      this.setData({  
        productsList: []  
      });
      
      // 显示错误提示
      my.showToast({
        type: 'fail',
        content: '数据加载失败，请重试',
        duration: 2000
      });
    }  

    // 拉取商品数据  
    this.fetchGoodsData();  

    // 如果有需要，调用加载详情数据的函数  
    this.loadDetailData && this.loadDetailData(options.id);  

    const productId = options.id;
    
    if (productId) {
      this.setData({ productId });
      await this.loadProductDetail(productId);
    }
  },  

  fetchGoodsData() {  
    my.showLoading({ content: '加载中...' });  

    my.request({  
      url: 'http://istar.kenwencs.cn:8086/api/admin/get_list?number=7220764129',  
      success: (res) => {  
        my.hideLoading();  
        if (res.data && res.data.retcode === 0) {  
          this.setData({  
            goodsList: res.data.data || []  
          });  
          console.log('goodsList:', this.data.goodsList);  
        } else {  
          console.error('接口返回数据异常:', res);  
          this.setData({ goodsList: [] });  
        }  
      },  
      fail: (err) => {  
        my.hideLoading();  
        console.error('接口请求失败:', err);  
        this.setData({ goodsList: [] });  
      }  
    });  
  },

  async loadProductDetail(productId) {
    this.setData({ loading: true });
    console.log('正在加载商品详情，商品ID:', productId);
    
    try {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
      // 调用云函数获取商品详情
      const res = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'getProduct',
          data: { 
            id: productId
          },
          success: resolve,
          fail: reject
        });
      });
      
      console.log('获取到的商品数据:', res);
      
      // 处理结果
      let productDetail = null;
      if (res.result && res.result.length > 0) {
        productDetail = res.result[0];
      }
      
      console.log('找到的商品详情:', productDetail);
      
    this.setData({
        productDetail,
        loading: false
      });
      
      if (!productDetail) {
        my.showToast({
          type: 'fail',
          content: '商品不存在',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      this.setData({ loading: false });
      my.showToast({
        type: 'fail',
        content: '获取商品详情失败',
        duration: 2000
      });
    }
  },
  
  async addToCart() {
    const { productDetail } = this.data;
    
    if (!productDetail || !productDetail.id) {
      my.showToast({
        type: 'fail',
        content: '商品信息不完整',
        duration: 2000
      });
      return;
    }
    
    const productId = productDetail.id;
    console.log('准备添加商品到购物车，商品ID:', productId, '商品详情:', productDetail);
    
    try {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
      my.showLoading({ content: '正在添加...' });
      
      // 调用云函数添加到购物车
      const res = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'addToCart',
          data: { 
            productId: productId.toString(), // 确保productId是字符串
            quantity: 1 
          },
          success: resolve,
          fail: reject
        });
      });
      
      my.hideLoading();
      console.log('添加购物车返回结果:', res);
      
      if (res.result && res.result.success) {
        // 使用confirm替代toast，提供去购物车的选项
        my.confirm({
          title: '添加成功',
          content: '商品已加入购物车',
          confirmButtonText: '去购物车',
          cancelButtonText: '继续购物',
          success: (result) => {
            if (result.confirm) {
              // 用户点击"去购物车"
              my.switchTab({
                url: '/pages/myCart/myCart'
    });
            }
          }
        });
      } else {
        const errorMsg = (res.result && res.result.message) || '添加失败';
        console.error('添加购物车失败:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      my.hideLoading();
      console.error('添加购物车失败:', error);
      my.showToast({
        type: 'fail',
        content: '添加购物车失败: ' + (error.message || '未知错误'),
        duration: 2000
      });
    }
  },

  // 图片加载错误处理
  imageError() {
    const productDetail = { ...this.data.productDetail };
    if (productDetail) {
      productDetail.url = '/images/default.jpg';
      this.setData({ productDetail });
    }
  }
});