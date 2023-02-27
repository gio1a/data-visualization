
 <template>
    <div class="com-container">
        <div class="com-chart" ref="hot_ref"></div>
        <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
        <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
        <span class="cat-anme" :style="comStyle">{{ subTitle }}</span>
    </div>
</template>

<script>
    export default {
        name:'Hot',
        data(){
            return {
                chartInstance: null,
                allData: null,
                titleFontSize: 0,
                currentIndex: 0, //当前所展示出的一级分类数据

            }
        },
        mounted(){
            // 在组件创建完成之后，进行回调函数的注册
            this.$socket.registerCallBack('hotData', this.getData)
            this.initChart()
            
            // 发送请求给服务器
            this.$socket.send({
                action: 'getData',
                socketType: 'hotData',
                chartName: 'hotproduct',
                value: ''
            })
            window.addEventListener('resize', this.screenAdapter)
            this.screenAdapter()
        },
        computed: {
            subTitle() {
                if(!this.allData) {
                    return ''
                } else {
                    return this.allData[this.currentIndex].name
                }
            },
            comStyle() {
                return {
                    fontSize: this.titleFontSize + 'px'
                }
            }
        },
        methods: {
            // 初始化echartInstance对象
            initChart(){
                this.chartInstance = this.$echarts.init(this.$refs.hot_ref, 'chalk')

                const initOption = {
                    series: [{
                        type: 'pie',
                        label: {
                            show: false
                        },
                        emphasis: {
                            label: {
                                show: true
                            },
                            labelLine: {
                                show: false
                            }
                        }
                    }],
                    title: {
                        text:'▎热销商品占比',
                        left: 20,
                        top: 20
                    },
                    legend: {
                        top: '15%',
                        icon: 'circle'
                    },
                    tooltip:{
                        show: true,
                        formatter: arg => {
                            const thirdCategory = arg.data.children
                            let total = 0
                            thirdCategory.forEach( item => {
                                total += item.value
                            })
                            let retStr = ''
                            thirdCategory.forEach( item => {
                                retStr += `
                                    ${item.name} : ${parseInt(item.value / total * 100) + '%'}
                                    <br/>
                                `
                            })
                            return retStr
                        }
                    }
                }
                this.chartInstance.setOption(initOption)
            },
            // 获取数据
            async getData(ret){
                // const {data: ret} = await this.$http.get('hotproduct')
                this.allData = ret
                this.updateChart()
            },

            // 更新图表
            updateChart(){
                const legendData = this.allData[this.currentIndex].children.map(item => item.name)
                const seriesData = this.allData[this.currentIndex].children.map(item => {
                    return {
                        name: item.name,
                        value: item.value,
                        children: item.children
                    }
                })
                const dataOption = {
                    series: [{
                        data: seriesData
                    }],
                    legend: {
                        data: legendData
                    }
                }
                this.chartInstance.setOption(dataOption)
            },
            // 浏览器窗口大小适配
            screenAdapter(){
                this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
                const adapterOption = {
                    title:{
                        textStyle: {
                            fontSize: this.titleFontSize
                        }
                    },
                    series: [{
                        radius: this.titleFontSize * 4.5,
                        center: ['50%','60%']
                    }],
                    legend: {
                        itemWidth: this.titleFontSize / 2,
                        itemHeight: this.titleFontSize / 2,
                        itemGap: this.titleFontSize / 2,
                        textStyle: {
                            fontSize: this.titleFontSize / 2
                        }
                    }
                }
                this.chartInstance.setOption(adapterOption)
                this.chartInstance.resize()
            },

            toLeft(){
                this.currentIndex --
                if(this.currentIndex < 0) {
                    this.currentIndex = this.allData.length - 1
                }
                this.updateChart()
            },
            toRight(){
                this.currentIndex ++
                if(this.currentIndex > this.allData.length - 1) {
                    this.currentIndex = 0
                }
                this.updateChart()
            },
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.screenAdapter)
            this.$socket.unRegisterCallBack('hotData')
        }
    }
</script>

<style lang="less" scoped>
    .arr-left{
        position: absolute;
        top: 50%;
        left: 10%;
        transform: translateY(-50%);
        cursor: pointer;
        color: white
    }
    .arr-right {
        position: absolute;
        top: 50%;
        right: 10%;
        transform: translateY(-50%);
        cursor: pointer;
        color: white
    }
    .cat-anme {
        position: absolute;
        left: 80%;
        bottom: 20px;
        color: white
    }
</style>