const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { id, quantity, selected } = event;
  
  console.log('更新购物车请求参数:', event);
  
  if (!id) {
    console.error('购物车项ID为空');
    return {
      success: false,
      message: '购物车项ID不能为空'
    };
  }
  
  if (quantity !== undefined && quantity !== null && quantity < 1) {
    console.error('无效的数量:', quantity);
    return {
      success: false,
      message: '商品数量必须大于0'
    };
  }
  
  try {
    const db = cloud.database();
    
    // 准备更新数据
    const updateData = {};
    if (quantity !== undefined && quantity !== null) {
      updateData.quantity = parseInt(quantity);
    }
    if (selected !== undefined) {
      updateData.selected = !!selected;
    }
    
    console.log('准备更新的数据:', updateData);
    
    // 如果没有需要更新的数据，直接返回
    if (Object.keys(updateData).length === 0) {
      console.error('没有提供需要更新的数据');
      return {
        success: false,
        message: '没有提供需要更新的数据'
      };
    }
    
    // 更新购物车项，支持使用_id或id
    let result;
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      // 看起来是MongoDB的_id
      console.log('使用_id更新购物车项:', id);
      result = await db.collection('t_cart').doc(id).update({
        data: updateData // 确保使用data包装更新字段
      });
    } else {
      // 可能是自定义id
      console.log('使用自定义id更新购物车项:', id);
      result = await db.collection('t_cart').where({ id: id }).update({
        data: updateData // 确保使用data包装更新字段
      });
    }
    
    console.log('更新结果:', result);
    
    return {
      success: true,
      message: '更新成功',
      result: result
    };
  } catch (error) {
    console.error('更新购物车商品失败:', error);
    return {
      success: false,
      message: '更新失败: ' + (error.message || '未知错误'),
      error: error.message || '未知错误'
    };
  }
}; 