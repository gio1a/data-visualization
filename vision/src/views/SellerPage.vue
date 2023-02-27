<!-- 
    /sellerpage
    在此组件中通过组件注册的方式，显示出Seller.vue这个组件
 -->
<template>
    <div class="com-page">
        <Seller></Seller>
    </div>
</template>

<script>
    import Seller from '../components/Seller'
    export default {
        name:'SellerPage',
        components: {
            Seller
        }
    }
</script>

<style lang="less" scoped>

</style>