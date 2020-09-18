//=============================================================================
//  Rhythm Puzzle by staticccast
//  Ver 1.0
//=============================================================================

/*:
 * @plugindesc (v1.0) Provides a donut-shaped rhythm puzzle feature. 
 * @author staticccast
 * 
 * @help
 * This provides a donut-shaped rhythm puzzle feature.
 * Rhythm puzzle (Speed puzzle, or Timing Puzzle)
 * is something like this :
 * If player hits a right button on right time,
 * then the puzzle is successfully solved.
 * If player fails to do so,
 * then it's failed obviously.
 * 
 * Same logic with
 * "fixing generator puzzle" of "Dead by Daylight"
 * 
 * 
 * @param Control
 * @param Position
 * @param Graphic
 * @param During Solving
 * @param Done Solving
 * 
 * @param Trigger Switch
 * @parent Control
 * @desc This switch will enable the rhythm puzzle
 * 해당 스위치가 ON일 때 퍼즐이 동작
 * @default 0
 * @type switch
 * 
 * 
 * @param Display on where?
 * @parent Position
 * @desc Defines where to display the puzzle
 * 0 : Center of the screen
 * 1 : Around the player (Puzzle center = Player)
 * 2 : Around the player & Follow the player
 * 3 : Specify
 * 퍼즐을 표시할 위치를 지정합니다.
 * 0 : 화면 정중앙
 * 1 : 플레이어를 중심으로 (퍼즐의 중심 = 플레이어)
 * 2 : 플레이어를 중심으로 & 플레이어 따라다니기
 * 3 : 지정하기
 * @default 0
 * 
 * @param Screen X
 * @parent Position
 * @desc Screen X-Axis to display the puzzle
 * 퍼즐을 표시할 화면상의 X 좌표
 * @default 0
 * 
 * @param Screen Y
 * @parent Position
 * @desc Screen Y-Axis to display the puzzle
 * 퍼즐을 표시할 화면상의 Y 좌표
 * @default 0
 *
 *
 * @param Puzzle Base Img
 * @parent Graphic
 * @desc Image file of Puzzle base
 * 퍼즐 밑판 이미지
 * @default RhythmPuzzleBase
 * @dir img/pictures/
 * @type file
 * 
 * @param Puzzle Bar Img
 * @parent Graphic
 * @desc Image file of Puzzle bar(needle)
 * 퍼즐 막대 이미지
 * @default RhythmPuzzleBar
 * @dir img/pictures/
 * @type file
 * 
 * 
 * @param Speed
 * @parent During Solving
 * @desc Defines how fast the bar moves (Variable type)
 * 막대가 움직일 속도 (변수형)
 * @type variable
 * @default 1
 * 
 * @param Success angle range
 * @parent During Solving
 * @desc Angle range of right spot to hit (in degree) (Variable type)
 * 맞춰야 하는 각도 범위 (도 단위) (변수형)
 * @type variable
 * @default 1
 * 
 * 
 * @param If succeeded
 * @parent Done Solving
 * @desc This switch will be ON when succeeded
 * 성공시 이 스위치가 ON
 * @type switch
 * @default 0
 * 
 * @param If failed
 * @parent Done Solving
 * @desc This switch will be ON when failed
 * 실패시 이 스위치가 ON
 * @type switch
 * @default 0
 */
var parameters = PluginManager.parameters('Compass_staticccast');
var cpsOn = false;

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	_Game_Interpreter_pluginCommand.call(this, command, args);
    if(command.toLowerCase() === 'compass') {
        if(args[0].toLowerCase() === 'on')  cpsOn = true;
        else                                cpsOn = false;
    }
};

var _Spriteset_Base_createUpperLayer =
Spriteset_Base.prototype.createUpperLayer;
Spriteset_Base.prototype.createUpperLayer = function() {
    _Spriteset_Base_createUpperLayer.call(this);
    this.createCompass();
};

Spriteset_Base.prototype.createCompass = function() {
    this._compassSprite = new Sprite_Compass();
    this.addChild(this._compassSprite);
};

function Sprite_Compass() {
    this.initialize.apply(this, arguments);
}

Sprite_Compass.prototype = Object.create(Sprite.prototype);
Sprite_Compass.prototype.constructor = Sprite_Compass;

Sprite_Compass.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);

    this.imgBase = new Sprite(ImageManager.loadBitmap('img/pictures/', parameters['Compass Base Img']));
    this.imgNeedle = new Sprite(ImageManager.loadBitmap('img/pictures/', parameters['Compass Needle Img']));
    this.imgBase.x = (parameters['Screen X']);
    this.imgBase.y = (parameters['Screen Y']);
    this.imgNeedle.anchor.x = 0.5;
    this.imgNeedle.anchor.y = 0.5;

    this.setPosition();
    this.addChild(this.imgBase);
    this.imgBase.addChild(this.imgNeedle);
};

Sprite_Compass.prototype.setPosition = function() {
    this.accel = 0;
};

Sprite_Compass.prototype.update = function() {
    if($gameSwitches.value(parameters['Trigger Switch']) === false)
    {
        this.imgBase.visible = false;
    }
    else
    {
        this.imgBase.visible = true;

        this.destX = $gameVariables.value(parameters['Destination Tile X Var.']);
        this.destY = $gameVariables.value(parameters['Destination Tile Y Var.']);

        if( this.imgNeedle.x === 0 ) {
        this.imgNeedle.x = Number(this.imgBase.bitmap.width/2);
        this.imgNeedle.y = Number(this.imgBase.bitmap.height/2);
        }
        if( $gameSwitches.value(parameters['Malfunction Switch']) === true )
        this.pointWrong();
        else
        this.pointRight();
    }
};

Sprite_Compass.prototype.pointWrong = function() {
    if( this.accel < .2 ) this.accel += .001;
    
    this.imgNeedle.rotation += this.accel;
    this.imgNeedle.rotation %= 6.28;

    console.log(this.imgNeedle.rotation);
}

Sprite_Compass.prototype.pointRight = function() {
    var arctan = Math.atan2($gamePlayer.y-this.destY, $gamePlayer.x-this.destX);
    //if( arctan < 0 ) arctan += 6.2832;
    //var whichwise = Math.abs(this.imgNeedle.rotation - arctan);

    //this.imgNeedle.rotation += .05;
    /*
    if( whichwise < 3.14 ) this.imgNeedle.rotation += .1;
    else this.imgNeedle.rotation -= .1;
    this.imgNeedle.rotation %= 6.28;
    */
    /*
    if( whichwise > .1 ) {
        if( this.imgNeedle.rotation < arctan ) this.imgNeedle.rotation += .1;
        else this.imgNeedle.rotation -= .1;
    }
    */

    this.imgNeedle.rotation = (arctan + this.imgNeedle.rotation) / 2;
    //this.imgNeedle.rotation %= 12.56637;
    //console.log(this.imgNeedle.rotation);
    //console.log(whichwise);
    //console.log(arctan);
    //this.imgNeedle.rotation += .05;
    //this.imgNeedle.rotation %= 6.28;
    //if( 6.28 < whichwise ) this.imgNeedle.rotation += .1;
    //else this.imgNeedle.rotation -= .1;
    /*
    if( whichwise > .1 ) {
        if( whichwise < 6.28 ) {
            this.imgNeedle.rotation -= .1;
        } else {
            this.imgNeedle.rotation += .1;
        }
        console.log(whichwise);
    }
    //this.imgNeedle.rotation = (arctan + this.imgNeedle.rotation) / 2;
    //console.log(Math.abs((arctan - this.imgNeedle.rotation)));
    /*
    if( whichwise < 0 ) {
        this.imgNeedle.rotation += .01;
    } else if ( whichwise > 0 ) {
        this.imgNeedle.rotation -= .01;
    }
    
    //1.570
    //0 3.14  반시계 3.14 6.28 시계
    

    //this.imgNeedle.rotation = Math.abs((this.imgNeedle.rotation + arctan)/2);
    
    //console.log((this.imgNeedle.rotation - arctan), (arctan - this.imgNeedle.rotation));
    
    /*
    if(Math.abs(this.imgNeedle.rotation - arctan) < 3.14) {
        this.imgNeedle.rotation += 0.1;
    } else {
        this.imgNeedle.rotation -= 0.1;
    }
    /*
    if( arctan == this.imgNeedle.rotation ) {
        this.accel = 0;
    } else {
        console.log(arctan, this.imgNeedle.rotation);
    }
    
    if( this.accel == 0 ) {

    }
    else {

    }
    */
    //this.imgNeedle.rotation = arctan;
    
    
}