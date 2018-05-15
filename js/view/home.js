$(function(){
    var homePageObj={
        data:{} ,
        tpl:$("#homeJs").html(),
        container:$('#container'),
        reloadData:reloadData,
        template:null,
        html:null,
        uncheckedListDom:null,
        storageData:{
            readItemList:0,
            data:[]
        },
        originData:null,
        // 订阅个数
        readItemNum:0,
        // 选定订阅数据
        choiceNum:null,
        // 展示订阅数据
        choiceReadParam:null,
        showUncheckedListDom:0,
        // 订阅指标开关
        readFlag:false,
        init:function(){
            this.template=Handlebars.compile(this.tpl);
            this.initData();
        },
        initData:function(){
            var _this=this;
            $.ajax({
                url:'../../data/medical-information.json',
                type:'get',
                dataType:'json',
                success:function(data){
                    _this.data.medInfo=data;
                    _this.reloadData();
                }
            });
            $.ajax({
                url:'../../data/target.json',
                type:'get',
                dataType:'json',
                success:function(data){
                    _this.originData=data;
                    _this.data.targetData=clone(data);
                    _this.reloadData();
                }
            })

            this.reloadData();
        },
        bindingEvent:function(){
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('eChart'));

            // 指定图表的配置项和数据
            var option = {
                // title: { text: 'ECharts 入门示例' },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data:['红细胞','白细胞','血红蛋白','其他']
                },
                grid: {
                    left: '20px',
                    right: '20px',
                    bottom: '0px',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    splitLine:{
                        show:true
                    },
                    data: ['04-05', '04-10', '04-15', '04-20', '04-25', '04-30', '05-05']
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        name:'红细胞',
                        data: [820, 9320, 5000, 3000, 1290, 7000, 1320],
                        type: 'line',
                        smooth: true
                    },
                    {
                        name:'白细胞',
                        data: [82, 6030, 2000, 7000, 5000, 13, 132],
                        type: 'line',
                        smooth: true
                    },
                    {
                        name:'血红蛋白',
                        data: [8, 3000, 6000, 2000, 8000, 10, 1320],
                        type: 'line',
                        smooth: true
                    },
                    {
                        name:'其他',
                        data: [820, 932, 901, 934, 1290, 13, 1],
                        type: 'line',
                        smooth: true
                    }
                ]

            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
            window.onresize=function(){
                myChart.resize();
            }
            var _this=this;
            $('.nav .right').click(function(){
                $('.target').show();
            });

            $('.info a').click(function(){
                var index=$(this).attr('data-attr');
                _this.data.medInfoItem=_this.data.medInfo[index].detail;
                _this.reloadData();
                $('.detail').show();
            });

            $('.close').click(function(){
                $('.pop').hide();
            });

            $('button').click(function(){
                _this.reloadData()
            });

            // 未选指标列表展示
            this.uncheckedListDom=$('.unchecked-target .tab-list');
            this.uncheckedListDom.eq(this.showUncheckedListDom).show();

            $('.tab li').click(function(){
                var index=$(this).index();
                $(this).addClass('active').siblings('.active').removeClass('active');
                _this.uncheckedListDom.hide().eq(index).show();
            })
            this.uncheckedListDom.children('li').click(function(){
                _this.showTarget(true,this)
            })
            $('.read-target span').click(function(){
                _this.showTarget(false,this)
            })

            // 搜索设置
            $('.search-icon').click(function(){
                _this.search();
            })

            // 储存订阅数据
            $('.subscribe').click(function(){
                _this.readItem();
            })
            var choiceDom=$('.choice').parent('li');
            if(this.choiceNum!==null){
                choiceDom.eq(this.choiceNum).children('.choice').addClass('active');
            }
            $('.choice').click(function(){
               var n=$(this).attr('data-attr');
               _this.closePop(parseInt(n),choiceDom)

            })

            $('.close-choice').click(function () {
                var n=$(this).attr('data-attr');
                _this.closeChoice(parseInt(n));
            })

            // 展示选定的订阅参数
            if(_this.choiceReadParam!==null){
                $('.nav li').eq(_this.choiceReadParam).addClass('active')
            }
            $('.nav li').click(function(){
                _this.choiceReadParam=$(this).index();
                $(this).addClass("active").siblings('li').removeClass('active')
            })
        },
        showTarget:function(setIndex,_this){
            // 指标选定设置
            var dataIndex=$(_this).attr('data-attr').split('-');
            if(setIndex){
                this.data.targetData[dataIndex[0]][dataIndex[1]].checked=true;
                this.showUncheckedListDom=dataIndex[0];
            }else{
                this.data.targetData[dataIndex[0]][dataIndex[1]].checked=false;
            }
            this.reloadData();
            // dom刷新 展示结构重新设置
            this.showTargetPop()
        },
        readItem:function(){
            var str='';
            var _this=this;
            // 存储订阅参数，设置订阅开关
            this.readFlag=false;
            $.each(this.data.targetData,function(index,items){
                $.each(items,function(sub,item){
                    if(item.checked){
                        _this.readFlag=true;
                        str+=item.text+";"
                    }
                })
            });
            if(!this.readFlag){
                alert("请选择指标数据");
                this.showTargetPop();
                return false;
            }
            this.readItemNum=this.storageData.readItemList;

            // 数据追加
            if(this.storageData.data[this.choiceNum]===undefined){
                this.readItemNum++;
                this.storageData.data.push({
                    list:"订阅"+this.readItemNum,
                    subData:clone(this.data.targetData),
                    param:str
                });

            }else{
                this.storageData.data[this.choiceNum].subData=clone(this.data.targetData);
            }
            this.storageData.readItemList=this.readItemNum;
            this.data.storageData=this.storageData.data;
            this.data.targetData=clone(this.originData);
            this.choiceNum=null;
            this.reloadData();
            this.showTargetPop()
        },
        search:function(){
            var _this=this;
            var val=$(this).siblings('input').val().replace(/\s+/g,"");
            $.each(this.data.targetData,function(index,item){
                $.each(item,function(subIndex,subItem){
                    _this.data.targetData[index][subIndex].filter=false;
                    if(!subItem.checked&&(subItem.text.indexOf(val)!==-1||val==='')){
                        _this.data.targetData[index][subIndex].filter=true;
                    }
                })
            })
            this.reloadData();
            this.showTargetPop()

        },
        closeChoice:function(n){
            this.storageData.data.splice(n,1);

            if(n===0&&this.storageData.data.length===0){
                this.storageData.readItemList=0;
            }

            // 首页订阅选中条件设置
            if(this.choiceReadParam===n){
                this.choiceReadParam=null;
            }
            if(this.choiceReadParam>n&&this.choiceReadParam!==null){
                this.choiceReadParam--;
            }
            if(this.choiceNum===n){
                this.choiceNum=null;
                this.data.targetData=clone(this.originData);
            }
            if(this.choiceNum>n){
                this.choiceNum--;
            }
            this.data.storageData=this.storageData.data;
            this.reloadData();
            this.showTargetPop()
        },
        closePop:function(n,choiceDom){
            this.choiceNum=n;
            this.data.targetData=clone(this.storageData.data[n].subData);
            this.reloadData();
            this.showTargetPop()
            choiceDom.children('.active').removeClass('active');
            choiceDom.eq(n).children('.choice').addClass('active');

        },
        showTargetPop:function(){
            $('.target').show()
            $('.tab li').eq(this.showUncheckedListDom).addClass('active').siblings('.active').removeClass('active');
            this.uncheckedListDom.hide().eq(this.showUncheckedListDom).show();

        }
    }
    homePageObj.init();
})
