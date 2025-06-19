const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  console.log('获取购物车列表，参数:', event);
  console.log('上下文信息:', context);
  
  const db = cloud.database();
  try {
    // 使用固定的用户ID，与addToCart保持一致
    const user_id = 'user123';
    
    // 获取购物车数据
    const cartCollection = db.collection('t_cart');
    console.log('查询用户的购物车数据:', user_id);
    
    // 直接获取原始数据，不处理结果格式
    const cartResult = await cartCollection.where({
      user_id: user_id
    }).get();
    
    console.log('购物车原始查询结果:', cartResult);
    
    // 如果没有数据，直接返回空数组
    if (!cartResult || !cartResult.length) {
      console.log('购物车为空');
      return [];
    }
    
    // 获取购物车中所有商品的ID
    const productIds = cartResult.map(item => item.product_id);
    console.log('购物车中的商品ID:', productIds);
    
    // 确保所有productIds都是字符串类型
    const normalizedProductIds = productIds.map(id => id ? id.toString() : '');
    console.log('标准化后的商品ID:', normalizedProductIds);
    
    // 获取商品详情
    const productCollection = db.collection('t_product');
    const productsResult = await productCollection.where({
      id: db.command.in(normalizedProductIds)
    }).get();
    
    console.log('商品查询原始结果:', productsResult);
    
    // 创建商品ID到商品信息的映射
    const productMap = {};
    productsResult.forEach(product => {
      // 确保使用字符串ID作为键
      if (product && product.id) {
        productMap[product.id.toString()] = product;
      }
    });
    
    console.log('商品ID映射:', Object.keys(productMap));
    
    // 组合购物车数据和商品详情
    const result = cartResult.map(cartItem => {
      // 确保product_id是字符串
      const product_id = cartItem.product_id ? cartItem.product_id.toString() : '';
      const product = productMap[product_id] || {};
      
      console.log(`处理购物车项: ${cartItem._id}, 商品ID: ${product_id}, 找到商品: ${!!product.id}`);
      
      return {
        _id: cartItem._id,
        id: cartItem.id || cartItem._id,
        quantity: parseInt(cartItem.quantity || 1),
        selected: cartItem.selected === undefined ? true : !!cartItem.selected,
        product_id: product_id,
        name: product.name || '未知商品',
        price: parseFloat(product.price || 0),
        url: product.url || '',
        create_time: cartItem.create_time || new Date().toISOString().replace('T', ' ').substr(0, 19)
      };
    });
    
    console.log('返回的购物车数据:', result);
    
    // 直接返回结果数组
    return result;
  } catch (error) {
    console.error('获取购物车列表失败:', error);
    console.log('错误详情:', error.message, error.stack);
    
    // 返回空数组
    return [];
  }
}; 