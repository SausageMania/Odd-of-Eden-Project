/*:
 * @plugindesc Bleed all over the place.
 * @author Dreadwing93
 *
 * @param grid_size
 * @text Grid Size
 * @desc size of the blood grid
 * @type Number
 * @default 24
 *
 * @param blood_image
 * @text Blood Image
 * @desc The character image to use for the blood spots.
 * @default
 * @type file
 * @dir img/characters/
 * @require 1
 *
 * @param blood_index
 * @text Blood Index
 * @desc The character index to use from the character sheet.
 * @default 0
 * @min 0
 * @max 7
 * @type Number
 *
 * @help
 *
 * This script can be used to make characters bleed.
 * The blood spots are persistent, and stay even after
 * leaving the room or saving and loading.
 *
 * Make the player bleed for 2 seconds:
 * 
 *   using script:
 *   $gamePlayer.bleed(2);
 *   
 *   using plugin command:
 *   bleed 2
 * 
 * Make Event 1 bleed for 0.1 seconds
 *
 *   using script:
 *   $gameMap.event(1).bleed(0.1);
 *
 *   using plugin command:
 *   bleed 0.1 1
 *
 * 
 */

(function(){
	var parameters = PluginManager.parameters('dread_blood');

	var BLOOD_GRID = Number(parameters['grid_size'])||24;

	var BLOOD_IMAGE = String(parameters['blood_image']);
	var BLOOD_INDEX = Number(parameters['blood_index']);
	ImageManager.reserveCharacter(BLOOD_IMAGE);

	var override_createCharacters = Spriteset_Map.prototype.createCharacters;
	Spriteset_Map.prototype.createCharacters = function() {
		override_createCharacters.apply(this,arguments);
	    this.createBloodmask();
	};

	Spriteset_Map.prototype.createBloodmask = function() {
		this._bloodContainer = new BloodContainer();
		this._tilemap.addChild(this._bloodContainer);
		this._bloodContainer.z=2;
	};

	var bloodmapWidth, bloodmapHeight;
	var override_mapLoaded = Scene_Map.prototype.onMapLoaded;
	Scene_Map.prototype.onMapLoaded = function(){
		override_mapLoaded.apply(this,arguments);
		bloodmapWidth=Math.floor($gameMap.width()*$gameMap.tileWidth()/BLOOD_GRID);
		bloodmapHeight=Math.floor($gameMap.height()*$gameMap.tileHeight()/BLOOD_GRID);
		if(!$gameMap.bloodmap){ $gameMap.bloodmap = {}; }
		if(!$gameMap.bloodmap[$gameMap._mapId]){ $gameMap.bloodmap[$gameMap._mapId] = []; }
		readBloodmap();
	};

	function BloodContainer(){
		Sprite.apply(this,arguments);
	}
	BloodContainer.prototype=Object.create(Sprite.prototype);
	BloodContainer.prototype.constructor=BloodContainer;

	BloodContainer.prototype.update=function(){
		this.x = -$gameMap.displayX() * $gameMap.tileWidth();
		this.y = -$gameMap.displayY() * $gameMap.tileHeight();
	};

	function setBloodBit(x,y){
		var bit = y*bloodmapWidth+x;
		var row = Math.floor(bit/32);
		bit %= 32;
		$gameMap.bloodmap[$gameMap._mapId][row]|=1<<bit;
	}

	function getBloodBit(x,y){
		var bit = y*bloodmapWidth+x;
		var row = Math.floor(bit/32);
		bit %= 32;
		return ($gameMap.bloodmap[$gameMap._mapId][row]&(1<<bit))>>bit;
	}

	function readBloodmap(){
		for (var row=0;row<$gameMap.bloodmap[$gameMap._mapId].length;++row){
			if($gameMap.bloodmap[$gameMap._mapId][row]==null){
				$gameMap.bloodmap[$gameMap._mapId][row]=0;
				continue;
			}
			if(!$gameMap.bloodmap[$gameMap._mapId][row]) continue;
		for (var bit=0;bit<32;++bit){
			if(($gameMap.bloodmap[$gameMap._mapId][row]&(1<<bit))>>bit){
				var i = row*32+bit;
				var x = i%bloodmapWidth;
				var y = Math.floor(i/bloodmapWidth);
				drawBloodspot(x,y);
			}
		}}
	}

	function drawBloodspot(x,y){
		var blood = new Sprite();
		blood.bitmap = ImageManager.loadCharacter(BLOOD_IMAGE);
		blood.blendMode=PIXI.BLEND_MODES.MULTIPLY;
		blood.x=x*BLOOD_GRID;
		blood.y=y*BLOOD_GRID+$gameMap.tileHeight()/3;
		var fx, fy, fw, fh;
		if (ImageManager.isBigCharacter(BLOOD_IMAGE)){
			fw=blood.bitmap.width/3;
			fh=blood.bitmap.height/4;
			fx=0;
			fy=0;
		}else{
			fw=blood.bitmap.width/12;
			fh=blood.bitmap.height/8;
			fx=BLOOD_INDEX%4*fw*3;
			fy=Math.floor(BLOOD_INDEX/4)*fh*4;
		}
		bloodRandom.seed=y*1000+x;
		fx+=Math.floor(bloodRandom()*3)*fw;
		fy+=Math.floor(bloodRandom()*4)*fh;
		blood.x+=bloodRandom()*BLOOD_GRID-BLOOD_GRID/2;
		blood.y+=bloodRandom()*BLOOD_GRID-BLOOD_GRID/2;
		blood.setFrame(fx,fy,fw,fh);
		bloodContainer = SceneManager._scene._spriteset._bloodContainer;
		bloodContainer.addChild(blood);
	}
	
	function bloodRandom(){
		bloodRandom.seed=(bloodRandom.seed * 9301 + 49297) % 233280;
		return bloodRandom.seed / 233280;
	}
	bloodRandom.seed=0;

	Game_CharacterBase.prototype.bleed = function(seconds) {
		var now = Date.now();
		var new_time = now+seconds*1000;
		if(this._bleed_time>new_time){ return; }
		this._bleed_time=new_time;
	};

	var override_characterUpdate = Game_CharacterBase.prototype.update;
	Game_CharacterBase.prototype.update = function() {
		override_characterUpdate.apply(this,arguments);
		if (this._bleed_time>Date.now()){
			bleed_on_tile(this._realX,this._realY);
		}
	};

	window.bleed_on_tile = function(x,y){
		x*=$gameMap.tileWidth();
		y*=$gameMap.tileHeight();
		bleed_on_pixel(x,y);
	};

	window.bleed_on_pixel = function(x,y){
		x=Math.floor(x/BLOOD_GRID);
		y=Math.floor(y/BLOOD_GRID);
		if (getBloodBit(x,y)){ return; }
		drawBloodspot(x,y);
		setBloodBit(x,y);
	};

	var override_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		override_pluginCommand.apply(this,arguments);
		if (command.toLowerCase()!=='bleed'){ return; }
		if(Number(args[1])){
			$gameMap.event(args[1]).bleed(Number(args[0]));
		}else{
			$gamePlayer.bleed(Number(args[0]));
		}
		
	};


})();
