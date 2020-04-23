// pages/addFunction/addFunction.js

const code = `// 云函数入口函数
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  return {
    sum: event.a + event.b
  }
}`

Page({
  data: {
    menulist:[
      {
        "name":"实时疫情",
        "img":"images/ssyq.png"
      },
      {
        "name":"同行查询",
        "img":"images/txcx.png"
      },
      {
        "name":"定点医院",
        "img":"images/ddyy.png"
      },
      {
        "name":"心理疏导",
        "img":"images/xlsd.png"
      },
      {
        "name":"辟谣求真",
        "img":"images/pyqz.png"
      },
      {
        "name":"疫情科普",
        "img":"images/yqkp.png"
      },
    ]
  },

  Query:function(what){
    console.log("Query")
    const db = wx.cloud.database();
    db.collection('2019ncov').where({
     t_no:"G572"
    })
    .get({
      success: function(res) {
        console.log(res.data)
      },
      fail: err => {
        console.error('失败：', err)
      }
    })

  },



  onLoad: function (options) {

  },

  copyCode: function() {
    wx.setClipboardData({
      data: code,
      success: function () {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },

  testFunction() {
    wx.cloud.callFunction({
      name: 'sum',
      data: {
        a: 1,
        b: 2
      },
      success: res => {
        wx.showToast({
          title: '调用成功',
        })
        this.setData({
          result: JSON.stringify(res.result)
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [sum] 调用失败：', err)
      }
    })
  },

})

