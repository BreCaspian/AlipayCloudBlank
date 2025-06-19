Page({
  data: {
    products: [],
    subCategoryId: '',
    subCategoryName: '',
    loading: false,
    hasMore: true,
    page: 0,
    pageSize: 10
  },

  onLoad(options) {
    const { subCategoryId, subCategoryName } = options;
    
    this.setData({
      subCategoryId,
      subCategoryName: subCategoryName || '商品列表'
      });
        
    // 加载商品数据
    this.loadProducts(true);
  },
  
  async loadProducts(reset = false) {
    if (this.data.loading) return;
    
    const { subCategoryId, page, pageSize } = this.data;
    const currentPage = reset ? 0 : page;
    
    this.setData({ loading: true });
    
    try {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
      // 添加一个小延迟，让加载动画更明显
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'getProduct',
          data: {
            subCategoryId,
            limit: pageSize,
            offset: currentPage * pageSize
          },
          success: resolve,
          fail: reject
        });
      });
      
      const products = result.result || [];
      
      // 如果是最后一页但产品数量不足pageSize，也标记为没有更多
      const hasMore = products.length === pageSize;
      
          this.setData({
        products: reset ? products : [...this.data.products, ...products],
        loading: false,
        hasMore: hasMore,
        page: currentPage + 1
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      this.setData({ loading: false });
      my.showToast({
        type: 'fail',
        content: '加载商品失败',
        duration: 2000
          });
        }
      },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadProducts(true).then(() => {
      my.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('触发上拉加载更多');
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts();
    }
  },

  // 页面滚动事件
  onPageScroll(e) {
    // 记录滚动位置，便于调试
    console.log('页面滚动位置:', e.scrollTop);
  },

  // 点击商品项
  onProductTap(e) {
    const { id } = e.currentTarget.dataset;
    console.log('点击商品项，商品ID:', id);
    console.log('商品数据:', this.data.products.find(item => item.id === id));
    my.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});