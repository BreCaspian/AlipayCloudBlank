const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { ids } = event;
  
  console.log('删除购物车请求参数:', event);
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    console.error('无效的ID参数:', ids);
    return {
      success: false,
      message: '需要提供要删除的购物车项ID'
    };
  }
  
  try {
    const db = cloud.database();
    const command = db.command;
    
    // 根据ID格式判断使用_id还是id字段进行删除
    const isMongoId = id => id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
    
    // 分类ID
    const mongoIds = ids.filter(id => isMongoId(id));
    const customIds = ids.filter(id => !isMongoId(id) && id);
    
    console.log('MongoDB格式ID:', mongoIds);
    console.log('自定义格式ID:', customIds);
    
    let result = { deleted: 0 };
    
    // 删除MongoDB _id格式的记录
    if (mongoIds.length > 0) {
      console.log('删除MongoDB格式ID的记录:', mongoIds);
      const mongoResult = await db.collection('t_cart').where({
        _id: command.in(mongoIds)
      }).remove();
      
      console.log('MongoDB删除结果:', mongoResult);
      result.deleted += mongoResult.deleted || 0;
    }
    
    // 删除自定义id格式的记录
    if (customIds.length > 0) {
      console.log('删除自定义格式ID的记录:', customIds);
      const customResult = await db.collection('t_cart').where({
        id: command.in(customIds)
      }).remove();
      
      console.log('自定义ID删除结果:', customResult);
      result.deleted += customResult.deleted || 0;
    }
    
    return {
      success: true,
      message: `成功删除${result.deleted}个商品`,
      result: result
    };
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    return {
      success: false,
      message: '删除失败: ' + (error.message || '未知错误'),
      error: error.message || '未知错误'
    };
  }
};