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
        functionDef: "=?",
        functions: "=?",
        config: "=?"
    },
    controllerAs: 'ctrl',
    controller: function($scope){
        this.$onInit = function(){
           //set default values
           if(!this.width)  this.width = 250;
           if(!this.height) this.height = 250;
           if(!this.minX)   this.minX = -5;
           if(!this.maxX)   this.maxX = 5;
           if(!this.minY)   this.minY = -5;
           if(!this.maxY)   this.maxY = 5;
           if(!this.resolution) this.resolution = 100;
           if(!this.functions){
                this.functions = [];
                this.functions[0] = "Math.cos(x)";
           } 
           if(!this.functionDef) this.functionDef = "Math.cos(x)";
           if(this.config == undefined) this.config = true;

           this.plotFunction();
        };
        this.plotFunction = function(){
            this.setOrigin();
            this.setTransformationParameters();
            this.drawAllFunctions();
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
        this.setTransformationParameters = function(){
            //transforms "real" values to SVG dimensions pixels
            this.m_x = this.getWidth()/(this.getMaxX()-this.getMinX());
            this.b_x = -1*this.m_x*this.getMinX();
            this.m_y = this.getHeight()/(this.getMaxY()-this.getMinY());
            this.b_y = -1*this.m_y*this.getMinY();
        };
        this.realToPixelX = function(xReal){
            return this.m_x*xReal + this.b_x
        };
        this.realToPixelY = function(yReal){
            return this.m_y*yReal + this.b_y
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

            for(var i=0; i<this.getResolution(); i++){
                xFun[i] = this.getMinX() + i*delta;
                yFun[i] = functionX(xFun[i]);
                
                this.xVal[i] = this.realToPixelX(xFun[i]); 
                this.yVal[i] = this.transCoordY(this.realToPixelY(yFun[i]));
            }
        };
        this.drawPath = function(){
            this.stringPath = [];
            var path = "M " + this.xVal[0] + " " + this.yVal[0] + " ";
            for(var i=1; i<this.xVal.length; i++){
                path += "L " + this.xVal[i] + " " + this.yVal[i] + " ";
            }
            this.stringPath = path;
        };
        this.addFunction = function(){
            this.functions.push({"def":""});
        };
        this.removeFunctions = function(index){
            this.functions.splice(index, 1);
            this.paths.splice(index, 1);
        };
        this.drawAllFunctions = function(){
            this.paths = [];
            for(var i=0; i<this.functions.length; i++){
                values = this.evaluateThisFunctions(this.functions[i].def);
                path   = this.createPath(values.xVal, values.yVal);
                this.functions[i].values = values;
                this.functions[i].path   = path;
                this.paths[i] = {"path": this.createPath(values.xVal, values.yVal)};
            }
            console.log(this.functions);
        };
        this.evaluateThisFunctions = function(func){
            var stringFunc = "return " + func + ";"
            var functionX = Function("x", stringFunc);
            var delta = (this.getMaxX() - this.getMinX())/(this.getResolution()-1);
            //"real" values from evaluate function
            var xFun = [];
            var yFun = [];
            //values mapped to svg pixels
            xVal = [];
            yVal = [];

            for(var i=0; i<this.getResolution(); i++){
                xFun[i] = this.getMinX() + i*delta;
                yFun[i] = functionX(xFun[i]);
                
                xVal[i] = this.realToPixelX(xFun[i]); 
                yVal[i] = this.transCoordY(this.realToPixelY(yFun[i]));
            }
            
            return {"xVal": xVal, "yVal": yVal};
        };
        this.createPath = function(xVal, yVal){
            stringPath = [];
            var path = "M " + xVal[0] + " " + yVal[0] + " ";
            for(var i=1; i<xVal.length; i++){
                path += "L " + xVal[i] + " " + yVal[i] + " ";
            }
            return path;
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

})(window.angular);


