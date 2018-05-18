<template>
  <div class="column food-detail" v-if="visiable">
    <div>
      <img :src="imagePathFood + foodMessage.imageUrl" alt="">
    </div>
    <div class="column" style="background: white">
      <div style="font-size: 18px">{{foodMessage.name}}</div>
      <div class="row" style="font-size: 14px">
        <span>已售{{foodMessage.saleCount}}份</span>
        <span style="margin-left: 10%">同学推荐{{foodMessage.positiveRate}}%</span>
      </div>
      <div class="row" style="font-size: 16px">
        <span style="color: coral">${{foodMessage.standardPrice}}</span>
        <span style="color: red;">会员价${{foodMessage.memberPrice}}</span>
        <button class="btn">直接购买</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'food-detail',
  data () {
    return {
      foodMessage: {},
      visiable: false
    }
  }
}
</script>

<style scoped>
  .food-detail{
    height: 100%;
    width: 100%;
    border-radius: 5px;
  }
  .btn{
    color: white;
    background: #5ac83a;
  }
</style>
