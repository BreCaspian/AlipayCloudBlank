const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { productId, quantity = 1 } = event;
  
  console.log('添加购物车请求参数:', event);
  console.log('上下文信息:', context);
  
  if (!productId) {
    console.error('商品ID为空');
    return {
      success: false,
      message: '商品ID不能为空'
    };
  }
  
  const db = cloud.database();
  
  try {
    // 使用固定的用户ID，因为小程序环境可能无法获取用户ID
    // 在实际生产环境中，应该从用户登录系统获取真实用户ID
    const user_id = 'user123'; // 使用与示例数据一致的用户ID
    
    console.log('查询商品是否在购物车中, 商品ID:', productId, '用户ID:', user_id);

    // 确认t_product集合中是否存在该商品
    const productCollection = db.collection('t_product');
    const productInfo = await productCollection.where({
      id: productId.toString()
    }).get();
    
    console.log('查询到的商品信息:', productInfo);
    
    if (!productInfo || productInfo.length === 0) {
      console.error('商品不存在:', productId);
      return {
        success: false,
        message: '商品不存在'
      };
    }
    
    // 尝试获取t_cart集合
    const cartCollection = db.collection('t_cart');
    
    // 先查询该商品是否已在购物车中
    const existingItem = await cartCollection.where({
      product_id: productId.toString(), // 确保ID是字符串类型
      user_id: user_id
    }).get();
    
    console.log('查询结果:', existingItem);
    
    let result;
    
    // 如果已存在，则更新数量
    if (existingItem && existingItem.length > 0) {
      const currentItem = existingItem[0];
      const newQuantity = parseInt(currentItem.quantity || 0) + parseInt(quantity);
      
      console.log('更新购物车数量, 原数量:', currentItem.quantity, '新数量:', newQuantity);
      
      // 使用文档ID更新
      if (currentItem._id) {
        // 确保更新数据不为空
        const updateData = {
          quantity: newQuantity,
          selected: true
        };
        
        console.log('准备更新数据:', updateData);
        
        result = await cartCollection.doc(currentItem._id).update({
          data: updateData // 确保使用data包装更新字段
        });
      } else {
        // 如果没有_id，使用where条件更新
        const updateData = {
          quantity: newQuantity,
          selected: true
        };
        
        console.log('准备更新数据(通过where):', updateData);
        
        result = await cartCollection.where({
          product_id: productId.toString(),
          user_id: user_id
        }).update({
          data: updateData // 确保使用data包装更新字段
        });
      }
      
      console.log('更新结果:', result);
      
      return {
        success: true,
        message: '商品数量已更新',
        result
      };
    } 
    // 如果不存在，则添加新商品到购物车
    else {
      console.log('添加新商品到购物车');
      
      // 生成唯一ID
      const cartId = 'cart_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      
      // 准备购物车项数据
      const cartItem = {
        id: cartId,
        product_id: productId.toString(), // 确保ID是字符串类型
        quantity: parseInt(quantity),
        selected: true, // 默认选中
        user_id: user_id,
        create_time: new Date().toISOString().replace('T', ' ').substr(0, 19)
      };
      
      console.log('准备添加购物车项:', cartItem);
      
      // 添加到购物车，确保使用正确的data结构
      result = await cartCollection.add({
        data: cartItem // 确保使用data包装添加的文档
      });
      
      console.log('添加结果:', result);
      
      return {
        success: true,
        message: '商品已添加到购物车',
        result
      };
    }
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return {
      success: false,
      message: '添加到购物车失败: ' + (error.message || '未知错误'),
      error: error.message || '未知错误'
    };
  }
}; 