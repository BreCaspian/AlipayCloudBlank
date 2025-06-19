// pages/myinfo/myinfo.js
Page({
  data: {
    categories: [], // 分类数据
    subCategories: [], // 子分类数据
    currentCategoryId: '', // 当前选中的分类ID
    swiperImages: [
      { url: '/images/1.jpg', cloudUrl: 'https://env-00jxtoex7l0t.normal.cloudstatic.cn/Plot/%E8%BD%AE%E6%92%AD%E5%9B%BE/%E7%AC%AC%E4%B8%80%E5%BC%A0.jpg' },
      { url: '/images/2.jpg', cloudUrl: 'https://env-00jxtoex7l0t.normal.cloudstatic.cn/Plot/%E8%BD%AE%E6%92%AD%E5%9B%BE/%E7%AC%AC%E4%BA%8C%E5%BC%A0.jpg' },
      { url: '/images/2.jpg', cloudUrl: 'https://env-00jxtoex7l0t.normal.cloudstatic.cn/Plot/%E8%BD%AE%E6%92%AD%E5%9B%BE/%E7%AC%AC%E4%B8%89%E5%BC%A0.jpg' }
    ],
    useCloudImages: true
  },

  async onLoad() {
    my.showLoading({
      content: '加载中...',
      delay: '100',
    });
    
    try {
      await this.loadCategories();
    } catch (error) {
      console.error('页面加载出错:', error);
      my.showToast({
        type: 'fail',
        content: '数据加载失败，请重试',
        duration: 2000
          });
    } finally {
      my.hideLoading();
    }
  },
  
  async loadCategories() {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
    // 获取分类数据
      const categoryRes = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'getCategory',
          success: (res) => {
          console.log('分类数据:', res);
            resolve(res);
          },
          fail: (erro) => {
            console.error('获取分类数据失败:', erro);
            reject(erro);
          }
        });
      });
      
    const categories = categoryRes.result || [];
    this.setData({ categories });
    
    // 如果有分类数据，默认选择第一个分类
    if (categories.length > 0) {
      const firstCategory = categories[0];
      this.setData({ currentCategoryId: firstCategory.id });
      await this.loadSubCategories(firstCategory.id);
          }
  },
  
  async loadSubCategories(categoryId) {
    if (!categoryId) return;
    
    this.setData({ currentCategoryId: categoryId });
    
    try {
      // 使用全局云环境上下文
      const app = getApp();
      const context = await app.getCloudContext();
      
      // 获取子分类数据
      const subCategoryRes = await new Promise((resolve, reject) => {
        context.callFunction({
          name: 'getSubCategory',
          data: { categoryId },
          success: (res) => {
            console.log('子分类数据:', res);
            resolve(res);
          },
          fail: (erro) => {
            console.error('获取子分类数据失败:', erro);
            reject(erro);
          }
        });
      });
      
      // 为每个子分类添加本地图片路径
      const subCategories = subCategoryRes.result || [];
      const subCategoriesWithIcons = subCategories.map(item => {
        const subCategoryId = item.id;
        let iconPath = '';
        
        // 根据子分类ID选择对应的图片
        switch(subCategoryId) {
          case '101': // 水果千层
            iconPath = '/Plot/千层/芒果樱桃千层.jpg';
            break;
          case '102': // 巧克力千层
            iconPath = '/Plot/千层/奥利奥芒果千层.jpg';
            break;
          case '201': // 蛋糕
            iconPath = '/Plot/甜品/草莓奶油蛋糕.jpg';
            break;
          case '202': // 甜点
            iconPath = '/Plot/甜品/蓝莓巴斯克.jpg';
            break;
          case '301': // 花卉蛋糕
            iconPath = '/Plot/生日蛋糕/鲜花蛋糕.jpg';
            break;
          case '302': // 主题蛋糕
            iconPath = '/Plot/生日蛋糕/爱心.jpg';
            break;
          case '401': // 咖啡
            iconPath = '/Plot/饮品/经典拿铁.jpg';
            break;
          case '402': // 特调饮品
            iconPath = '/Plot/饮品/青提柠檬冰茉莉.jpg';
            break;
          default:
            iconPath = '/images/default.jpg';
        }
        
        return {
          ...item,
          icon: iconPath
        };
      });
      
      this.setData({ subCategories: subCategoriesWithIcons });
    } catch (error) {
      console.error('加载子分类失败:', error);
      my.showToast({
        type: 'fail',
        content: '加载子分类失败',
        duration: 2000
      });
    }
  },
  
  // 分类点击事件
  onCategoryTap(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.loadSubCategories(categoryId);
  },
  
  // 子分类点击事件
  onSubCategoryTap(e) {
    const subCategoryId = e.currentTarget.dataset.id;
    const subCategoryName = e.currentTarget.dataset.name;
    
    my.navigateTo({
      url: `/pages/index/index?subCategoryId=${subCategoryId}&subCategoryName=${subCategoryName}`
    });
  },
  
  // 轮播图片错误处理
  swiperImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.log('轮播图片加载失败:', index);
    
    // 如果云图片加载失败，使用备用图片
      const images = this.data.swiperImages.slice();
    images[index].cloudUrl = 'https://env-00jxtoex7l0t.normal.cloudstatic.cn/Plot/%E8%BD%AE%E6%92%AD%E5%9B%BE/%E7%AC%AC%E4%B8%80%E5%BC%A0.jpg';
      this.setData({
        swiperImages: images
      });
      console.log('使用备用图片');
  },
  
  onPullDownRefresh() {
    this.loadCategories().then(() => {
      my.stopPullDownRefresh();
    }).catch(error => {
      console.error('刷新数据失败:', error);
      my.stopPullDownRefresh();
    });
  }
});