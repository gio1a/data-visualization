<!-- 
    商家销量统计的横向柱状图
 -->
 <template>
    <div class="com-container">
        <div class="com-chart" ref="seller_ref"></div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name:'Seller',
        data(){
            return {
                chartInstance: null,
                sellerData: null,
                currentPage: 1, // 当前页数
                totalPage: 0, // 总页数
                timer: null
            }
        },
        computed: {
            ...mapState(['theme'])
        },
        watch: {
            theme() {
                console.log('主题切换了...')
                this.chartInstance.dispose() // 销毁当前图表
                this.initChart() // 重新初始化图表
                this.screenAdapter() 
                this.updateChart()
            }
        },
        mounted(){
            this.$socket.registerCallBack('sellerData', this.getData)
            this.initChart()

            // 发送请求给服务器
            this.$socket.send({
                action: 'getData',
                socketType: 'sellerData',
                chartName: 'seller',
                value: ''
            })
            window.addEventListener('resize', this.screenAdapter)
            this.screenAdapter()
        },
        methods: {
            // 初始化echartInstance对象
            initChart(){
                this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
                // 对图表初始化配置的控制
                const initOption = {
                    title: {
                        text: '▎商家销售统计',
                        top: 20,
                        left: 20
                    },
                    grid:{
                        top: '20%',
                        left: '3%',
                        right: '6%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'value'
                    },
                    yAxis:{
                        type: 'category'
                    },
                    tooltip: {
                        // trigger: 'item',
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line',
                            z: 0,
                            lineStyle: {
                                color: '#2D3443'
                            }
                        }
                    },
                    series:[
                        {
                            type: 'bar',
                            barWidth: 66,
                            label: {
                                show: true,
                                position: 'right',
                                textStyle: {
                                    color: '#fff'
                                }
                            },
                            itemStyle: {
                                color: new this.$echarts.graphic.LinearGradient(0,0,1,0,[
                                    {
                                        offset: 0,
                                        color: '#5052ee'
                                    },{
                                        offset: 1,
                                        color: '#ab6ee5'
                                    }
                                ])
                            }
                        }
                    ]
                }
                this.chartInstance.setOption(initOption)

                // 鼠标移入/离开
                this.chartInstance.on('mouseover', () => {
                    clearInterval(this.timer)
                })
                this.chartInstance.on('mouseout', () => {
                    this.pageTurner()
                })
            },
            // 获取数据
            async getData(ret){
                // const {data: ret} = await this.$http.get('seller')
                this.sellerData = ret.sort((a, b) => a.value - b.value)
                // console.log('sorted seller data ---> ',this.sellerData)

                this.totalPage = this.sellerData.length % 5 === 0 
                    ? this.sellerData.length / 5 
                    : this.sellerData.length / 5 + 1
                this.updateChart()
                this.pageTurner() // 启动自动翻页
            },
            // 更新图表
            updateChart(){
                const showData = this.sellerData.slice((this.currentPage - 1) * 5, this.currentPage * 5)
                const sellerNames = showData.map( item => item.name)
                const sellerValues = showData.map( item => item.value)
                
                // 更新图表中的数据
                const dataOption = {
                    yAxis:{
                        data: sellerNames
                    },
                    series:[
                        {
                            data: sellerValues
                        }
                    ]
                }
                this.chartInstance.setOption(dataOption)
            },
            // 每隔三秒自动换页
            pageTurner(){
                if(this.timer) {
                    clearInterval(this.timer)
                }

                this.timer = setInterval(()=>{
                    this.currentPage ++
                    if(this.currentPage > this.totalPage) this.currentPage = 1
                    this.updateChart()
                }, 3000)
            },
            // 浏览器窗口大小适配
            screenAdapter(){
                // this.$refs.seller_ref.offsetWidth
                const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
                const adapterOption = {
                    title: {
                        textStyle: {
                            fontSize: titleFontSize
                        }
                    },
                    tooltip: {
                        axisPointer: {
                            lineStyle: {
                                width: titleFontSize
                            }
                        }
                    },
                    series:[
                        {
                            barWidth: titleFontSize,
                            itemStyle: {
                                barBorderRadius: [ 0, titleFontSize / 2, titleFontSize / 2, 0 ]
                            }
                        }
                    ]
                }
                this.chartInstance.setOption(adapterOption)
                this.chartInstance.resize()
            }
        },
        beforeDestroy() {
            clearInterval(this.timer)
            window.removeEventListener('resize', this.screenAdapter)
            this.$socket.unRegisterCallBack('sellerData')
        }
    }
</script>

<style lang="less" scoped>

</style>