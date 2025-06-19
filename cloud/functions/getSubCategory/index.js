const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { categoryId } = event;
  const db = cloud.database();
  
  // 如果没有提供分类ID，则返回所有子分类
  if (!categoryId) {
    const collection = db.collection('t_sub_category');
    const result = await collection.get();
    return result;
  }
  
  // 如果提供了分类ID，则返回该分类下的子分类
  const collection = db.collection('t_sub_category');
  const result = await collection.where({
    category_id: categoryId
  }).get();
  
  return result;
}; 