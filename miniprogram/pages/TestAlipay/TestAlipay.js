Page({
  data: {},
  onLoad() {},
  async pay() {
    const context = await my.cloud.createCloudContext({
      env: 'env-00jxtoex7l0t'
    });
    await context.init();

    context.callFunction({
      name:'myPay',
      success:function(res){
        my.tradePay ({
          // 调用统一收单交易创建接口（alipay.trade.create），获得返回字段支付宝交易号 trade_no
          tradeNO: '2025052222001447040506297665',
          success: res => {
            my.alert ({
              content: JSON.stringify (res),
            });
          },
          fail: error => {
            console.error('调用 my.tradePay 失败: ', JSON.stringify(error));
          },
        });
    },
    fail:function(erro){
      console.log(erro);
    }
    
  })
}
});
