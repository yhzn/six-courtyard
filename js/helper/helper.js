var eq=function(param1,param2,options){
   if(param1===param2){
       return true
   }else{
       return false
   }
}
var not=function(param1,param2,options){
       return !param1
    }
var or=function(param1,param2,options){
    if(param1 || param2){
        return true
    }else{
        return false
    }
}
var and=function(param1,param2,options){
    if(param1 && param2){
        return true
    }else{
        return false
    }
}
Handlebars.registerHelper('eq',eq);
Handlebars.registerHelper('not',not);
Handlebars.registerHelper('and',not);