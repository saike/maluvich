angular.module('maluvich.directives', [])
  .directive('malbert', function(game, canvas, $location, routes){
    return {
      restrict: 'E',
      replace: true,
      scope: {
        level: '='
      },
      templateUrl: 'html/directives/malbert.html',
      link: function(scope, elm){

        scope.$emit('load.start');
//        scope.malbert_height = window.innerHeight;
        var $canvas = $(elm).find('.canvas').first();
        var $draw_wrapper = $(elm).find('.drawing_wrapper').first();
        var $top_tools = $(elm).find('.top_tools').first();
        var $tools = $(elm).find('.tools').first();

        var $back_image = $(elm).find('.background_image').first();
        var $compare_image = $(elm).find('.compare_image').first();
        var $paint_image = $(elm).find('.paint_image').first();

        $(window).on('resize', function(){
          setSize();
        });

        function setSize(){
          if(game.getState() != 'pregame') game.setState('pregame');
          var image_ratio = $back_image[0].naturalWidth/$back_image[0].naturalHeight;
          var image_width = $canvas.width()*0.96;
          var image_height = image_width/image_ratio;
          while(image_height > $canvas.height()){
            image_width--;
            image_height = image_width/image_ratio;
          }
          $draw_wrapper.css({width: image_width+'px', height: image_height+'px', top: ($canvas.height()-image_height)/2+'px', left: ($canvas.width()-image_width)/2+'px'});
          $top_tools.css({width: image_width+'px', left: ($canvas.width()-image_width)/2+'px'});
          $tools.css({width: image_width+'px'});
          canvas.init($paint_image[0], $compare_image[0], image_width, image_height);
        }

//        var drawing_height = window.innerHeight*0.7;
//        console.log(scope.malbert_width);
        $back_image.load(function(){
          var canvas_width = $back_image.width();
          var canvas_height = $back_image.height();
          setSize();
          scope.$emit('load.end');
          scope.$apply();
        });

        scope.getTimer = game.getTimer;

        scope.getCompleteness = game.getCompleteness;

        scope.gameState = game.getState;

        scope.currentLevel = game.getLevel;

        scope.specials = game.getSpecials;

        scope.startGame = function(){
          game.setState('paint');
        };

        scope.setState = game.setState;

        scope.goToGallery = function(){
          $location.path(routes.levels.url);
        };

        scope.goToMain = function(){
          $location.path(routes.feed.url);
        };

        scope.restartGame = function(){
          canvas.clear($paint_image[0]);
          scope.setState('pregame');
          scope.setState('paint');
        };

        scope.setColor = canvas.setColor;

        scope.getColor = function(){
          return canvas.selectedColor;
        };

      }
    };
  })

  .directive('loader', function($rootScope){
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      template: '<table class="loader_wrapper" data-ng-show="loading"><tr><td><img src="img/lib/loader.gif" alt="loading..."/></td></tr></table>',
      link: function(scope, elm){
        scope.loading = false;
        $rootScope.$on('load.start', function(){
          scope.loading = true;
        });
        $rootScope.$on('load.end', function(){
          scope.loading = false;
        });
      }
    };
  })

  .directive('logger', function(config){
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      template:
        '<div class="logger" data-ng-show="isLoggerShow()">' +
          '<ul>' +
            '<li data-ng-repeat="log in logs track by $index">[[ log ]]</li>' +
          '</ul>' +
        '</div>',
      link: function(scope, elm){

        scope.logs = [];

        scope.isLoggerShow = function(){
          return scope.logs.length > 0 && config.logger;
        };

        scope.$on('log', function(e, text){
          if(scope.logs.length >= 10){
            scope.logs.shift();
          }
          scope.logs.push(text);
        });
      }
    };
  });
