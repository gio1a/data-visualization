
 <template>
    <div class="com-container">
        <div class="com-chart" ref="rank_ref"></div>
    </div>
</template>

<script>

    export default {
        name:'Rank',
        data(){
            return {
                chartInstance: null,
                allData: null,
                start: 0,
                end: 9, // 区域缩放终点
                timer: null
            }
        },
        mounted(){
            this.initChart()
            this.getData()
            window.addEventListener('resize', this.screenAdapter)
            this.screenAdapter()
        },
        methods: {
            // 初始化echartInstance对象
            async initChart(){
                this.chartInstance = this.$echarts.init(this.$refs.rank_ref, 'chalk')
                const initOption = {
                    xAxis: {
                        type: 'category'
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            type: 'bar'
                        }
                    ],
                    title: {
                        text: '▎地区销售排行',
                        left: 20,
                        top: 20
                    },
                    grid: {
                        top: '40%',
                        left: '5%',
                        right: '5%',
                        bottom: '5%',
                        containLabel: true
                    },
                    tooltip:{
                        show: true,
                    },
                    legend: {
                        left: '5%',
                        bottom: '5%',
                        orient: 'vertical'
                    }
                }
                this.chartInstance.setOption(initOption)
                this.chartInstance.on('mouseover', () => {
                    clearInterval(this.timer)
                })
                this.chartInstance.on('mouseout', () => {
                    this.itemWalker()
                })
            },

            // 获取服务器的数据
            async getData(){
                const {data: ret} = await this.$http.get('rank')
                this.allData = ret.sort((a, b)=> b.value - a.value)
                this.updateChart()
                this.itemWalker()
            },

            // 更新图表
            updateChart(){
                const colorArr = [
                    ["#0BA82C", "#4FF778"],
                    ["#2E728F", "#23E5E5"],
                    ["#5052EE", "#AB6EE5"],
                ];
                const provinceArr = this.allData.map( item => item.name)
                const valArr = this.allData.map( item => item.value)
                const dataOption = {
                    xAxis: {
                        data: provinceArr
                    },
                    series: [{
                        data: valArr,
                        itemStyle: {
                            color: arg => {
                                let tarColorArr = null
                                if (arg.value > 200) {
                                    tarColorArr = colorArr[0];
                                } else if (arg.value > 100) {
                                    tarColorArr = colorArr[1];
                                } else {
                                    tarColorArr = colorArr[2];
                                }
                                return new this.$echarts.graphic.LinearGradient(
                                    0, 0, 0, 1, [
                                        {
                                            offset: 0,
                                            color: tarColorArr[0],
                                        },
                                        {
                                            offset: 1,
                                            color: tarColorArr[1],
                                        }
                                    ]
                                )
                            }
                        }
                    }],
                    dataZoom: {
                        show: false,
                        startValue: this.start,
                        endValue: this.end
                    }
                }
                this.chartInstance.setOption(dataOption)
            },

            // 浏览器窗口大小适配
            screenAdapter(){
                const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
                const adapterOption = {
                    title: {
                        textStyle: {
                            fontSize: titleFontSize
                        }
                    },
                    series:[{
                        barWidth: titleFontSize,
                        itemStyle: {
                            barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
                        }
                    }]
                }
                this.chartInstance.setOption(adapterOption)
                this.chartInstance.resize()
            },

            // 区域缩放
            itemWalker(){
                if(this.timer) {
                    clearInterval(this.timer)
                }
                this.timer = setInterval(()=>{
                    this.start ++
                    this.end ++
                    if(this.end > this.allData.length - 1) {
                        this.start = 0
                        this.end = 9
                    }
                    this.updateChart()
                }, 2000)
            }

        },

        beforeDestroy() {
            clearInterval(this.timer)
            window.removeEventListener('resize', this.screenAdapter)
        }
    }
</script>

<style lang="less" scoped>

</style>