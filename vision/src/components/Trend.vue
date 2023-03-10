<!-- 
    销量趋势图
 -->
 <template>
    <div class="com-container">
        <div class="title" :style="comStyle">
            <span>{{ '▎' + showTitle }}</span>
            <span 
                class="iconfont title-icon" 
                @click="showChoice = !showChoice"
                :style="comStyle"
            >&#xe6eb;
            </span>

            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div 
                    class="select-item" 
                    v-for="item in selectTypes" 
                    :key="item.key"  
                    @click="handleSelect(item.key)">
                {{ item.text }}
                </div>
            </div>
        </div>
        <div class="com-chart" ref="trend_ref"></div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { getThemeValue } from '@/utils/theme_utils'

    export default {
        name:'Trend',
        data(){
            return {
                chartInstance: null,
                allData: null,
                showChoice: false, // 是否显示可选项
                choiceType: 'map', // 显示数据的type
                titleFontSize: 0
            }
        },
        mounted(){
            // 在组件创建完成之后，进行回调函数的注册
            this.$socket.registerCallBack('trendData', this.getData)
            this.initChart()

            // 发送请求给服务器
            this.$socket.send({
                action: 'getData',
                socketType: 'trendData',
                chartName: 'trend',
                value: ''
            })
            window.addEventListener('resize', this.screenAdapter)
            this.screenAdapter()
        },
        computed: {
            ...mapState(['theme']),

            selectTypes() {
                if(!this.allData) {
                    return []
                }
                else {
                    return this.allData.type.filter( item => item.key !== this.choiceType)
                }
            },
            showTitle() {
                if (!this.allData) {
                    return ''
                } else {
                    return this.allData[this.choiceType].title
                }
            },
            comStyle() {
                return {
                    fontSize: this.titleFontSize + 'px',
                    color: getThemeValue(this.theme).titleColor
                }
            },
            marginStyle() {
                return {
                    marginLeft: this.titleFontSize * 0.65 + 'px'
                }
            }
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
        methods: {
            // 初始化echartInstance对象
            initChart(){
                this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)

                const initOption = {
                    xAxis: {
                        type: 'category',
                        boundaryGap: false
                    },
                    yAxis: {
                        type: 'value'
                    },
                    grid: {
                        left: "3%",
                        top: "35%",
                        right: "4%",
                        bottom: "1%",
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'axis',
                    },
                    legend: {
                        left: 20,
                        top: '15%',
                        icon:'circle'
                    }
                }
                this.chartInstance.setOption(initOption)

            },
            // ret: 请求到的数据
            async getData(ret){
                // const {data: ret} = await this.$http.get('trend')
                console.log('trend data ----> ',ret)
                this.allData = ret
                this.updateChart()
            },
            // 更新图表
            updateChart(){
                // 半透明的颜色值
                const colorArr1 = [
                    'rgba(11, 168, 44, 0.5)',
                    'rgba(44, 110, 255, 0.5)',
                    'rgba(22, 242, 217, 0.5)',
                    'rgba(254, 33, 30, 0.5)',
                    'rgba(250, 105, 0, 0.5)'
                ]
                // 全透明的颜色值
                const colorArr2 = [
                    'rgba(11, 168, 44, 0)',
                    'rgba(44, 110, 255, 0)',
                    'rgba(22, 242, 217, 0)',
                    'rgba(254, 33, 30, 0)',
                    'rgba(250, 105, 0, 0)'
                ]
                const timeArr = this.allData.common.month
                const valArr = this.allData[this.choiceType].data // 地区销量趋势数据
                const legendArr = valArr.map(item => item.name) // 图例数据
                const seriesArr = valArr.map( (item, index)=> {
                    return {
                        name: item.name,
                        type: 'line',
                        data: item.data,
                        stack: [this.choiceType],
                        areaStyle: {
                            color: new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                                {
                                    offset: 0,
                                    color: colorArr1[index]
                                },{
                                    offset: 1,
                                    color: colorArr2[index]
                                }
                            ])
                        }
                    }
                })
                const dataOption = {
                    xAxis: {
                        data: timeArr
                    },
                    series: seriesArr,
                    legend: {
                        data: legendArr
                    },
                }
                this.chartInstance.setOption(dataOption)
            },
            // 浏览器窗口大小适配
            screenAdapter(){
                this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
                const adapterOption = {
                    legend: {
                        itemWidth: this.titleFontSize,
                        itemHeight: this.titleFontSize,
                        itemGap: this.titleFontSize,
                        textStyle: {
                            fontSize: this.titleFontSize / 2
                        }
                    }
                }
                this.chartInstance.setOption(adapterOption)
                this.chartInstance.resize()
            },
            // 切换显示数据的类型
            handleSelect(currentType) {
                this.choiceType = currentType
                this.updateChart()
                this.showChoice = false
            }
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.screenAdapter)
            this.$socket.unRegisterCallBack('trendData')
        }
    }
</script>

<style lang="less" scoped>
    .title {
        position: absolute;
        left: 20px;
        top: 20px;
        z-index: 10;
        color: white;
        .title-icon {
            margin-left: 10px;
            cursor: pointer;
        }
        .select-item {
            cursor: pointer;
        }
    }
</style>