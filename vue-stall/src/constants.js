// 全局常量

export default {

// 应用名称
  appName: '晨风早餐系统',

  // App 上下文路径（即相对于根目录的部署路径）
  // 请不要忽略开头和末尾的“/”
  // 例如，部署在 http://localhost:8080/ 时，上下文路径是“/”
  // 部署在 https://example.com/my-app/ 时，上下文路径是“/my-app/”
  contextPath: '/food-ordering/',

  // 图片文件夹的绝对路径
  imagePath: {
    diningHall: '/food-ordering/upload/image/dining-hall/',
    stall: '/food-ordering/upload/image/stall/',
    food: '/food-ordering/upload/image/food/',
    banner: '/food-ordering/upload/image/banner/'
  },

  upload: {
    image: {

      // 允许的 MIME type
      acceptMimeTypes: 'image/jpeg, image/png',

      // 允许的最大文件大小
      // 单位为 byte
      maxSize: 5 * 1024 * 1024
    }
  },

  // session 内允许的角色
  role: 2,

  // Android 播放声音类型
  soundType: {
    newOrder: 'newOrder',
    newRefund: 'newRefund',
    autoAcceptOrderSuccess: 'autoAcceptOrderSuccess',
    acceptOrderSuccess: 'acceptOrderSuccess',
    refundSuccess: 'refundSuccess',
    connectingThePrinterSuccessfully: 'connectingThePrinterSuccessfully'
  }
}
