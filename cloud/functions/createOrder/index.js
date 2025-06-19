const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  console.log('创建订单请求参数:', JSON.stringify(event || {}));
  
  try {
    // 提取请求参数，设置默认值防止空引用错误
    const safeEvent = event || {};
    const { 
      title = '', 
      amount = 0, 
      items = [], 
      address = '', 
      consignee = '', 
      mobile = '', 
      message = '' 
    } = safeEvent;
    
    console.log('解析后的参数:', {
      title, amount, itemsLength: (items || []).length, 
      address, consignee, mobile
    });
    
    // 检查数据库连接
    const db = cloud.database();
    if (!db) {
      console.error('无法连接到数据库');
      return {
        success: false,
        message: '系统错误: 无法连接到数据库'
      };
    }
    
    // 参数校验 - 详细校验每个必要参数
    if (!title) {
      console.log('订单参数验证失败: 缺少订单标题');
      return { success: false, message: '订单标题不能为空' };
    }
    
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      console.log('订单参数验证失败: 金额无效', amount);
      return { success: false, message: '订单金额无效' };
    }
    
    // 验证商品列表
    if (!Array.isArray(items) || items.length === 0) {
      console.log('订单参数验证失败: 商品列表为空或格式不正确');
      return { success: false, message: '订单商品不能为空' };
    }
    
    // 验证地址信息
    if (!address) {
      console.log('订单参数验证失败: 缺少收货地址');
      return { success: false, message: '收货地址不能为空' };
    }
    
    if (!consignee) {
      console.log('订单参数验证失败: 缺少收货人');
      return { success: false, message: '收货人不能为空' };
    }
    
    if (!mobile) {
      console.log('订单参数验证失败: 缺少联系电话');
      return { success: false, message: '联系电话不能为空' };
    }
    
    // 获取用户ID - 从context中获取，如果没有则使用默认值
    // 为确保数据库一致性，统一使用 user_id 字段
    const user_id = context.userId || 'user123'; 
    console.log('当前用户ID:', user_id);
    
    // 生成订单号 - 更精确的唯一订单号
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNo = `${timestamp}${randomNum}`;
    console.log('生成订单号:', orderNo);
    
    // 处理商品数据
    console.log('接收到的原始商品数据:', JSON.stringify(items));
    
    // 确保items格式正确，包含所有必要字段
    const orderItems = items.map(item => {
      // 处理价格和数量，确保为数字类型
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      
      return {
        product_id: item.product_id || item._id || '',
        name: item.name || item.title || '未知商品',
        image: item.image || item.url || '',
        price: price,
        quantity: quantity
      };
    });
    
    console.log('处理后的订单商品:', JSON.stringify(orderItems));
    
    // 创建订单数据对象 - 确保符合数据库定义
    const orderData = {
      id: `order_${timestamp.toString().substr(-6)}${randomNum}`, // 生成简短ID
      user_id: user_id,
      order_no: orderNo,
      total_price: parseFloat(amount) || 0,
      status: 0, // 0:待支付, 1:待发货, 2:已发货, 3:已完成
      create_time: new Date().toISOString().replace('T', ' ').substr(0, 19),
      items: orderItems,
      address: address,
      consignee: consignee,
      mobile: mobile
    };
    
    // 如果有留言，则添加留言字段
    if (message) {
      orderData.message = message;
    }
    
    // 打印完整的订单数据进行确认
    console.log('准备创建订单数据:', JSON.stringify(orderData));
    
    // 获取订单集合
    const orderCollection = db.collection('t_order');
    if (!orderCollection) {
      console.error('无法获取订单集合');
      return { success: false, message: '系统错误: 无法获取订单集合' };
    }
    
    // 执行数据库操作
    try {
      console.log('正在添加订单到数据库...');
      const orderResult = await orderCollection.add({
        data: orderData
      });
      
      if (!orderResult) {
        console.error('订单创建失败: 数据库返回空结果');
        return { success: false, message: '订单创建失败: 数据库操作异常' };
      }
      
      console.log('数据库返回结果:', JSON.stringify(orderResult));
      
      const orderId = orderResult.id || orderResult._id;
      if (!orderId) {
        console.error('订单创建失败: 未返回订单ID');
        return { success: false, message: '订单创建失败: 未返回订单ID' };
      }
      
      console.log('订单创建成功, ID:', orderId);
      return {
        success: true,
        orderId: orderId,
        orderNo: orderNo,
        message: '订单创建成功'
      };
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      // 详细记录错误信息以便调试
      console.error('错误详情:', JSON.stringify(dbError));
      return {
        success: false,
        message: '数据库操作失败: ' + (dbError.message || '未知错误'),
        error: dbError.message,
        errorCode: dbError.code || 'UNKNOWN'
      };
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    // 记录详细的错误信息
    console.error('错误堆栈:', error.stack);
    return {
      success: false,
      message: '创建订单失败: ' + (error.message || '未知错误'),
      error: error.message
    };
  }
}; 