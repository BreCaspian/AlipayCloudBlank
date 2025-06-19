Page({
  data: {
    userInfo: {
      avatar: '/images/R-C.png',
      nickname: 'Joe',
      phone: '19922023525'
    },
    settings: [
      { id: 'notification', title: '消息通知', value: true, type: 'switch' },
      { id: 'privacy', title: '隐私设置', type: 'navigate' },
      { id: 'about', title: '关于我们', type: 'navigate' },
      { id: 'version', title: '当前版本', value: '1.0.0', type: 'info' }
    ]
  },
  
  onLoad() {
    // 页面加载时的处理逻辑
  },
  
  // 开关设置的变化处理
  onSwitchChange(e) {
    const { id } = e.target.dataset;
    const { value } = e.detail;
    
    // 更新设置值
    const updatedSettings = this.data.settings.map(item => {
      if (item.id === id) {
        return { ...item, value };
      }
      return item;
    });
    
    this.setData({ settings: updatedSettings });
    
    // 本地存储设置
    my.setStorage({
      key: `setting_${id}`,
      data: value,
      success: () => {
        console.log(`设置 ${id} 已保存`);
      }
    });
    
    // 如果是消息通知开关，可以添加特殊处理
    if (id === 'notification') {
      // 这里可以添加推送设置相关逻辑
      console.log(`消息通知设置更新为: ${value ? '开启' : '关闭'}`);
    }
  },
  
  // 导航设置的点击处理
  onSettingItemTap(e) {
    const { id, type } = e.currentTarget.dataset;
    
    if (type === 'navigate') {
      // 根据ID跳转到不同的页面
      switch (id) {
        case 'privacy':
          // 由于可能没有隐私设置页面，可以使用toast提示
          my.showToast({
            type: 'none',
            content: '隐私设置功能开发中',
            duration: 2000
          });
          break;
        case 'about':
          // 由于可能没有关于我们页面，这里直接显示对话框
          my.showModal({
            title: '关于我们',
            content: '一个提供美味甜点的小程序\n感谢您的使用与支持！',
            showCancel: false,
            confirmButtonText: '我知道了'
          });
          break;
        default:
          break;
      }
    }
  },
  
  // 退出登录
  onLogout() {
    my.showModal({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 退出登录的逻辑
          console.log('用户确认退出登录');
          
          // 清除本地存储的登录信息
          my.clearStorage({
            success: () => {
              my.showToast({
                type: 'success',
                content: '已退出登录',
                duration: 2000
              });
              
              // 返回到首页
              setTimeout(() => {
                my.switchTab({
                  url: '/pages/index/index'
                });
              }, 2000);
            }
          });
        }
      }
    });
  }
}); 