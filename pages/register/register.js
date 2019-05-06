// pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countryCodes: ["86", "80", "84", "87"],
    countryCodeIndex: 0,
    phoneNum: "",
    verifyCode: 1234,
    resVerifyCode: "",
    disable: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '注册',
    })
    wx.cloud.init();
    // 1. 获取数据库引用
    const db = wx.cloud.database();
    // 2. 构造查询语句
    // collection 方法获取一个集合的引用
    // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
    // get 方法会触发网络请求，往数据库取数据
    db.collection('userInfo').where({
      uname:"admin",
      pwd: "admin"
    }).get({
      success(res) {
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 选择国家代码+86
   */
  bindCountryCodeChange: function (e) {
    this.setData({
      countryCodeIndex: e.detail.value
    })
  },

  /**
   * 输入手机号
   * 
   */
  inputPhoneNum: function (e) {
    var value = e.detail.value;
    var that = this;
    that.setData({
      phoneNum: value
    });
    that.goToNext(value, 1);
  },

  /**
   * 获取验证码
   */
  getVerifyCode: function () {
    var that = this;
    var index = that.data.countryCodeIndex;
    var countryCode = that.data.countryCodes[index];
    var phoneNum = that.data.phoneNum;
    if (!/^1[345678]\d{9}$/.test(phoneNum) ){
      wx.showModal({
        title: "提示",
        content: '手机格式错误，请检查输入',
        success: function(res){
          if( res.confirm ){
            console.log("用户点击确定");
          }else if ( res.cancel ){
            console.log("用户点击取消");
          }
        }
      })
      return;
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    setTimeout(function(){
      wx.request({
        //必须是https协议，url里面不能有端口号，这里测试：勾选详情里面的不检验合法域名
        url: 'http://localhost/api/verifyCode',
        data: {
          countryCode: countryCode,
          phoneNum: phoneNum
        },
        success: function (res) {
          that.setData({
            resVerifyCode: res.data.msg
          });
          wx.hideLoading();
          wx.showToast({
            title: ""+res.data.msg
          })
        }
      })
    }, 2000);
  },

  /**
   * 输入验证码
   */
  inputVerifyCode: function (e) {
    var value = e.detail.value;
    var that = this;
    that.setData({
      verifyCode: value
    });
    that.goToNext(value);
  },

  /**
   * 校验能否进行下一步
   */
  goToNext: function(value, num){
    var that = this;
    var disable = that.data.disable;
    var verifyCode = that.data.verifyCode;
    var resVerifyCode = that.data.resVerifyCode;  //后台返回的是Number类型
    var phoneNum = that.data.phoneNum;
    
    if (verifyCode && resVerifyCode && (verifyCode == resVerifyCode) && /^1[345678]\d{9}$/.test(phoneNum)) {
      disable = false;
    } else {
      disable = true;
    }
    that.setData({
      disable: disable
    });
  },
  /**
   * 点击下一步
   */
  formSubmit: function () {
    var that = this;
    var verifyCode = that.data.verifyCode;
    var resVerifyCode = that.data.resVerifyCode;
    
  },

})