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
    
  },

  onLoad: function (options) {
    this.getdata()
    //this.setData({ 'display': 'flex' })
  },

  getdata: function () {
    var t = this
    console.log('获取数据')
    wx.cloud.callFunction({
      name: 'http'
    })
      .then(res => {
        console.log(res.result)
        var data = res.result
        var today = {}
        if (data.chinaTotal.today.input >= 0)
          today.input = "+" + data.chinaTotal.today.input
        else
          today.input = data.chinaTotal.today.input
        if (data.chinaTotal.extData.incrNoSymptom >= 0)
          today.noSymptom = "+" + data.chinaTotal.extData.incrNoSymptom
        else
          today.noSymptom = data.chinaTotal.extData.incrNoSymptom
        if (data.chinaTotal.today.storeConfirm >= 0)
          today.storeConfirm = "+" + data.chinaTotal.today.storeConfirm
        else
          today.storeConfirm = data.chinaTotal.today.storeConfirm
        if (data.chinaTotal.today.confirm >= 0)
          today.confirm = "+" + data.chinaTotal.today.confirm
        else
          today.confirm = data.chinaTotal.today.confirm
        if (data.chinaTotal.today.dead >= 0)
          today.dead = "+" + data.chinaTotal.today.dead
        else
          today.dead = data.chinaTotal.today.dead
        if (data.chinaTotal.today.heal >= 0)
          today.heal = "+" + data.chinaTotal.today.heal
        else
          today.heal = data.chinaTotal.today.heal

        var total = {}
        total.input = data.chinaTotal.total.input
        total.noSymptom = data.chinaTotal.extData.noSymptom
        total.confirm = data.chinaTotal.total.confirm
        total.dead = data.chinaTotal.total.dead
        total.heal = data.chinaTotal.total.heal

        t.setData({ 'today': today })
        t.setData({ 'total': total })
        t.setData({ 'lastUpdateTime': data.lastUpdateTime })
        t.setData({ 'ok': 1 })
      })
      .catch(console.error)
  },

  copyCode: function () {
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

