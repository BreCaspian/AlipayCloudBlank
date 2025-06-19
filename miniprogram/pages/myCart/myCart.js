Page({
  data: {
    cartItems: [],
    totalPrice: 0,
    cartEmpty: true,
    checkedCount: 0,
    allChecked: false,
    loading: false,
    refreshing: false
},

  async onLoad() {
    this.loadCartData();
  },

  onShow() {
    // 页面显示时，重新加载购物车数据
    this.loadCartData();
  },
  
  // 支持下拉刷新
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    this.setData({ refreshing: true });
    this.loadCartData(true).then(() => {
      my.stopPullDownRefresh();
      this.setData({ refreshing: false });
    });
  },

  // 刷新购物车数据
  refreshCart() {
    this.loadCartData(true);
  },

  async loadCartData(isRefresh = false) {
    try {
      if (!isRefresh) {
        this.setData({ loading: true });
      }
      
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
    
    const res = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'getCartList',
        success: resolve,
        fail: reject
      });
    });

      // 处理返回的数据，确保获取正确的数组
      let cartItems = [];
      
      if (res && res.result) {
        cartItems = Array.isArray(res.result) ? res.result : [];
      }

    this.setData({
        cartItems,
        cartEmpty: cartItems.length === 0,
        loading: false
    });
      
      // 重新计算总价
    this.calculateTotal();
  } catch (error) {
      console.error('加载购物车失败:', error);
      this.setData({ 
        cartEmpty: true,
        loading: false
      });
      my.showToast({ 
        content: '加载购物车失败',
        type: 'fail' 
      });
  }
},
  
  // 选中/取消选中单个商品
onItemCheckChange(e) {
    // 支持两种事件参数格式
    let index, checked;
    
    if (e.detail && (e.detail.index !== undefined)) {
      // 标准格式 {detail: {index, checked}}
      index = e.detail.index;
      checked = e.detail.checked;
    } else {
      // 替代格式：通过dataset获取index，通过e.detail或e.target.checked获取选中状态
      index = e.target.dataset.index || e.currentTarget.dataset.index;
      checked = e.detail || e.target.checked;
    }
    
    if (index === undefined) {
      console.error('无法获取商品索引');
      return;
    }
    
    // 更新对应商品的选中状态
    const key = `cartItems[${index}].selected`;
    this.setData({
      [key]: checked
    });
    
      // 更新全选状态
    const allChecked = this.data.cartItems.every(item => item.selected);
      this.setData({ allChecked });
      
      // 重新计算总价
      this.calculateTotal();
  },

  // 全选/取消全选
toggleAllCheck() {
    const newChecked = !this.data.allChecked;
    const cartItems = this.data.cartItems.map(item => ({
   ...item,
      selected: newChecked
  }));
  
  this.setData({
      cartItems,
    allChecked: newChecked
  });
    
    // 重新计算总价
  this.calculateTotal();
},

  // 计算总价
calculateTotal() {
    const selectedItems = this.data.cartItems.filter(item => item.selected);
    const total = selectedItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
    const checkedCount = selectedItems.length;
    
    this.setData({
      totalPrice: total.toFixed(2),
      checkedCount
    });
  },

  // 删除选中商品
async removeSelected() {
    const selectedItems = this.data.cartItems.filter(item => item.selected);
  
    if (selectedItems.length === 0) {
      my.showToast({ 
        content: '请选择要删除的商品',
        type: 'none' 
      });
    return;
  }
  
  my.confirm({
    title: '提示',
      content: `确定删除选中的${selectedItems.length}件商品吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          my.showLoading({ content: '删除中...' });
            
            // 使用全局云环境上下文
            const app = getApp();
            const context = await app.getCloudContext();
            
            // 获取选中商品的ID
            const selectedIds = selectedItems.map(item => item._id);
          
          await new Promise((resolve, reject) => {
              context.callFunction({
              name: 'removeCartItem',
              data: { ids: selectedIds },
              success: resolve,
              fail: reject
            });
          });
          
          my.showToast({ content: '删除成功' });
          await this.loadCartData();
        } catch (error) {
          console.error('删除失败:', error);
            my.showToast({ 
              content: '删除失败',
              type: 'fail' 
            });
        } finally {
          my.hideLoading();
        }
      }
    }
  });
},

  // 结算
onCheckout() {
  if (this.data.checkedCount === 0) {
    my.showToast({ 
      content: '请选择要结算的商品',
      type: 'none' 
    });
    return;
  }

  try {
    // 获取选中商品
    const selectedItems = this.data.cartItems.filter(item => item.selected);
    
    // 确保所有必要字段
    const formattedItems = selectedItems.map(item => ({
      _id: item._id || '',
      product_id: item.product_id || item._id || '',
      name: item.name || item.title || '未知商品',
      image: item.image || item.url || '',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1
    }));
    
    // 计算总价确保精确
    const totalAmount = formattedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0).toFixed(2);
    
    console.log('准备结算商品:', JSON.stringify(formattedItems));
    console.log('总金额:', totalAmount);

    // 跳转到订单页面
    my.navigateTo({
      url: `/pages/order/order?items=${encodeURIComponent(JSON.stringify(formattedItems))}&totalAmount=${totalAmount}`
    });
  } catch (error) {
    console.error('准备结算时出错:', error);
    my.showToast({ 
      content: '结算异常，请重试',
      type: 'fail' 
    });
  }
},
  
  // 修改商品数量
  async changeQuantity(e) {
    const { index, type } = e.currentTarget.dataset;
    const cartItem = this.data.cartItems[index];
    let newQuantity = cartItem.quantity;
    
    if (type === 'add') {
      newQuantity += 1;
    } else if (type === 'minus') {
      newQuantity = Math.max(1, newQuantity - 1);
    }
    
    // 如果数量没变，不做处理
    if (newQuantity === cartItem.quantity) {
      return;
  }

    // 更新本地数据
    const key = `cartItems[${index}].quantity`;
    this.setData({ [key]: newQuantity });
    
    // 重新计算总价
    this.calculateTotal();
    
    try {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();

      // 更新云数据库中的数量
      await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'updateCartItem',
          data: {
            id: cartItem._id,
            quantity: newQuantity
          },
          success: resolve,
          fail: reject
        });
      });
    } catch (error) {
      console.error('更新商品数量失败:', error);
      my.showToast({
        content: '更新数量失败',
        type: 'fail'
      });
      
      // 如果失败，恢复原来的数量
      const key = `cartItems[${index}].quantity`;
      this.setData({ [key]: cartItem.quantity });
      this.calculateTotal();
    }
  },

  // 去逛逛，跳转到首页
  goToHome() {
    // 根据app.json中的配置，跳转到正确的首页
    my.reLaunch({
      url: '/pages/myinfo/myinfo'
    });
}
});