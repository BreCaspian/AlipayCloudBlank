/**
 * 订单系统调试工具
 * 
 * 使用说明：
 * 1. 将此文件放在项目根目录的tools文件夹中
 * 2. 在小程序开发者工具的控制台中输入:
 *    require('../tools/debug-orders.js').debugOrders()
 * 
 * 此工具会:
 * - 检查各个云函数是否可用
 * - 验证订单数据一致性
 * - 显示各状态订单数量
 */

// 调试订单系统
async function debugOrders() {
  console.log('===== 订单系统调试开始 =====');
  
  try {
    // 1. 获取App全局实例和云环境上下文
    const app = getApp();
    const context = await app.getCloudContext();
    if (!context) {
      console.error('获取云环境上下文失败');
      return;
    }
    
    console.log('云环境上下文获取成功');
    
    // 2. 测试getOrder云函数
    console.log('正在测试 getOrder 云函数...');
    const orderRes = await new Promise((resolve, reject) => {
      context.callFunction({
        name: 'getOrder',
        data: {},
        success: resolve,
        fail: reject
      });
    });
    
    if (!orderRes || !orderRes.result || !orderRes.result.success) {
      console.error('getOrder 云函数测试失败:', orderRes);
      return;
    }
    
    console.log('getOrder 云函数测试成功');
    
    // 3. 分析订单数据
    const orders = orderRes.result.data || [];
    const statusCount = orderRes.result.statusCount || {};
    
    console.log(`共找到 ${orders.length} 个订单`);
    console.log('订单状态数量:', statusCount);
    
    // 4. 验证数据一致性
    const actualStatusCount = {
      waitPay: orders.filter(o => o.status === 0).length,
      waitShip: orders.filter(o => o.status === 1).length,
      waitReceive: orders.filter(o => o.status === 2).length,
      completed: orders.filter(o => o.status === 3).length
    };
    
    console.log('实际计算的订单状态数量:', actualStatusCount);
    
    // 检查是否一致
    const isCountConsistent = 
      statusCount.waitPay === actualStatusCount.waitPay &&
      statusCount.waitShip === actualStatusCount.waitShip &&
      statusCount.waitReceive === actualStatusCount.waitReceive &&
      statusCount.completed === actualStatusCount.completed;
    
    console.log('订单状态数量一致性:', isCountConsistent ? '一致' : '不一致');
    
    // 5. 检查订单数据完整性
    let incompleteOrders = 0;
    
    for (const order of orders) {
      const issues = [];
      
      if (!order.order_no) issues.push('缺少订单号');
      if (!order.items || !order.items.length) issues.push('缺少商品项');
      if (order.status === undefined || order.status === null) issues.push('缺少状态');
      if (!order.create_time) issues.push('缺少创建时间');
      if (order.status >= 1 && !order.payment_time) issues.push('缺少支付时间');
      
      if (issues.length > 0) {
        console.warn(`订单 ${order._id} 数据不完整:`, issues.join(', '));
        incompleteOrders++;
      }
    }
    
    console.log(`数据完整性检查完成, ${incompleteOrders} 个订单存在问题`);
    
    // 6. 返回结果摘要
    return {
      success: true,
      orderCount: orders.length,
      statusCount,
      isCountConsistent,
      incompleteOrders
    };
  } catch (error) {
    console.error('订单系统调试失败:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    console.log('===== 订单系统调试结束 =====');
  }
}

// 导出调试函数
module.exports = {
  debugOrders
}; 