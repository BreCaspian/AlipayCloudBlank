Page({
  data: {
    faqCategories: [
      {
        id: 'order',
        title: '订单相关',
        faqs: [
          {
            question: '如何查看我的订单?',
            answer: '您可以在"我的"->"我的订单"中查看所有订单信息。点击订单可以查看订单详情。'
          },
          {
            question: '订单支付后多久发货?',
            answer: '正常情况下，我们会在您支付成功后24小时内安排发货。如遇节假日或特殊情况，发货时间可能会有所延长。'
          },
          {
            question: '如何取消订单?',
            answer: '待付款状态的订单可以直接取消；已付款但未发货的订单，可以联系客服申请取消并退款；已发货的订单无法取消，但可以申请退货退款。'
          }
        ]
      },
      {
        id: 'payment',
        title: '支付问题',
        faqs: [
          {
            question: '支持哪些支付方式?',
            answer: '目前支持支付宝支付。'
          },
          {
            question: '支付成功但订单显示未支付?',
            answer: '支付成功后如订单状态未更新，请等待1-2分钟后刷新页面。如仍未更新，请联系客服处理。'
          }
        ]
      },
      {
        id: 'delivery',
        title: '配送问题',
        faqs: [
          {
            question: '配送范围和时间?',
            answer: '我们目前支持全国大部分地区配送，一般在发货后3-5天送达。偏远地区可能需要5-10天。'
          },
          {
            question: '如何修改收货地址?',
            answer: '订单支付前可以直接修改；订单支付后但未发货，可以联系客服修改；订单发货后无法修改收货地址。'
          }
        ]
      }
    ],
    expandedFaqIds: [],
    searchQuery: '',
    filteredFaqCategories: [],
    isSearching: false
  },

  onLoad() {
    // 初始化过滤后的FAQ列表
    this.setData({
      filteredFaqCategories: this.data.faqCategories
    });
  },
  
  // 切换FAQ展开/折叠状态
  toggleFaq(e) {
    const { faqId } = e.currentTarget.dataset;
    const { expandedFaqIds } = this.data;
    
    if (expandedFaqIds.includes(faqId)) {
      // 如果已经展开，则折叠
      this.setData({
        expandedFaqIds: expandedFaqIds.filter(id => id !== faqId)
      });
    } else {
      // 如果折叠，则展开
      this.setData({
        expandedFaqIds: [...expandedFaqIds, faqId]
      });
      
      // 添加轻微振动反馈
      my.vibrate({
        type: 'short'
      });
    }
  },
  
  // 处理搜索输入
  handleSearchInput(e) {
    const searchQuery = e.detail.value.trim().toLowerCase();
    
    this.setData({
      searchQuery,
      isSearching: searchQuery.length > 0
    });
    
    this.filterFaqs(searchQuery);
  },
  
  // 根据搜索关键词过滤FAQ
  filterFaqs(query) {
    if (!query) {
      this.setData({
        filteredFaqCategories: this.data.faqCategories,
        isSearching: false
      });
      return;
    }
    
    // 搜索逻辑
    const filteredCategories = this.data.faqCategories.map(category => {
      // 过滤符合条件的FAQ
      const filteredFaqs = category.faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      );
      
      // 返回包含过滤后FAQ的新分类对象
      return {
        ...category,
        faqs: filteredFaqs
      };
    }).filter(category => category.faqs.length > 0); // 只保留包含FAQ的分类
    
    this.setData({
      filteredFaqCategories: filteredCategories
    });
  },
  
  // 清除搜索
  clearSearch() {
    this.setData({
      searchQuery: '',
      filteredFaqCategories: this.data.faqCategories,
      isSearching: false
    });
  },
  
  // 联系客服
  contactCustomerService() {
    // 添加轻微振动反馈
    my.vibrate({
      type: 'short'
    });
    
    // 导航到客服页面
    my.navigateTo({
      url: '/pages/customerService/customerService'
    });
  }
}); 