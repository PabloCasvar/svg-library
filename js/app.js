(function(angular){

var app = angular.module("myApp", []);

app.component('plotSvg',{
    bindings:{
        width: "@",
        height: "@",
        minX: "@",
        maxX: "@",
        minY: "@",
        maxY: "@"
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
           
           this.setOrigin();
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
            this.originY = origin;
        };

        this.setOrigin = function(){
            this.setDeltaX();
            this.setDeltaY();
            this.setOriginX();
            this.setOriginY();
        };
    }, 
    templateUrl: "templates/svg.tpl.html"
});

})(window.angular);


