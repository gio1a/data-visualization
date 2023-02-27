
 <template>
    <div class="com-container" @dblclick="revertMap">
        <div class="com-chart" ref="map_ref"></div>
    </div>
</template>

<script>
    import axios from 'axios'
    import { mapState } from 'vuex'
    import { getProvinceMapInfo } from '../utils/map_utils'

    export default {
        name:'Map',
        data(){
            return {
                chartInstance: null,
                allData: null,
                mapData: {} // 省份地图矢量数据幻缓存
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
            // 在组件创建完成之后，进行回调函数的注册
            this.$socket.registerCallBack('mapData', this.getData)
            this.initChart()

            // 发送请求给服务器
            this.$socket.send({
                action: 'getData',
                socketType: 'mapData',
                chartName: 'map',
                value: ''
            })
            window.addEventListener('resize', this.screenAdapter)
            this.screenAdapter()
        },
        
        methods: {
            // 初始化echartInstance对象
            async initChart(){
                this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)

                // 获取中国地图的矢量数据(localhost:8999/static/map/china.json)
                const ret = await axios.get('http://localhost:8999/static/map/china.json')
                this.$echarts.registerMap('china',ret.data)
                const initOption = {
                    geo: {
                        type: 'map',
                        map: 'china',
                        top: '5%',
                        bottom: '5%',
                        itemStyle: {
                            areaColor: '#2e72bf',
                            borderColor: '#333'
                        }
                    },
                    title: {
                        text: '▎商家分布与销量排行',
                        left: 20,
                        top: 20
                    },
                    legend: {
                        left: '5%',
                        bottom: '5%',
                        orient: 'vertical'
                    }
                }
                this.chartInstance.setOption(initOption)
                this.chartInstance.on('click', async (arg) => {
                    const provinceInfo = getProvinceMapInfo(arg.name)
                    // 获取该省份的地图矢量数据
                    // 先判断是否存在mapData中,是否已注册过
                    if(!this.mapData[provinceInfo.key]) {
                        const ret = await axios.get('http://localhost:8999' + provinceInfo.path)
                        this.mapData[provinceInfo.key] = ret.data
                        this.$echarts.registerMap(provinceInfo.key, ret.data)
                    }
                    // this.$echarts.registerMap(provinceInfo.key, this.mapData[provinceInfo.key])
                    
                    const proviceOption = {
                        geo: {
                            map: provinceInfo.key
                        }
                    }
                    this.chartInstance.setOption(proviceOption)
                })
            },

            // 获取服务器的数据
            async getData(ret){
                // const {data: ret} = await this.$http.get('map')
                this.allData = ret
                this.updateChart()
            },

            // 更新图表
            updateChart(){
                const legendArr = this.allData.map(item => item.name)
                const seriesArr = this.allData.map(item => {
                    // return 的对象代表一个类别下的所有散点数据
                    return {
                        type: 'effectScatter',
                        rippleEffect: {
                            scale: 5,
                            brushType: 'stroke' // 空心涟漪
                        },
                        name: item.name,
                        data: item.children,
                        coordinateSystem: 'geo'
                    }
                })
                
                const dataOption = {
                    series: seriesArr,
                    legend: {
                        data: legendArr
                    }
                }
                this.chartInstance.setOption(dataOption)
            },

            // 浏览器窗口大小适配
            screenAdapter(){
                const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
                const adapterOption = {
                    title: {
                        textStyle: {
                            fontSize: titleFontSize
                        }
                    },
                    legend: {
                        textStyle: {
                            fontSize: titleFontSize / 2
                        },
                        itemWidth: titleFontSize / 2,
                        itemHeight: titleFontSize / 2,
                        itemGap: titleFontSize / 2
                    }
                }
                this.chartInstance.setOption(adapterOption)
                this.chartInstance.resize()
            },
            // 双击回到中国地图
            revertMap() {
                const revertOption  = {
                    geo: {
                        map: 'china'
                    }
                }
                this.chartInstance.setOption(revertOption)
            }
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.screenAdapter)
            this.$socket.unRegisterCallBack('mapData')
        }
    }
</script>

<style lang="less" scoped>

</style>