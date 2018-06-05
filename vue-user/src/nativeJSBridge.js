
window.addOrder = function (orderId) {
  window.vm.$children[0].addOrder(orderId)
}

window.addRefundOrder = function (orderId) {
  window.vm.$children[0].addRefundOrder(orderId)
}

window.acceptOrder = function (orderId) {
  window.vm.$children[0].acceptOrder(orderId)
}

window.autoLogin = function (username, password) {
  window.vm.$children[0].autoLogin(username, password)
}

window.autoLogin = function (username, password) {
  window.vm.$children[0].autoLogin(username, password)
}

window.printerConnected = function () {
  window.vm.$children[0].printerConnected()
}

window.printerDisconnected = function () {
  window.vm.$children[0].printerDisconnected()
}
//
// window.getBuyCar = function () {
//   window.vm.$children[0].getBuyCar()
// }
