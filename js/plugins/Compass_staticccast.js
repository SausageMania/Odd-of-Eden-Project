//=============================================================================
//  Compass by staticccast
//  Ver 1.1
//=============================================================================

//=============================================================================
//  UPDATE LOG
/*
    Ver 1.1 (2020.08.30.)
    Added Trigger Switch
    트리거 스위치 추가
*/
//=============================================================================

/*:
 * @plugindesc (v1.1) Provides compass feature
 * @author staticccast
 * 
 * 
 * @param Control
 * @param Values
 * @param Optional
 * 
 * @param Trigger Switch
 * @parent Control
 * @desc This switch will enable the compass
 * 해당 스위치가 ON일 때 나침반이 동작
 * @default 0
 * @type switch
 * 
 * @param Screen X
 * @parent Values
 * @desc Screen X-Axis to display sprite
 * 나침반이 표시될 화면상의 X 좌표
 * @default 0
 * 
 * @param Screen Y
 * @parent Values
 * @desc Screen Y-Axis to display sprite
 * 나침반이 표시될 화면상의 Y 좌표
 * @default 0
 *
 * @param Destination Tile X Var.
 * @parent Values
 * @desc Destination tile's X-Axis (Variable)
 * 나침반이 가리킬 목적지 타일의 X 좌표 (변수형)
 * @default 1
 * @type variable
 *
 * @param Destination Tile Y Var.
 * @parent Values
 * @desc Destination tile's Y-Axis (Variable)
 * 나침반이 가리킬 목적지 타일의 Y 좌표 (변수형)
 * @default 2
 * @type variable
 *
 * @param Compass Base Img
 * @parent Values
 * @desc Image file of compass base
 * 나침반 밑판 이미지
 * @default CompassBase
 * @dir img/pictures/
 * @type file
 * 
 * @param Compass Needle Img
 * @parent Values
 * @desc Image file of compass needle
 * 나침반 바늘 이미지
 * @default CompassNeedle
 * @dir img/pictures/
 * @type file
 * 
 * 
 * @param Malfunction Switch
 * @parent Optional
 * @desc When it's ON, compass will malfunction (spin)
 * 해당 스위치가 ON이면 나침반이 빙빙 돌며 오작동합니다
 * @default 0
 * @type switch
 *
 * @help  
 *
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