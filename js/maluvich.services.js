angular.module('maluvich.services', [])

  .service('authorize', function(){
    var self = this;

    var user = false;

    self.getUser = function(){
      return user;
    };

    self.setUser = function(profile){
      user = profile;
    };

  })

  .service('facebook', function(config, $rootScope, authorize){
    var self = this;

    self.auth_data = {};

    self.login = function(callback) {
      FB.login(callback);
    };

    function loginCallback(response) {
      console.dir(response);
      if(response.status != 'connected') {
        self.login(loginCallback);
      }
    }

    function setAccount(data){
      self.auth_data = data;
      $rootScope.$broadcast('facebook.auth.success');
    }

    function onStatusChange(response) {
      if( response.status != 'connected' ) {
        self.login(loginCallback);
      } else {
        setAccount(response.authResponse);
      }
    }
    function onAuthResponseChange(response) {
      setAccount(response.authResponse);
    }

    if(window.FB != 'undefined'){
      self.init = function(){

        FB.init({
          appId: config.facebook_id,
          frictionlessRequests: true,
          status: true,
          version: 'v2.1'
        });

        FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
        FB.Event.subscribe('auth.statusChange', onStatusChange);

      };

      self.getProfile = function(){
        FB.api('/me', {fields: 'id,name,first_name,picture.width(120).height(120)'}, function(response){
          if( !response.error ) {
            authorize.setUser(response);
            $rootScope.$apply();
            $rootScope.$broadcast('facebook.profile.load.success', response);
          } else {
            console.error('/me', response);
            $rootScope.$broadcast('facebook.profile.load.error', response);
          }
        });
      }
    }

  })

  .service('game', function($interval){

    var self = this;

    var timer = 0.00;
    var completeness = 0.00;
    var current_state = 'pregame';
    var current_level = false;
    var timer_interval = null;
    var minimum_specials = 3;
    var used_specials = 0;
    var bonus_specials = 0;

    self.getTimer = function(){
      return timer;
    };

    self.getCompleteness = function(){
      return completeness;
    };

    self.levels = [
      {
        name: 'Портрет',
        main_image: "img/canberra_hero_image.jpg",
        compare_image: "img/canberra_hero_image.jpg",
        colors: ['#b4875d', '#5d3f25', '#1f060c', '#2a070d']
      },
      {
        name: 'Черепашка',
        main_image: "img/level2back.jpg",
        compare_image: "img/level2compare.jpg",
        colors: ['#fefdfb', '#dbdd9b', '#b6a04b', '#484a25']
      },
      {
        name: 'Портрет',
        main_image: "img/background.jpg",
        compare_image: "img/layer.jpg",
        colors: ['#b4875d', '#5d3f25', '#1f060c', '#2a070d']
      },

      {
        name: 'Портрет',
        main_image: "img/background.jpg",
        compare_image: "img/layer.jpg",
        colors: ['#b4875d', '#5d3f25', '#1f060c', '#2a070d']
      },
      {
        name: 'Портрет',
        main_image: "img/background.jpg",
        compare_image: "img/layer.jpg",
        colors: ['#b4875d', '#5d3f25', '#1f060c', '#2a070d']
      },
      {
        name: 'Черепашка',
        main_image: "img/level2back.jpg",
        compare_image: "img/level2compare.jpg",
        colors: ['#fefdfb', '#dbdd9b', '#b6a04b', '#484a25']
      },
      {
        name: 'Черепашка',
        main_image: "img/level2back.jpg",
        compare_image: "img/level2compare.jpg",
        colors: ['#fefdfb', '#dbdd9b', '#b6a04b', '#484a25']
      },
      {
        name: 'Черепашка',
        main_image: "img/level2back.jpg",
        compare_image: "img/level2compare.jpg",
        colors: ['#fefdfb', '#dbdd9b', '#b6a04b', '#484a25']
      }
    ];

    self.setState = function(state){
      current_state = state;
      if(current_state == 'pregame'){
        $interval.cancel(timer_interval);
        timer = 0.00;
        completeness = 0.00;
      }
      else if (current_state == 'paint'){
        timer_interval = $interval(function(){
          timer+=0.1;
        }, 100);
      }
      else if (current_state == 'menu') {
        $interval.cancel(timer_interval);
      }
      else if (current_state == 'postgame') {
        $interval.cancel(timer_interval);
        self.score_time = timer;
        completeness = 100;
      }
      else {
        self.setState('pregame');
      }
    };

    self.getState = function(){
      return current_state;
    };

    self.setLevel = function(level){
      current_level = level;
    };

    self.getLevel = function(){
      return current_level;
    };

    self.getSpecials = function(){
      return minimum_specials + bonus_specials - used_specials;
    };

    self.setCompleteness = function(value){
      completeness = value;
    };
  })

  .service('canvas', function(game) {

    var self = this;

    //ie buggit
    function ie_event(e)
    {
      if (e === undefined)
      { return window.event; }
      return e;
    }

    self.init = function(paint_canvas, compare_canvas, width, height)
    {
      paint_canvas.width = compare_canvas.width = width;
      paint_canvas.height = compare_canvas.height = height;

      self.paint_ctx = paint_canvas.getContext("2d");
      // Свойства
      self.selectedColor = game.getLevel().colors[0];
      self.selectedWidth = parseInt(width)*0.04;
      self.tool = Pencil; // Выбранный инструмент
      self.drawing = false; // true - если зажата кнопка мыши
      // Текущее положение мыши - начальные координаты
      self.offsetLeft = $(paint_canvas).offset().left;
      self.offsetTop = $(paint_canvas).offset().top;

      //////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////

      //Рисуем картинку для сравнения
      var compare_ctx = compare_canvas.getContext("2d");

      var compare_img = new Image();
      compare_img.src = game.getLevel().compare_image;
      console.log(compare_img.src);
      compare_img.onload = function(){

        compare_ctx.drawImage(compare_img, 0, 0, compare_canvas.width, compare_canvas.height);
        self.compare_pixels = compare_ctx.getImageData(0,0,compare_canvas.width, compare_canvas.height);
        self.all_pixels = 0;
        var rgbColors = [];
        game.getLevel().colors.forEach(function(paletteColor){
          var bigint = parseInt(paletteColor.replace('#', ''), 16);
          var r = (bigint >> 16) & 255;
          var g = (bigint >> 8) & 255;
          var b = bigint & 255;
          rgbColors.push([r,g,b]);
        });
        for(var i = 0; i < self.compare_pixels.data.length; i+=4){
          rgbColors.forEach(function(rgbColor){

            if(self.compare_pixels.data[i] == rgbColor[0] && self.compare_pixels.data[i+1] == rgbColor[1] && self.compare_pixels.data[i+2] == rgbColor[2] ){

              self.all_pixels++;

            }

          });

        }
        console.log('all pixels: ' + self.all_pixels);

      };

      //GET TOUCHES =)

      self.handleStart = function (evt){

        evt.preventDefault();
        var evnt = ie_event(evt);

        paint_canvas.onmousedown = null;
        paint_canvas.onmousemove = null;
        paint_canvas.onmouseup = null;
        if(game.getState() == "paint"){
          self.tool.start(evnt);
        }
      };

      self.handleMove = function(evt){

        evt.preventDefault();
        if (self.drawing && game.getState() == "paint")
        {
          var evnt = ie_event(evt);
          self.tool.move(evnt);
        }

      };
      self.handleEnd = function(evt){

        evt.preventDefault();

        if (self.drawing && game.getState() == "paint")
        {
          var evnt = ie_event(evt);

          self.tool.finish(evnt);
          getScore();

        }

      };

      paint_canvas.addEventListener("touchstart", self.handleStart, false);
      paint_canvas.addEventListener("touchend", self.handleEnd, false);
      paint_canvas.addEventListener("touchmove", self.handleMove, false);

      //////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////////


      function getScore(){

        var score = 0;

        var painted_pixels = self.paint_ctx.getImageData(0,0,paint_canvas.width, paint_canvas.height);
        for(var i = 0; i < self.compare_pixels.data.length; i+=4){

          if(self.compare_pixels.data[i] == painted_pixels.data[i] && self.compare_pixels.data[i+1] == painted_pixels.data[i+1] && self.compare_pixels.data[i+2] == painted_pixels.data[i+2] ){

            score++;

          }

        }

        //100% = 90%
        var hiScore = self.all_pixels*0.8;
        var completion = (score/(hiScore/100)).toFixed(2);
        game.setCompleteness(completion);


        //logger.innerHTML = "score: " + score + "hiscore:  " + hiScore + "  " + paint_canvas;
        console.log(score + " gopa " + completion);
        if(score >= hiScore){

          game.setState('postgame');

        }

      }

      // Кнопка мыши зажата, рисуем
      paint_canvas.onmousedown = function(e)
      {

        var evnt = ie_event(e);
        if(game.getState() == "paint"){
          self.tool.start(evnt);
        }

      };

      // Кнопка мыши отпущена, рисование прекращаем
      paint_canvas.onmouseup = paint_canvas.onmouseout = function(e)
      {
        if (self.drawing && game.getState() == "paint")
        {
          var evnt = ie_event(e);

          self.tool.finish(evnt);
          getScore();

        }
      };

      // процесс рисования
      paint_canvas.onmousemove = function(e)
      {
        if (self.drawing && game.getState() == "paint")
        {
          var evnt = ie_event(e);
          self.tool.move(evnt);
        }
      };

    };

    self.setTool = function(t) // Задать инструмент
    {
      self.tool = t;
    };

    self.setWidth = function(width) // Задать толщину линий
    {
      self.selectedWidth = width;
    };

    self.setColor = function(color) // Задать текущий цвет
    {
      self.selectedColor = color;
    };

    self.clear = function(canvas) // Очистить рисовалку
    {
      self.paint_ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    var Pencil = {};

    // Начинаем рисование
    Pencil.start = function(evnt)
    {
      var x = evnt.pageX || evnt.changedTouches[0].pageX;
      var y = evnt.pageY || evnt.changedTouches[0].pageY;

      // Текущее положение мыши - начальные координаты
      Pencil.x = x - self.offsetLeft;
      Pencil.y = y - self.offsetTop;

      self.paint_ctx.strokeStyle = self.selectedColor;
      self.paint_ctx.fillStyle = self.selectedColor;
      self.paint_ctx.lineWidth = self.selectedWidth;
      self.paint_ctx.lineCap = 'round';
      self.paint_ctx.moveTo(Pencil.x, Pencil.y); // Курсор на начальную позицию
      self.paint_ctx.beginPath();
      self.paint_ctx.lineTo(Pencil.x, Pencil.y);
      self.paint_ctx.stroke();

      // Свойства рисования


      self.drawing = true; // Начато рисование


    };

    // Рисование в разгаре
    Pencil.move = function(evnt)
    {
      var x = evnt.pageX || evnt.changedTouches[0].pageX;
      var y = evnt.pageY || evnt.changedTouches[0].pageY;
      // Текущее положение мыши - начальные координаты
      Pencil.x = x - self.offsetLeft;
      Pencil.y = y - self.offsetTop;
      self.paint_ctx.lineTo(Pencil.x, Pencil.y);
      self.paint_ctx.stroke();
      self.paint_ctx.moveTo(Pencil.x, Pencil.y); // Курсор на начальную позицию

    };

    // Рисование закончили
    Pencil.finish = function(evnt)
    {
      var x = evnt.pageX || evnt.changedTouches[0].pageX;
      var y = evnt.pageY || evnt.changedTouches[0].pageY;
      // Текущее положение мыши - начальные координаты
      Pencil.x = x - self.offsetLeft;
      Pencil.y = y - self.offsetTop;
      self.paint_ctx.lineTo(Pencil.x, Pencil.y);
      self.paint_ctx.stroke();
      self.paint_ctx.closePath();
      self.drawing = false;
    };


  });
