$(function(){
    var patientObj={
        data:{
            targetData:[],
            storage:[]

        } ,
        tpl:$("#patientJs").html(),
        container:$('#container'),
        html:null,
        template:null,
        reloadData:reloadData,
        originData:null,
        tableOriginData:{},
        storageData:{
            readItemList:0,
            data:[]
        },
        showTable:{
            "sickNum":true,
            "name":"true",
            "age":true,
            "sex":true,
            "department":true,
            "diagnosis":true,
            "time":true
        },
        readItemList:0,
        startTime:'',
        endTime:'',
        choiceNum:null,
        readNum:null,
        readFlag:false,
        cloneTableData:null,
        init:function(){
            this.template=Handlebars.compile(this.tpl);
            this.initData();
        },
        initData:function(){
            var _this=this;
            $.ajax({
               url:"../../data/target-list.json",
               type:'get',
               dataType:'json',
               success:function(data){
                   _this.originData=clone(data);
                   _this.data.targetData=clone(data);
                   _this.reloadData();
               }
            });
            $.ajax({
               url:"../../data/table-list.json",
               type:'get',
               dataType:'json',
               success:function(data){
                   _this.tableOriginData=clone(data);
                   _this.data.tableData=clone(data);
                   _this.reloadData();
               }
            });
            this.reloadData();
        },
        bindingEvent:function(){
            var _this=this;
            $('.check').children('li').click(function(){
                var n=$(this).attr('data-attr');
                _this.data.targetData[n].checked=false;
                _this.reloadData();
                _this.showTargetPop();

            });
            $('.uncheck').children('li').click(function(){
                var n=$(this).attr('data-attr');
                _this.data.targetData[n].checked=true;
                _this.reloadData();
                _this.showTargetPop();
            });
            $('.checked').find('input[type=button]').click(function(){
                _this.readItemFun()
            });

            // 设置点击状态按钮高亮展示
            var readItemBtn=$('.target').find('.nav').children('li');
            if(this.choiceNum!==null){
                readItemBtn.children('.active').removeClass('active');
                readItemBtn.eq(this.choiceNum).children('a').addClass('active');
            }
            readItemBtn.children('a').click(function(){
                var n=parseInt($(this).attr('data-attr'));
                _this.choiceNum=n;
                _this.readStorageItem(n);
            });
            readItemBtn.children('span').click(function(){
                var n=$(this).attr('data-attr');
                _this.deleteItem(parseInt(n));
            });
            // 搜索
            $('.search-icon').click(function(){
                var val=$(this).siblings('input').val().replace(/\s+/g,"");
                _this.search(val);
            });

            var read=$('.patient').children('.nav').children('li');
            if(this.readNum!==null){
                read.removeClass('active');
                read.eq(this.readNum).addClass('active');
            }
            read.click(function(){
                var n=parseInt($(this).attr('data-attr'));
                _this.filterList(n)
            });

            $('.set').click(this.showTargetPop)
            $('.close').click(function(){

                $('.target').hide();
            });
            $('.startTime').val(this.startTime);
            $('.endTime').val(this.endTime);
            $('.query').click(function(){
                _this.query();
            })

        },
        // 订阅数据设置
        readItemFun:function(){
            var _this=this;
            var arr=[];
            this.readFlag=false;
            $.each(this.data.targetData,function(index,item){
                _this.data.targetData[index].filter=false;
                if(item.checked){
                    _this.readFlag=true;
                    arr.push(item.key);
                }
            });
            if(!this.readFlag){
                alert('请选择订阅指标');
                return false;
            }
            if(this.storageData.data[this.choiceNum]===undefined){
                this.readItemList=this.storageData.readItemList;
                this.readItemList++;
                this.storageData.data.push({
                    list:"订阅"+this.readItemList,
                    subData:clone(this.data.targetData),
                    param:arr
                })
            }else{
                this.storageData.data[this.choiceNum].subData=clone(this.data.targetData);
                this.storageData.data[this.choiceNum].param=arr;
            }
            this.storageData.readItemList=this.readItemList;
            this.data.targetData=clone(this.originData);
            this.data.storage=clone(this.storageData.data);
            if(_this.readNum!==null&&(_this.readNum===_this.choiceNum)){
                _this.filterList(this.readNum);
            }
            this.choiceNum=null;
            this.reloadData();
            this.showTargetPop();
        },
        readStorageItem:function(n){
            this.data.targetData=clone(this.storageData.data[n].subData);
            this.reloadData();
            this.showTargetPop();

        },
        search:function(val){
            var _this=this;
            $.each(this.data.targetData,function(index,item){
                _this.data.targetData[index].filter=true;
                if(!item.checked&&(item.text.indexOf(val)!==-1||val==='')){
                    _this.data.targetData[index].filter=false;
                }
            });
            this.reloadData();
            this.showTargetPop();
        },
        filterList:function(n){
            var _this=this;
            var showObj=clone(this.showTable);
            this.readNum=n;
            this.data.tableData=clone(this.tableOriginData);
            $.each(this.data.storage[n].param,function(index,item){
                _this.data.tableData.header[item].filter=true;
                showObj[item]=true
            });
            $.each(this.data.tableData.body,function(index,items){
                $.each(items,function(key,value){
                    if(showObj[key]){
                        value.filter=true;
                    }
                })
            });
            this.cloneTableData=clone(this.data.tableData);
            this.reloadData();
        },
        deleteItem:function(n){
            // 若删除的订阅为列表中标展示的订阅数据时，列表展示为默认状态
            if(this.readNum!==null&&(this.readNum===n)){
                this.readNum=null;
                this.data.tableData=clone(this.tableOriginData);
            }
            this.storageData.data.splice(n,1);
            if(n===0&&this.storageData.data.length===0){
                this.storageData.readItemList=0;
            }
            if(this.choiceNum===n){
                this.choiceNum=null;
                this.data.targetData=clone(this.originData);
            }
            if(this.choiceNum>n){
                this.choiceNum--;
            }
            this.data.storage=clone(this.storageData.data);
            this.reloadData();
            this.showTargetPop();
        },
        query:function(){
            var _this=this;
            var arr=[];
            this.startTime=$('.startTime').val();
            this.endTime=$('.endTime').val();
            if(this.startTime===''&&this.endTime===''){
                alert('请选择筛选时间');
            }
            // 当时间筛选条件不成立时，恢复初始值
            if(this.startTime===''||this.endTime===''){
                if(this.cloneTableData!==null){
                    this.data.tableData=this.cloneTableData;
                }else{
                    this.data.tableData=clone(this.tableOriginData);

                }
                 this.reloadData();
                 return false;
            }
            if((new Date(this.startTime.replace(/-/g,"\/")))>(new Date(this.endTime.replace(/-/g,"\/")))){
                alert('结束时间要大于开始时间');
                return false;
            }
            // 过滤符合条件的值
            $.each(this.data.tableData.body,function(index,item){
                if(filterTime(_this.startTime,_this.endTime,item.time.text)){
                    arr.push(item);
                }
            });
            this.data.tableData.body=arr;
            this.reloadData();

        },
        showTargetPop:function(){
            $('.target').show();
        }
    }
    patientObj.init()
})