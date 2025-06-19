Component({
  props: {
    errorMessage: ''
  },
  
  methods: {
    onBack() {
      // 返回上一页
      my.navigateBack();
    }
  }
}); 