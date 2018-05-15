var is_Array=function(obj){
    if(Array.isArray){
        return Array.isArray(obj)
    }else{
        return Object.prototype.toString.call(obj)==='[object Array]';
    }
}

var is_Obj=function(obj){
    return Object.prototype.toString.call(obj)==='[object Object]';
}
var filterTime = function(start,end,now){
    if(((new Date(now.replace(/-/g,"\/")))>=(new Date(start.replace(/-/g,"\/"))))&&((new Date(now.replace(/-/g,"\/")))<=(new Date(end.replace(/-/g,"\/"))))){
        return true;
    }
    return false;
}
var isBasic = function(it){
    return it===null || (typeof it !=='array' && typeof it !== 'object' );
}
var clone = function (it) {
    if(isBasic(it)){
        return it;
    }
    var result=is_Array(it)?[]:{};
    for(var i in it){
        result[i]=clone(it[i]);
    }
    return result;
}

var reloadData = function(){
    this.html=this.template(this.data);
    // 重新修改数据后，dom重新渲染，时间需要重新绑定
    this.container.html(this.html);
    this.bindingEvent();
}



