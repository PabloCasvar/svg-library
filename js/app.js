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
           if(!this.width) this.width = 250;
           if(!this.height) this.height = 250;
           if(!this.minX) this.minX = -5;
           if(!this.maxX) this.maxX = 5;
           if(!this.minY) this.minY = -5;
           if(!this.maxY) this.maxY = 5;
           if(!this.resolution) this.resolution = 100;
           if(!this.functionDef) this.functionDef = "Math.cos(x)";
           
           this.plotFunction();
        };
        this.plotFunction = function(){
            this.setOrigin();
            this.evaluateFunction();
            this.drawPath();
        };
        this.setDeltaX = function(){
            this.dx = this.getWidth()/(this.getMaxX()-this.getMinX());
        };
        this.setDeltaY = function(){
            this.dy = this.getHeight()/(this.getMaxY()-this.getMinY());
        };
        this.setOriginX = function(){
            var min = this.getMinX();
            var max = this.getMaxX();
            var origin;
            if(min>=0){ 
                origin=-1*min*this.dx;
            }else if(min<0 && max>0){
                origin = -1*min*this.dx;
            }else if(max <= 0){
                origin = this.getWidth()-max*this.dx;
            }
            this.originX = origin;
        };
        //todo: Correct y direction 
        this.setOriginY = function(){
            var min = this.getMinY();
            var max = this.getMaxY();
            var origin;
            if(min>=0){ 
                origin=-1*min*this.dy;
            }else if(min<0 && max>0){
                origin = -1*min*this.dy;
            }else if(max <= 0){
                origin = this.getHeight()-max*this.dy;
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
            return Number(this.getHeight() - y);
        };
        this.evaluateFunction = function(){
            var stringFunc = "return " + this.functionDef + ";"
            var functionX = Function("x", stringFunc);
            var delta = (this.getMaxX() - this.getMinX())/(this.getResolution()-1);
            //"real" values from evaluate function
            var xFun = [];
            var yFun = [];
            //values mapped to svg pixels
            this.xVal = [];
            this.yVal = [];
            //transformation parameters
            var m_x = this.getWidth()/(this.getMaxX()-this.getMinX());
            var b_x = -1*m_x*this.getMinX();
            var m_y = this.getHeight()/(this.getMaxY()-this.getMinY());
            var b_y = -1*m_y*this.getMinY();

            for(var i=0; i<this.getResolution(); i++){
                xFun[i] = this.getMinX() + i*delta;
                yFun[i] = functionX(xFun[i]);
                
                this.xVal[i] = m_x*xFun[i] + b_x; 
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
        this.getWidth = function(){
            return this.functionToNumber(this.width);
        };
        this.getHeight = function(){
            return this.functionToNumber(this.height);
        };
        this.getMaxX = function(){
            return this.functionToNumber(this.maxX);
        }
        this.getMinX = function(){
            return this.functionToNumber(this.minX);
        }
        this.getMaxY = function(){
            return this.functionToNumber(this.maxY);
        }
        this.getMinY = function(){
            return this.functionToNumber(this.minY);
        }
        this.getResolution = function(){
            return this.functionToNumber(this.resolution);
        }
        this.functionToNumber = function(fun){
            return Number((Function("return " + fun))());
        };
    }, 
    templateUrl: "templates/svg.tpl.html"
});

app.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
});

})(window.angular);


