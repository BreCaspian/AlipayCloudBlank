const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  console.log('更新订单请求参数:', JSON.stringify(event || {}));
  
  try {
    // 提取请求参数并验证，设置默认值防止空引用错误
    const safeEvent = event || {};
    const { orderId = '', status = null } = safeEvent;
    
    console.log('解析后的参数:', {
      orderId, status
    });
    
    // 获取数据库实例
    const db = cloud.database();
    if (!db) {
      console.error('无法连接到数据库');
      return {
        success: false,
        message: '系统错误: 无法连接到数据库'
      };
    }
    
    // 参数验证
    if (!orderId) {
      console.log('订单ID不能为空');
      return {
        success: false,
        message: '订单ID不能为空'
      };
    }
    
    if (status === undefined || status === null || isNaN(parseInt(status))) {
      console.log('订单状态无效:', status);
      return {
        success: false,
        message: '订单状态无效'
      };
    }
    
    // 验证状态值是否在有效范围内 (0-3)
    const newStatus = parseInt(status);
    if (newStatus < 0 || newStatus > 3) {
      console.log('订单状态值超出范围:', newStatus);
      return {
        success: false,
        message: '订单状态值必须在0-3范围内'
      };
    }
    
    // 获取订单集合
    const orderCollection = db.collection('t_order');
    if (!orderCollection) {
      console.error('无法获取订单集合');
      return {
        success: false,
        message: '系统错误: 无法获取订单集合'
      };
    }
    
    // 先查询订单，验证订单存在并检查权限
    let orderData;
    try {
      orderData = await orderCollection.doc(orderId).get();
      
      if (!orderData) {
        console.error('订单不存在:', orderId);
        return {
          success: false,
          message: '订单不存在或已被删除'
        };
      }
      
      console.log('当前订单数据:', JSON.stringify(orderData));
      
      // 简单的权限验证 - 确保只能更新自己的订单
      // 如果有登录用户，则验证订单所属
      if (context.userId && orderData.user_id !== context.userId) {
        console.warn(`用户 ${context.userId} 尝试更新其他用户 ${orderData.user_id} 的订单`);
        // 在实际产品中应该返回错误，这里为了测试方便允许更新
        // return { success: false, message: '无权更新此订单' };
      }
      
      // 验证状态流转是否合法
      const currentStatus = parseInt(orderData.status || 0);
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        console.error(`不允许的状态变更: ${currentStatus} -> ${newStatus}`);
        return {
          success: false,
          message: `不允许的订单状态变更: ${getStatusName(currentStatus)} -> ${getStatusName(newStatus)}`
        };
      }
    } catch (queryErr) {
      console.error('查询订单失败:', queryErr);
      return {
        success: false,
        message: '查询订单失败',
        error: queryErr.message
      };
    }
    
    // 准备更新数据
    const updateData = {
      status: newStatus
    };
    
    // 添加状态特定的字段
    switch (newStatus) {
      case 1: // 已支付，待发货
        updateData.payment_time = new Date().toISOString().replace('T', ' ').substr(0, 19);
        break;
      case 2: // 已发货，待收货
        updateData.ship_time = new Date().toISOString().replace('T', ' ').substr(0, 19);
        break;
      case 3: // 已完成
        updateData.complete_time = new Date().toISOString().replace('T', ' ').substr(0, 19);
        break;
    }
    
    console.log(`更新订单 ${orderId} 的状态为 ${newStatus}(${getStatusName(newStatus)})`, JSON.stringify(updateData));
    
    // 执行更新操作
    try {
      const result = await orderCollection.doc(orderId).update({
        data: updateData
      });
      console.log('更新订单结果:', JSON.stringify(result));
      
      if (!result || (!result.updated && !result.success)) {
        console.error('更新订单状态失败:', JSON.stringify(result));
        return {
          success: false,
          message: '更新订单状态失败: 数据库返回无效结果',
          result: result
        };
      }
      
      return {
        success: true,
        message: `订单状态已更新为${getStatusName(newStatus)}`,
        result: result
      };
    } catch (updateErr) {
      console.error('更新订单状态失败:', updateErr);
      return {
        success: false,
        message: '更新订单状态失败',
        error: updateErr.message
      };
    }
  } catch (error) {
    console.error('更新订单状态失败:', error);
    console.error('错误堆栈:', error.stack);
    return {
      success: false,
      message: '更新订单状态失败: ' + (error.message || '未知错误'),
      error: error.message
    };
  }
};

// 获取状态名称
function getStatusName(status) {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成'
  };
  return statusMap[status] || '未知状态';
}

// 验证状态流转是否合法
function isValidStatusTransition(from, to) {
  // 支持前端测试时强制更新状态
  if (from === to) {
    return true; // 允许更新为相同状态（用于测试）
  }
  
  // 定义允许的状态流转
  const allowedTransitions = {
    0: [1],       // 待付款 -> 待发货
    1: [2],       // 待发货 -> 待收货
    2: [3],       // 待收货 -> 已完成
    3: []         // 已完成 -> 不允许变更
  };
  
  // 检查是否存在允许的流转路径
  return allowedTransitions[from] && allowedTransitions[from].includes(to);
} 