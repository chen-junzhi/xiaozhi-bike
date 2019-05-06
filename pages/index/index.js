//index.js

Page({
  data: {
    scale: 18,
    longitude: '0',
    latitude: '0',
    controls: [],
    markers: []
  },
  
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 创建map上下文
    this.mapCtx = wx.createMapContext("myMap");
    var that = this;
    // 1.获取定时器，用于判断是否已经在计费
    that.timer = options.timer;

    // 获取并设置当前位置经纬度
    wx.getLocation({
      success: function(res) {
        var log = res.longitude;
        var lat = res.latitude;
        that.setData({
          longitude: log,
          latitude: lat
        });
        that.mapCtx.moveToLocation();
        that.getBikePosition();
      }
    })
    // 设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({
      success: function(res) {
        //先取到设备宽高
        var windowWidth = res.windowWidth;
        var windowHeight = res.windowHeight;
        that.setData({
          controls: [{
            //扫码开锁
            id: 1,//用id区分控件，对应相关操作
            iconPath: '/images/smks.png',
            position: {//控件的大小及位置
              width: 110,
              height: 50,
              left: windowWidth/2 -55,
              top: windowHeight - 80
            },
            clickable: true
          },
          {
            //定位当前位置
            id: 2,
            iconPath: '/images/location.png',
            position: {
              width: 50,
              height: 50,
              left: 20,
              top: windowHeight - 80
            },
            clickable: true
          },
          {
            //中心点位置
            id: 3,
            iconPath: '/images/marker1.png',
            position: {
              width: 20,
              height: 35,
              left: windowWidth/2 - 10,
              top: windowHeight/2 - 40,
            },
            clickable: true
          },
          {
            //个人中心
            id: 4,
            iconPath: '/images/avatar.png',
            position: {
              width: 45,
              height: 45,
              left: windowWidth - 68,
              top: windowHeight - 155,
            },
            clickable: true
          },
          {
            //警告(报修)
            id: 5,
            iconPath: '/images/warn.png',
            position: {
              width: 50,
              height: 50,
              left: windowWidth - 70,
              top: windowHeight - 80,
            },
            clickable: true
          },{
            //添加(单车)
            id: 6,
            iconPath: '/images/add.png',
            position: {
              width: 35,
              height: 35
            },
            clickable: true
          }]
        })
      },
    })

  },

  /**
   * 控件被点击的事件
   */
  controltap: function(e){
    var that = this;
    var cid = e.controlId;
    switch ( cid ){
      case 1:
        //登录才可以使用服务
        wx.getStorage({
          key: 'userInfo',
          success(res) {
            //已登录
            // 点击扫码开锁，判断当前是否正在计费
            if (that.timer === "" || that.timer === undefined) {
              // 没有在计费就扫码
              wx.scanCode({
                success: (res) => {
                  wx.showLoading({
                    title: '正在获取密码',
                    mask: true
                  })
                  // 请求服务器获取密码和车号
                  wx.request({
                    url: 'https://www.easy-mock.com/mock/5c89e5cc2a8e75520ae33caa/xiaozhibike/password',
                    data: {},
                    method: 'GET',
                    success: (res) => {
                      // 请求密码成功隐藏等待框
                      wx.hideLoading();
                      // 携带密码和车号跳转到密码页
                      wx.redirectTo({
                        url: '../scanresult/scanresult?password=' + res.data.data.password + "&number=" + res.data.data.number,
                        success: (res) => {
                          wx.showToast({
                            title: '获取密码成功',
                            duration: 1000
                          })
                        }
                      })
                    }
                  })
                }
              })
            } else {
              // 当前已经在计费就回退到计费页
              wx.navigateBack({
                delta: 1
              })
            }
          },
          fail(res){
            //未登录
            wx.navigateTo({
              url: '../account/account',
            })
          }
        })
        
        

        //扫码开锁(根据用户状态，跳转到对应的页面)
        /*var status = getApp().globalData.status;
        if( status == 0 ){
          //未注册，跳转到注册页面
          wx.navigateTo({
            url: '../register/register',
          })
        }*/
        break;
      case 2:
        //定位当前位置
        that.mapCtx.moveToLocation()
        break;
      case 3:
        //中心点位置

        break;
      case 4:
        //个人中心
        wx.navigateTo({
          url: '../account/account',
        })
        break;
      case 5:
        //警告
        wx.navigateTo({
          url: '../warn/warn',
        })
        break;
      case 6:
        //添加单车
        var bikes = that.data.markers;
        var length = bikes.length;
        bikes.push({
          id: length,
          iconPath: '/images/markers.png',
          width: 40,
          height: 40,
          longitude: that.data.longitude,
          latitude: that.data.latitude
        })
        that.setData({
          markers: bikes
        })
        break;
    }
  },

  /**
   * 地图标记点击事件，连接用户位置和点击的单车位置
   */
  markertap: function(e){
    var markers = this.data.markers;
    var markerId = e.markerId;
    var curMarker = markers[markerId];

    this.setData({
      polyline: [{
        points: [{ // 连线起点
          longitude: this.data.longitude,
          latitude: this.data.latitude
        }, { // 连线终点(当前点击的标记)
          longitude: curMarker.longitude,
          latitude: curMarker.latitude
        }],
        color: "#FF0000DD",
        width: 1,
        dottedLine: true
      }],
      scale: 18
    });
  },

  /**
   * 拖动地图视野发生变化
   */
  regionchange: function (e) {
    var eType = e.type;
    var that = this;
    if (eType == 'end') {
      //获取拖动后的中心点位置
      that.mapCtx.getCenterLocation({
        success: function (res) {
          /*that.setData({
            longitude: res.longitude,
            latitude: res.latitude
          });*/
          that.data.longitude = res.longitude;
          that.data.latitude = res.latitude;
        }
      })
    }
  },

  /**
   * 获取周边单车
   */
  getBikePosition: function(){
    var that = this;
    // 请求服务器，显示附近的单车，用marker标记
    wx.request({
      url: 'https://www.easy-mock.com/mock/5c89e5cc2a8e75520ae33caa/xiaozhibike/bikePosition?longitude=' + that.data.longitude + '&latitude=' + that.data.latitude,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: (res) => {
        if ( !res.data ){
          return;
        }
        var bikes = that.data.markers;
        var data = res.data.data;
        for (var i = 0; i < data.length; i++) {
          bikes.push(data[i]);
        }
        that.setData({
          markers: bikes
        })
      }
    })
  },

  onReady: function(){
    
  },

  onShow: function(){
    
  }
})
