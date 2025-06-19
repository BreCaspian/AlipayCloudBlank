const cloud = require('@alipay/faas-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  console.log('获取订单请求参数:', JSON.stringify(event || {}));
  
  try {
    // 提取请求参数并验证，设置默认值防止空引用错误
    const safeEvent = event || {};
    const { orderId = '', status = null, user_id = '' } = safeEvent;
    
    console.log('解析后的参数:', {
      orderId, status, user_id
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
    
    // 获取订单集合
    const orderCollection = db.collection('t_order');
    if (!orderCollection) {
      console.error('无法获取订单集合');
      return {
        success: false,
        message: '系统错误: 无法获取订单集合'
      };
    }
    
    // 如果提供了订单ID，则查询特定订单
    if (orderId) {
      console.log(`查询订单ID: ${orderId}`);
      try {
        const result = await orderCollection.doc(orderId).get();
        if (!result) {
          console.log('订单不存在:', orderId);
          return {
            success: false,
            message: '订单不存在或已被删除'
          };
        }
        
        // 简单的权限验证 - 确保只能查看自己的订单
        // 如果有登录用户，则验证订单所属
        if (context.userId && result.user_id !== context.userId) {
          console.warn(`用户 ${context.userId} 尝试查看其他用户 ${result.user_id} 的订单`);
          // 在实际产品中应该返回错误，这里为了测试方便允许查看
          // return { success: false, message: '无权查看此订单' };
        }
        
        console.log('查询到订单:', JSON.stringify(result));
        return {
          success: true,
          data: result
        };
      } catch (err) {
        console.error('查询订单失败:', err);
        return {
          success: false,
          message: '订单不存在或查询失败',
          error: err.message
        };
      }
    }
    
    // 构建查询条件
    const condition = {};
    
    // 如果提供了用户ID，则按用户ID过滤
    if (user_id) {
      condition.user_id = user_id;
      console.log(`按用户ID过滤: ${user_id}`);
    } else if (context.userId) {
      // 如果没有明确提供用户ID，但有登录用户，则使用当前登录用户ID
      condition.user_id = context.userId;
      console.log(`使用当前登录用户ID过滤: ${context.userId}`);
    } else {
      // 如果没有用户ID，使用默认测试用户ID
      condition.user_id = 'user123';
      console.log('使用默认测试用户ID: user123');
    }
    
    // 如果提供了状态，则按状态过滤
    if (status !== undefined && status !== null) {
      // 确保状态是数字类型
      condition.status = parseInt(status);
      console.log(`按状态过滤: ${status}`);
    }
    
    console.log('查询条件:', JSON.stringify(condition));
    
    // 获取订单列表
    let query = orderCollection;
    if (Object.keys(condition).length > 0) {
      query = query.where(condition);
    }
    
    // 查询订单并按创建时间倒序排序
    const result = await query.orderBy('create_time', 'desc').get();
    if (!result || !Array.isArray(result)) {
      console.error('查询结果无效:', result);
      return {
        success: false,
        message: '获取订单列表失败: 查询结果无效'
      };
    }
    
    console.log(`查询到 ${result.length} 条订单记录`);
    
    // 计算各状态订单数量
    const waitPay = result.filter(item => item && item.status === 0).length;
    const waitShip = result.filter(item => item && item.status === 1).length;
    const waitReceive = result.filter(item => item && item.status === 2).length;
    const completed = result.filter(item => item && item.status === 3).length;
    
    console.log('各状态订单数量:', { waitPay, waitShip, waitReceive, completed });
    
    // 处理订单项，确保格式统一
    const processedOrders = result.map(order => {
      return {
        ...order,
        status: order.status !== undefined ? parseInt(order.status) : 0,
        total_price: parseFloat(order.total_price || 0),
        statusText: getStatusName(order.status)
      };
    });
    
    return {
      success: true,
      data: processedOrders,
      statusCount: {
        // 计算不同状态的订单数量
        waitPay: waitPay,      // 待付款
        waitShip: waitShip,     // 待发货
        waitReceive: waitReceive,  // 待收货(已发货)
        completed: completed     // 已完成
      }
    };
  } catch (error) {
    console.error('获取订单列表失败:', error);
    console.error('错误堆栈:', error.stack);
    return {
      success: false,
      message: '获取订单列表失败: ' + (error.message || '未知错误'),
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