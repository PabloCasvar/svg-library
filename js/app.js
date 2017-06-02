(function(angular){

var app = angular.module("myApp", []);

app.component('plotSvg',{
    bindings:{
        width: "@",
        height: "@",
        minX: "@",
        maxX: "@",
        minY: "@",
        maxY: "@",
        resolution: "@",
        functionDef: "@"
    },
    controllerAs: 'ctrl',
    controller: function($scope){
        this.$onInit = function(){
           //set default values
           if(!this.width) this.width = 100;
           if(!this.height) this.height = 100;
           if(!this.minX) this.minX = -5;
           if(!this.maxX) this.maxX = 5;
           if(!this.minY) this.minY = -5;
           if(!this.maxY) this.maxY = 5;
           if(!this.resolution) this.resolution = 100;
           if(!this.functionDef) this.functionDef = "x";
           
           this.setOrigin();
           this.evaluateFunction();
           this.drawPath();
        };

        this.setDeltaX = function(){
            this.dx = this.width/(this.maxX-this.minX);
        };
        this.setDeltaY = function(){
            this.dy = this.height/(this.maxY-this.minY);
        };
        this.setOriginX = function(){
            var min = this.minX;
            var max = this.maxX;
            var origin;
            if(min>=0){ 
                origin=-1*min*this.dx;
            }else if(min<0 && max>0){
                origin = -1*min*this.dx;
            }else if(max <= 0){
                origin = this.width-max*this.dx;
            }
            this.originX = origin;
        };
        //todo: Correct y direction 
        this.setOriginY = function(){
            var min = this.minY;
            var max = this.maxY;
            var origin;
            if(min>=0){ 
                origin=-1*min*this.dy;
            }else if(min<0 && max>0){
                origin = -1*min*this.dy;
            }else if(max <= 0){
                origin = this.height-max*this.dy;
            }
            this.originY = this.transCoordY(origin);
        };

        this.setOrigin = function(){
            this.setDeltaX();
            this.setDeltaY();
            this.setOriginX();
            this.setOriginY();
        };
        //todo: implement matrix transformations
        this.transCoordY = function(y){
            return parseInt(this.height - y);
        };
        this.evaluateFunction = function(){
            var stringFunc = "return " + this.functionDef + ";"
            var functionX = Function("x", stringFunc);
            var delta = (this.maxX - this.minY)/(this.resolution-1);
            //"real" values from evaluate function
            var xFun = [];
            var yFun = [];
            //values mapped to svg pixels
            this.xVal = [];
            this.yVal = [];
            //transformation parameters
            var m_x = this.width/(this.maxX-this.minX);
            var b_x = -1*m_x*this.minX;
            var m_y = this.height/(this.maxY-this.minY);
            var b_y = -1*m_y*this.minY;

            for(var i=0; i<this.resolution; i++){
                xFun[i] = parseInt(this.minX + parseInt(i*delta));
                yFun[i] = parseInt(functionX(xFun[i]));
                
                this.xVal[i] = parseInt(m_x*xFun[i] + b_x); 
                this.yVal[i] = this.transCoordY(m_y*yFun[i] + b_y);
            }
            console.log(xFun);
            console.log(this.xVal);
            console.log(yFun);
            console.log(this.yVal);
        };
        this.drawPath = function(){
            this.stringPath = [];
            var path = "M " + this.xVal[0] + " " + this.yVal[0] + " ";
            for(var i=1; i<this.xVal.length; i++){
                path += "L " + this.xVal[i] + " " + this.yVal[i] + " ";
            }
            this.stringPath = path;
            console.log(this.stringPath);
        };

    }, 
    templateUrl: "templates/svg.tpl.html"
});

})(window.angular);


