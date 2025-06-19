const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const db = cloud.database();
  
  const collection = db.collection('t_category');
  const result = await collection.get();
  return result;
};