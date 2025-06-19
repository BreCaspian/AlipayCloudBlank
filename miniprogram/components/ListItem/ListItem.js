Component({
  props: { 
    item: {
      type: Object,
      value: {}
    },
    checked: {
      type: Boolean,
      value: false
    },
    index: {
      type: Number,
      value: -1
    },
    onCheckChange: null 
  },
  methods: {
    onCheckChange(e) {
      const checked = e.detail.value;
      if (this.props.onCheckChange) {
        this.props.onCheckChange({
          detail: {
            checked,
            index: this.props.index
          }
        });
      }
    }
  }
});