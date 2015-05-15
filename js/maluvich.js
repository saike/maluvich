angular.module('maluvich', ['ngRoute', 'maluvich.services', 'maluvich.directives', 'maluvich.filters', 'ngTouch'])

  .constant('routes', {
    feed: {
      url: '/',
      template: 'html/feed.html'
    },
    levels: {
      url: '/levels',
      template: 'html/levels.html'
    },
    game: {
      url: '/game',
      template: 'html/game.html'
    }
  })

  .config(function($interpolateProvider, $routeProvider, routes){

    $interpolateProvider.startSymbol('[[').endSymbol(']]');

    $routeProvider.when(routes.feed.url, {
      templateUrl: routes.feed.template,
      controller: 'Feed',
      resolve: {
        auth: function(authorize, $location, routes){
          if(!authorize.getUser()) $location.path(routes.feed.url);
        }
      }
    });

    $routeProvider.when(routes.levels.url, {
      templateUrl: routes.levels.template,
      controller: 'Levels',
      resolve: {
        auth: function(authorize, $location, routes){
          if(!authorize.getUser()) $location.path(routes.feed.url);
        }
      }
    });

    $routeProvider.when(routes.game.url, {
      templateUrl: routes.game.template,
      controller: 'Game',
      resolve: {
        auth: function(authorize, $location, routes){
          if(!authorize.getUser()) $location.path(routes.feed.url);
        }
      }
    });

  })

  .constant('config', config || {})

  .controller('Feed', function($scope, $location, routes, facebook, authorize){

    console.dir(authorize.getUser());

    if(config.facebook_id && !authorize.getUser()){
      facebook.init();
    }
    else {
      $scope.user = authorize.getUser();
    }

    $scope.$on('facebook.auth.success', function(){
      facebook.getProfile();
    });

    $scope.$on('facebook.profile.load.success', function(){
      $scope.user = authorize.getUser();
    });

    $scope.start = function(){
      $location.path(routes.levels.url);
    };
  })

  .controller('Levels', function($scope, $location, game, routes){
    $scope.levels = game.levels;

    $scope.start_game = function(level){
      game.setLevel(level);
      $location.path(routes.game.url)
    };

  })

  .controller('Game', function($scope, game){
    if(!game.getLevel()){
      game.setLevel(game.levels[2]);
    }
    $scope.level = game.getLevel();
    game.setState('pregame');
  });
