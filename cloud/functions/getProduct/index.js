const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { id, subCategoryId, limit = 10, offset = 0 } = event;
  const db = cloud.database();
  
  console.log('获取商品信息，参数:', event);
  
  // 如果提供了商品ID，则返回该商品详情
  if (id) {
    console.log('通过ID查询商品:', id);
    const collection = db.collection('t_product');
    const result = await collection.where({
      id: id.toString() // 确保ID是字符串类型
    }).get();
    console.log('查询结果:', result);
    
    if (!result || result.length === 0) {
      console.log('未找到商品:', id);
      return [];
    }
    
    return result;
  }
  
  // 如果没有提供子分类ID，则返回所有商品，带分页
  if (!subCategoryId) {
    console.log('获取所有商品，分页:', offset, limit);
    const collection = db.collection('t_product');
    const result = await collection.skip(offset).limit(limit).get();
    console.log('查询结果数量:', result.length);
    return result;
  }
  
  // 如果提供了子分类ID，则返回该子分类下的商品，带分页
  console.log('获取子分类商品，子分类ID:', subCategoryId, '分页:', offset, limit);
  const collection = db.collection('t_product');
  const result = await collection.where({
    sub_category_id: subCategoryId.toString() // 确保子分类ID是字符串类型
  }).skip(offset).limit(limit).get();
  
  console.log('查询结果数量:', result.length);
  return result;
}; 