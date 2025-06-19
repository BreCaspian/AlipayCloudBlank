Page({
  data: {
    contactMethods: [
      {
        icon: '📞',
        title: '电话咨询',
        content: '400-123-4567',
        action: 'call'
      },
      {
        icon: '📧',
        title: '邮箱咨询',
        content: 'service@example.com',
        action: 'copy'
      },
      {
        icon: '💬',
        title: '在线客服',
        content: '工作时间: 9:00-18:00',
        action: 'chat'
      }
    ],
    businessHours: [
      {
        days: '周一至周五',
        hours: '9:00 - 20:00'
      },
      {
        days: '周六至周日',
        hours: '10:00 - 18:00'
      },
      {
        days: '法定节假日',
        hours: '10:00 - 16:00'
      }
    ],
    faqs: [
      '如何修改订单信息?',
      '如何申请退款?',
      '商品发货时间?',
      '如何修改收货地址?'
    ]
  },
  
  handleContactAction(e) {
    const { action, content } = e.currentTarget.dataset;
    
    switch(action) {
      case 'call':
        this.makePhoneCall(content);
        break;
      case 'copy':
        this.copyToClipboard(content);
        break;
      case 'chat':
        this.openChat();
        break;
      default:
        break;
    }
  },
  
  makePhoneCall(phoneNumber) {
    my.makePhoneCall({
      number: phoneNumber,
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.error('拨打电话失败:', err);
        my.showToast({
          type: 'fail',
          content: '拨打电话失败',
          duration: 2000
        });
      }
    });
  },
  
  copyToClipboard(content) {
    my.setClipboard({
      text: content,
      success: () => {
        my.showToast({
          type: 'success',
          content: '已复制到剪贴板',
          duration: 2000
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        my.showToast({
          type: 'fail',
          content: '复制失败',
          duration: 2000
        });
      }
    });
  },
  
  openChat() {
    // 在实际应用中，可以接入支付宝客服组件
    // 这里仅做模拟
    my.showToast({
      type: 'success',
      content: '正在接入在线客服...',
      duration: 2000
    });
    
    // 模拟延迟后的操作
    setTimeout(() => {
      my.alert({
        title: '客服提示',
        content: '当前客服繁忙，请稍后再试或选择其他联系方式',
        buttonText: '我知道了'
      });
    }, 2000);
  },
  
  navigateToFaq(e) {
    const { index } = e.currentTarget.dataset;
    
    // 可以根据FAQ索引跳转到不同的帮助页面
    my.navigateTo({
      url: '/pages/helpCenter/helpCenter'
    });
  }
}); 