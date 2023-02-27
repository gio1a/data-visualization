
 <template>
    <div class="com-container">
        <div class="com-chart" ref="stock_ref"></div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name:'Stock',
        data(){
            return {
                chartInstance: null,
                allData: null,
                currentIndex: 0,
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
            this.$socket.registerCallBack('stockData', this.getData)
            this.initChart()

            // 发送请求给服务器
            this.$socket.send({
                action: 'getData',
                socketType: 'stockData',
                chartName: 'stock',
                value: ''
            })
            window.addEventListener('resize', this.screenAdapter)
            this.screenAdapter()
        },
        methods: {
            // 初始化echartInstance对象
            initChart(){
                this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
                
                const initOption = {
                    title: {
                        text: '▎库存和销量分析',
                        top: 20,
                        left: 20
                    }
                }
                this.chartInstance.setOption(initOption)

                this.chartInstance.on('mouseover', () => {
                    clearInterval(this.timer)
                })
                this.chartInstance.on('mouseout', () => {
                    this.pageTurner()
                })
            },
            // 获取数据
            async getData(ret){
                // const {data: ret} = await this.$http.get('stock')
                this.allData = ret
                this.updateChart()
                this.pageTurner() // 启动自动翻页
            },
            // 更新图表
            updateChart(){
                const centerArr = [
                    ["18%", "40%"],
                    ["50%", "40%"],
                    ["82%", "40%"],
                    ["34%", "75%"],
                    ["66%", "75%"],
                ];
                const colorArr = [
                    ['#4FF778', '#0BA82C'],
                    ['#E5DD45', '#E8B11C'],
                    ['#E8821C', '#E55455'],
                    ['#5052EE', '#AB6EE5'],
                    ['#23E5E5', '#2E72BF'],
                ]
                const start = this.currentIndex * 5
                const end = (this.currentIndex + 1) * 5
                const showData = this.allData.slice(start, end)
                const seriesArr = showData.map((item, index) => {
                    return {
                        type: 'pie',
                        center: centerArr[index],
                        data: [
                            {
                                name: item.name + '\n\n' + item.sales,
                                value: item.sales,
                                itemStyle: {
                                    color: new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                                        {
                                            offset: 0,
                                            color: colorArr[index][0]
                                        },{
                                            offset: 1,
                                            color: colorArr[index][1]
                                        }
                                    ])
                                }
                            },
                            {
                                value: item.stock,
                                itemStyle: {
                                    color: '#333843'
                                }
                            }
                        ],
                        hoverAnimation: false, // 鼠标移入饼图的动画效果
                        label: {
                            position: 'center',
                            color: colorArr[index][0]
                        },
                        labelLine:{
                            show: false
                        },
                    }
                })
                const dataOption = {
                    series: seriesArr
                }
                this.chartInstance.setOption(dataOption)
            },
            // 每隔三秒自动换页
            pageTurner(){
                if(this.timer) {
                    clearInterval(this.timer)
                }

                this.timer = setInterval(()=>{
                    this.currentIndex ++
                    if(this.currentIndex > 2) this.currentIndex = 1
                    this.updateChart()
                }, 5000)
            },
            // 浏览器窗口大小适配
            screenAdapter(){
                const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
                const innerRadius = titleFontSize * 2.8
                const outterRadius = innerRadius * 1.125
                const adapterOption = {
                    title: {
                        textStyle: {
                            fontSize: titleFontSize
                        }
                    },
                    series:[
                        {
                            type: 'pie',
                            radius: [outterRadius, innerRadius],
                            label: {
                                fontSize: titleFontSize / 2
                            }
                        },
                        {
                            type: 'pie',
                            radius: [outterRadius, innerRadius],
                            label: {
                                fontSize: titleFontSize / 2
                            }
                        },
                        {
                            type: 'pie',
                            radius: [outterRadius, innerRadius],
                            label: {
                                fontSize: titleFontSize / 2
                            }
                        },
                        {
                            type: 'pie',
                            radius: [outterRadius, innerRadius],
                            label: {
                                fontSize: titleFontSize / 2
                            }
                        },
                        {
                            type: 'pie',
                            radius: [outterRadius, innerRadius],
                            label: {
                                fontSize: titleFontSize / 2
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
            this.$socket.unRegisterCallBack('stockData')
        }
    }
</script>

<style lang="less" scoped>

</style>