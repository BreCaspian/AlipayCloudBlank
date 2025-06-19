Component({
  props: {
    totalPrice: {
      type: Number,
      value: 0,
      observer: function(newVal) {  
        console.log('totalPrice changed:', newVal);
      }
    },
    checkedCount: {
      type: Number,
      value: 0
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onCheckout() {
      console.log('组件内结算按钮点击'); 
      if (!this.data.disabled) {
        this.triggerEvent('checkout', {
          totalPrice: this.data.totalPrice,
          checkedCount: this.data.checkedCount
        });
      }
    }
  }
});