var game = {
    _init_: function(){
        game.set_screen('level_selector');
    },
    elements: {
        logger: document.getElementById('logger'),
        screens: {
            level_selector: $('#level_selector'),
            game_menu: $('#game_menu'),
            game_screen: $('#game_screen')
        },
        levelSelectMenuBtn: document.getElementById('levelSelectMenuBtn'),
        levelSelectScreen: document.getElementById('levelSelectScreen')
    },
    states: {
        1: 'setLevel'
    },
    set_screen: function(name){
        for(var i in game.elements.screens){
            if(game.elements.screens[i].is(':visible')) game.elements.screens[i].hide();
        }
        game.elements.screens[name].show();
    },
    state: 'setLevel',
    timer: 0.0,
    currentLevel: false,
    levels: []
};


function getLevelList(){
    menuScreen.style.display = "none";
    game.state = "setLevel";
    game.elements.levelSelectScreen.style.display = "block";

}

game.elements.levelSelectMenuBtn.onclick = getLevelList;

var paintColorsRGB = new Array();
$.getJSON("json/levels.json").done(function(data){

    levels = data;

    console.log(levels);
    levels.forEach(function(level){
        var newImage = new Image();
        newImage.src = level.mainImage;
        newImage.id = "level" + levels.indexOf(level);
        $(newImage).addClass("levelBtn");

        console.log(newImage);
        game.elements.levelSelectScreen.appendChild(newImage);
        newImage.onclick = function(){setLevel(level)};

    });
});


function setLevel(level){
    specials = 3;
    specialBtn.innerHTML = specials;
    timer.innerHTML = "0.00";
    game.currentLevel = level;
    scoreBar.style.width = 0;
    procentageBar.innerHTML = "0%";
    game.timer = 0.0;
    startBtn.style.display = "block";
    startBtn.innerHTML = "Start";
    //COLORS FOR PAINT
    var paintColors = level.colors.split(",");

    console.log(paintColors);

    Canva.selectedColor = "#" + paintColors[0];
    paintColorsRGB = [];
    $(".paintColor").remove();
    paintColors.forEach(function(color){

        var bigint = parseInt(color, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        paintColorsRGB.push([r,g,b]);
        var newColor = document.createElement('div');
        newColor.style.backgroundColor = '#' + color;

        newColor.onclick = function(){
            var colors = palette.childNodes;

            $(colors).each(function(){

                $(this).removeClass("selectedColor");

            });
            $(newColor).addClass("selectedColor");

            Canva.selectedColor = '#' + color;

        }
        $(newColor).addClass("paintColor");
        palette.appendChild(newColor);
    });
    var first_color = $(palette).children()[0];
    $(first_color).addClass("selectedColor");
    $(game.elements.levelSelectScreen).fadeOut(150);
    console.log(paintColorsRGB);

    //render images
    var ctx = back_canvas.getContext("2d");
    var img = new Image();
    img.src = level.mainImage;
    img.onload = function(){
        ctx.drawImage(img, 0, 0, back_canvas.width, back_canvas.height);
    };

    compare_canvas.width = back_canvas.width;
    compare_canvas.height = back_canvas.height;
    var compCTX = compare_canvas.getContext("2d");

    var compImg = new Image();
    compImg.src = level.compareImage;
    compImg.onload = function(){

        compCTX.drawImage(compImg, 0, 0, compare_canvas.width, compare_canvas.height);
        comparePixels = compCTX.getImageData(0,0,compare_canvas.width, compare_canvas.height);
        allPixels = 0;
        for(var i = 0; i < comparePixels.data.length; i+=4){
            paintColorsRGB.forEach(function(paletteColor){

                if(comparePixels.data[i] == paletteColor[0] && comparePixels.data[i+1] == paletteColor[1] && comparePixels.data[i+2] == paletteColor[2] ){

                    allPixels++;

                }

            });

        }
        console.log('all pixels: ' + allPixels);
//        logger.innerHTML = 'all pixels: ' + allPixels;
        compare_canvas.style.display = "none";
    };

    paint_canvas.width = back_canvas.width;
    paint_canvas.height = back_canvas.height;

}

//game screen
var paint_wrapper = document.getElementById('paint_wrapper');

//palette container
var palette = document.getElementById("palette");

//image to paint
var back_canvas = document.getElementById("background_image");

//holst
var paint_canvas = document.getElementById("paint_image");

//image to compare
var compare_canvas = document.getElementById("compare_image");
var comparePixels = false;


//score container
var scorer = document.getElementById("score");

//complete score bar
var scoreBar = document.getElementById("scoreBar");

//special button
var specialBtn = document.getElementById("specialBtn");
function getSpecial(){
    if(game.state == "paint" && specials>0){

        $(compare_canvas).fadeIn(150);
        game.state = "special";
        specials--;
        specialBtn.innerHTML = specials;
        setTimeout(function(){

            $(compare_canvas).fadeOut(150);
            game.state = "paint"

        }, 3000);
    }

}
specialBtn.addEventListener("touchstart", getSpecial, false);
specialBtn.onclick = getSpecial;

//////////////////////////////////////
//MENU SCREEN
var menuScreen = document.getElementById("menuScreen");

//MENU BUTTON
var menuBtn = document.getElementById('menuBtn');

//HIDE MENU
var hideMenuBtn = document.getElementById('exitMenu');

function hideMenu(){
    if(game.timer > 0){

        game.state = "paint"

    }
    else {

        game.state = "setLevel"

    }
    $(menuScreen).fadeOut(150);
}
hideMenuBtn.addEventListener("touchstart", hideMenu, false);
hideMenuBtn.onclick = hideMenu;

//RESTART
var restartBtn = document.getElementById("restartBtn");
restartBtn.addEventListener("touchstart", startGame, false);
restartBtn.onclick = startGame;

//MENU EVENTS

function getMenu(){

    game.state = "menu";
    $(menuScreen).fadeIn(150);

}
menuBtn.addEventListener("touchstart", getMenu, false);
menuBtn.onclick = getMenu;


////////////////////////////////////////


////////////////////////////////////////
//procentage bar
var procentageBar = document.getElementById("procentsBar");


//SCORE
var score = 0;

//specials count
var specials = 3;

var allPixels = 0;

var mainTimer = false;

//start button
var startBtn = document.getElementById("start_button");

//timer container
var timer = document.getElementById("timer");


//start button click event
function startGame(){
    $(back_canvas).fadeIn(150);
    $(menuScreen).fadeOut(150);
    specials = 3;
    specialBtn.innerHTML = specials;
    Canva.clear();
    scoreBar.style.width = 0;
    procentageBar.innerHTML = "0%";
    game.timer = 0.0;
    $(startBtn).fadeOut(150);
    game.state = "paint";
    mainTimer = setInterval(function(){
        if(game.state == "paint"){

            game.timer+=0.01; timer.innerHTML = game.timer.toFixed(2);

        }
    }, 10);

}

startBtn.onclick = startGame;

startBtn.addEventListener("touchstart", startGame, false);



console.log(back_canvas);

function __init__(){
    var scrWidth = parseInt(window.innerWidth);
    var scrHeight = parseInt(window.innerHeight);
    if(scrWidth >= scrHeight){

        paint_wrapper.style.height = scrHeight - (scrHeight/100*3) + "px";
        paint_wrapper.style.top = (scrHeight/100*3) + "px";
        paint_wrapper.style.width = scrHeight/4*2.4 + "px";
        paint_wrapper.style.left = (scrWidth/2) - (parseInt(paint_wrapper.style.width)/2) + "px";

        game.elements.levelSelectScreen.style.top = 0 + "px";
        game.elements.levelSelectScreen.style.width = scrHeight/4*2.4 + "px";
        game.elements.levelSelectScreen.style.left = (scrWidth/2) - (parseInt(paint_wrapper.style.width)/2) + "px";
        game.elements.levelSelectScreen.style.height = scrHeight + "px";


        back_canvas.width = parseInt(paint_wrapper.style.width);
        back_canvas.height = scrHeight*0.75;
        specialBtn.style.top = scrHeight*0.81 + "px";
        specialBtn.style.height = scrHeight*0.07 + "px";
        specialBtn.style.lineHeight = scrHeight*0.07 + "px";
        specialBtn.style.left = scrWidth/2 + "px";
        specialBtn.style.marginLeft = -1 * back_canvas.width*0.50 + 'px';
        specialBtn.style.width = back_canvas.width*0.12 + "px";
        menuBtn.style.width = back_canvas.width*0.12 + "px";
        menuBtn.style.height = scrHeight*0.07 + "px";
        menuBtn.style.lineHeight = scrHeight*0.07 + "px";
        menuBtn.style.left = scrWidth/2 + "px";
        menuBtn.style.marginLeft = -1 * back_canvas.width*0.37 + 'px';
        menuBtn.style.top = scrHeight*0.81 + "px";

        palette.style.left = scrWidth/2 + "px";
        palette.style.marginLeft = -1 * back_canvas.width*0.18 + "px";
        palette.style.top = scrHeight*0.81 + "px";
        palette.style.height = scrHeight*0.07 + "px";
        palette.style.width = back_canvas.width*0.5 + "px";
        timer.style.top = scrHeight*0.81 + "px";
        timer.style.height = scrHeight*0.07 + "px";
        timer.style.lineHeight = scrHeight*0.07 + "px";
        timer.style.left = scrWidth/2 + "px";
        timer.style.marginLeft = back_canvas.width*0.35 + "px";
        timer.style.width = back_canvas.width*0.15 + "px";
        scorer.style.top = scrHeight*0.905 + "px";
        scorer.style.width = back_canvas.width*0.90 + "px";
        scorer.style.left = (scrWidth*0.5) - (back_canvas.width*0.90*0.5) + "px";
        scorer.style.height = scrHeight*0.07 + "px";
        startBtn.style.width = back_canvas.width*0.5 + "px";
        startBtn.style.left = (back_canvas.width/2) - (back_canvas.width*0.5/2) + "px";
        startBtn.style.top = back_canvas.height*0.45 + "px";
        procentsBar.style.lineHeight = scrHeight*0.07 + "px";
    }
    else {
        paint_wrapper.style.height = scrHeight*0.70 + "px";
        paint_wrapper.style.width = parseInt(paint_wrapper.style.height)*0.75 + "px";

        paint_wrapper.style.top = (scrHeight/100*11) + "px";
        while(parseInt(paint_wrapper.style.width) > scrWidth){

            paint_wrapper.style.width = parseInt(paint_wrapper.style.width) - 1 + "px";
            paint_wrapper.style.height = parseFloat(paint_wrapper.style.height) - 1.25 + "px";
            paint_wrapper.style.top = (scrHeight/2) - (parseInt(paint_wrapper.style.height)/1.8) + "px";


        }

        paint_wrapper.style.left = (scrWidth/2) - (parseInt(paint_wrapper.style.width)/2) + "px";


        back_canvas.height = parseInt(paint_wrapper.style.height);
        back_canvas.width = parseInt(paint_wrapper.style.width);

        specialBtn.style.top = scrHeight*0.83 + "px";
        specialBtn.style.height = scrHeight*0.07 + "px";
        specialBtn.style.lineHeight = scrHeight*0.07 + "px";
        specialBtn.style.left = scrWidth*0.05 + 'px';
        specialBtn.style.width =scrWidth*0.17 + "px";
        menuBtn.style.top = scrHeight*0.91 + "px";
        menuBtn.style.height = scrHeight*0.07 + "px";
        menuBtn.style.lineHeight = scrHeight*0.07 + "px";
        menuBtn.style.left = scrWidth*0.05 + 'px';
        menuBtn.style.width =scrWidth*0.17 + "px";
        palette.style.left = scrWidth*0.30 + "px";
        palette.style.top = scrHeight*0.83 + "px";
        palette.style.height = scrHeight*0.07 + "px";
        palette.style.width = scrWidth*0.4 + "px";
        $(".paintColor").css("width", "45%").css("margin-right", "5%").css("border-radius", "10px").css("margin-bottom", "5%");
        timer.style.top = scrHeight*0.87 + "px";
        timer.style.height = scrHeight*0.1 + "px";
        timer.style.fontSize = scrHeight*0.03 + "px";
        timer.style.lineHeight = scrHeight*0.1 + "px";
        timer.style.left = scrWidth*0.75 + "px";
        timer.style.width = scrWidth*0.20 + "px";
        scorer.style.top = scrHeight*0.02 + "px";
        scorer.style.left = scrWidth*0.05 + 'px';
        scorer.style.width = scrWidth*0.90 + "px";
        scorer.style.height = scrHeight*0.07 + "px";
        startBtn.style.width = scrWidth*0.5 + "px";
        startBtn.style.left = (back_canvas.width/2) - (scrWidth*0.5/2) + "px";
        startBtn.style.top = back_canvas.height*0.40 + "px";
        procentsBar.style.lineHeight = scrHeight*0.07 + "px";


    }

}
__init__();



//ie buggit
function ie_event(e)
{
    if (e === undefined)
    { return window.event; };
    return e;
}



var Canva = {};

// Инициализация объекта
Canva.init = function(id, width, height)
{
    var canv = document.getElementById(id);
    canv.width = width;
    canv.height = height;

    this.canvasId = id;

    this.ctx = canv.getContext("2d");
    // Свойства
    this.selectedColor = false;
    this.selectedFillColor = '#FFFFFF';
    this.selectedWidth = parseInt(paint_wrapper.style.width)*0.02;
    this.tool = Pencil; // Выбранный инструмент
    this.drawing = false; // true - если зажата кнопка мыши


    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////

    //GET TOUCHES =)

    this.handleStart = function (evt){

        evt.preventDefault();
        var evnt = ie_event(evt);

        canv.onmousedown = null;
        canv.onmousemove = null;
        canv.onmouseup = null;
        if(game.state == "paint"){
            Canva.tool.start(evnt);
        }
    };
    this.handleMove = function(evt){

        evt.preventDefault();
        if (Canva.drawing && game.state == "paint")
        {
            var evnt = ie_event(evt);
            Canva.tool.move(evnt);
        }

    };
    this.handleEnd = function(evt){

        evt.preventDefault();

        if (Canva.drawing && game.state == "paint")
        {
            var evnt = ie_event(evt);

            Canva.tool.finish(evnt);
            getScore();

        }

    };

    canv.addEventListener("touchstart", this.handleStart, false);
    canv.addEventListener("touchend", this.handleEnd, false);
    canv.addEventListener("touchmove", this.handleMove, false);

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////


    function getScore(){

        score = 0;

        var paintCTX = paint_canvas.getContext("2d");
        var painted_pixels = paintCTX.getImageData(0,0,paint_canvas.width, paint_canvas.height);
        for(var i = 0; i < comparePixels.data.length; i+=4){

            if(comparePixels.data[i] == painted_pixels.data[i] && comparePixels.data[i+1] == painted_pixels.data[i+1] && comparePixels.data[i+2] == painted_pixels.data[i+2] ){

                score++;

            }


        }

        //100% = 90%
        var hiScore = allPixels*0.8;


        var completion = (score/(hiScore/100)).toFixed(2);

        procentageBar.innerHTML = completion + "%";
        var scoreProcentage = parseInt((parseInt($(scorer).css("width"))/100)*completion);
        scoreBar.style.width = scoreProcentage + "px";
        ///send log
        //logger.innerHTML = "score: " + score + "hiscore:  " + hiScore + "  " + paint_canvas;
        console.log(score + " gopa " + scoreProcentage);
        if(score >= hiScore){

            clearInterval(mainTimer);
            var scoreTime = game.timer;
            startBtn.innerHTML = "Your time:" + scoreTime.toFixed(2) + "s";
            $(startBtn).fadeIn(150);
            game.state = "finish";
            game.timer = 0.0;
            timer.innerHTML = 0.00;
            procentageBar.innerHTML = "100%";
            scoreBar.style.width = $(scorer).css("width");
            $(back_canvas).fadeOut(150);
            compare_canvas.style.display = "none"
        }

    }

    // Кнопка мыши зажата, рисуем
    canv.onmousedown = function(e)
    {

        var evnt = ie_event(e);
        if(game.state == "paint"){

            Canva.tool.start(evnt);


        }
    };

    // Кнопка мыши отпущена, рисование прекращаем
    canv.onmouseup = function(e)
    {
        if (Canva.drawing && game.state == "paint")
        {
            var evnt = ie_event(e);

            Canva.tool.finish(evnt);
            getScore();

        }
    };

    // процесс рисования
    canv.onmousemove = function(e)
    {
        if (Canva.drawing && game.state == "paint")
        {
            var evnt = ie_event(e);
            Canva.tool.move(evnt);
        }
    };
};

Canva.setTool = function(t) // Задать инструмент
{
    Canva.tool = t;
};

Canva.setWidth = function(width) // Задать толщину линий
{
    Canvas.selectedWidth = width;
};

Canva.setColor = function(color) // Задать текущий цвет
{
    Canva.selectedColor = color;
};

Canva.clear = function() // Очистить рисовалку
{
    var canvas = document.getElementById(Canva.canvasId);
    Canva.ctx.clearRect(0, 0, canvas.width, canvas.height);
};


var Pencil = {};

// Начинаем рисование
Pencil.start = function(evnt)
{
    var x = evnt.pageX || evnt.changedTouches[0].pageX;
    var y = evnt.pageY || evnt.changedTouches[0].pageY;

    // Текущее положение мыши - начальные координаты
    Pencil.x = x - parseInt(paint_wrapper.style.left);
    Pencil.y = y - parseInt(paint_wrapper.style.top);

    Canva.ctx.beginPath();
    Canva.ctx.arc(Pencil.x, Pencil.y, 4, 0, 2*Math.PI, true);
    Canva.ctx.closePath();
    Canva.ctx.fill();
    // Свойства рисования
    Canva.ctx.strokeStyle = Canva.selectedColor;
    Canva.ctx.fillStyle = Canva.selectedColor;
    Canva.ctx.lineWidth = Canva.selectedWidth;
    Canva.ctx.moveTo(Pencil.x, Pencil.y); // Курсор на начальную позицию

    Canva.drawing = true; // Начато рисование
};

// Рисование закончили
Pencil.finish = function(evnt)
{
    var x = evnt.pageX || evnt.changedTouches[0].pageX;
    var y = evnt.pageY || evnt.changedTouches[0].pageY;
    Pencil.x = x - parseInt(paint_wrapper.style.left);
    Pencil.y = y - parseInt(paint_wrapper.style.top);
    Canva.ctx.beginPath();

    Canva.ctx.arc(Pencil.x, Pencil.y, Canva.selectedWidth/2, 0, 2*Math.PI, true);
    Canva.ctx.closePath();
    Canva.ctx.fill();

    Canva.ctx.lineTo(Pencil.x, Pencil.y); // Дорисовываем последнюю линию
    Canva.drawing = false;
};

// Рисование в разгаре
Pencil.move = function(evnt)
{
    var x = evnt.pageX || evnt.changedTouches[0].pageX;
    var y = evnt.pageY || evnt.changedTouches[0].pageY;
    Pencil.x = x - parseInt(paint_wrapper.style.left);
    Pencil.y = y - parseInt(paint_wrapper.style.top);
    Canva.ctx.lineTo(Pencil.x, Pencil.y); // Дорисовываем начатую линию
    Canva.ctx.stroke();
    Canva.ctx.beginPath();
    Canva.ctx.arc(Pencil.x, Pencil.y,  Canva.selectedWidth/2, 0, 2*Math.PI, true);
    Canva.ctx.closePath();
    Canva.ctx.fill();

    // Начинаем рисованть новую линию из той же точки.
    Canva.ctx.moveTo(Pencil.x, Pencil.y);
};


Canva.init("paint_image", back_canvas.width, back_canvas.height);
