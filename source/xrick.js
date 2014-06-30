var

Sys = {},
Game = {},
Screen = {},
Sysvid = {},
Map = {},
Draw = {},
Tiles = {},
Control = {},
Sysevt = {},
Sysarg = {},
Syssnd = {} ,
Sprites = {},
ERick = {},
Ent = {},
EBullet = {},
EBomb = {},
EThem = {},
EBox = {},
EBonus = {},
ESbonus = {},
U = {},
Rects = {},
Scroll = {},

Data,
XRick = {
	
	main: function() {
		Sys.init();
		Game.run();
	},
	
	init: function() {
		var nb = 0;
		
		Data = new G.BitmapLibrary();
		Snd = new G.SoundPool();

		Data.pushItem("pic_splash", "data/title.png");
		Data.pushItem("pic_haf", "data/haf.png");
		Data.pushItem("pic_congrat", "data/congrat.png");
		Data.pushItem("tiles_data", "data/tiles.png");
		Data.pushItem("sprites_data", "data/sprites.png");
		
		Data.load().then(function() {
			var pool = G.SoundPool; 
			var ext = pool.isSupported(pool.MP3) ? ".mp3" :
						pool.isSupported(pool.WAVE) ? ".wav" : ".ogg";
console.log("data ok next", ext);
			
			Snd.pushItem("WAV_GAMEOVER", "sound/gameover" + ext);
			Snd.pushItem("WAV_SBONUS2", "sound/sbonus2" + ext);
			Snd.pushItem("WAV_BULLET", "sound/bullet" + ext);
			Snd.pushItem("WAV_BOMBSHHT", "sound/bombshht" + ext);
			Snd.pushItem("WAV_EXPLODE", "sound/explode" + ext);
			Snd.pushItem("WAV_STICK", "sound/stick" + ext);
			Snd.pushItem("WAV_WALK", "sound/walk" + ext);
			Snd.pushItem("WAV_CRAWL", "sound/crawl" + ext);
			Snd.pushItem("WAV_JUMP", "sound/jump" + ext);
			Snd.pushItem("WAV_PAD", "sound/pad" + ext);
			Snd.pushItem("WAV_BOX", "sound/box" + ext);
			Snd.pushItem("WAV_BONUS", "sound/bonus" + ext);
			Snd.pushItem("WAV_SBONUS1", "sound/sbonus1" + ext);
			Snd.pushItem("WAV_DIE", "sound/die" + ext);
			Snd.pushItem("WAV_ENTITY0", "sound/ent0" + ext);
			Snd.pushItem("WAV_ENTITY1", "sound/ent1" + ext);
			Snd.pushItem("WAV_ENTITY2", "sound/ent2" + ext);
			Snd.pushItem("WAV_ENTITY3", "sound/ent3" + ext);
			Snd.pushItem("WAV_ENTITY4", "sound/ent4" + ext);
			Snd.pushItem("WAV_ENTITY5", "sound/ent5" + ext);
			Snd.pushItem("WAV_ENTITY6", "sound/ent6" + ext);
			Snd.pushItem("WAV_ENTITY7", "sound/ent7" + ext);
			Snd.pushItem("WAV_ENTITY8", "sound/ent8" + ext);
	
			Snd.pushItem("WAV_TUNE0", "sound/tune0" + ext);
			Snd.pushItem("WAV_TUNE1", "sound/tune1" + ext);
			Snd.pushItem("WAV_TUNE2", "sound/tune2" + ext);
			Snd.pushItem("WAV_TUNE3", "sound/tune3" + ext);
			Snd.pushItem("WAV_TUNE4", "sound/tune4" + ext);
			Snd.pushItem("WAV_TUNE5", "sound/tune5" + ext);
			
			return Snd.load();

		}, function(e) {
			console.log("error", e);
		}).then(function() {

			Snd.getItem("WAV_STICK").priority = -1;
			Snd.getItem("WAV_WALK").priority = -1;
			Snd.getItem("WAV_CRAWL").priority = -1;
			Snd.getItem("WAV_JUMP").priority = -1;


			var size = new G.Size(8, 8);
			Tiles.data = [];
			Tiles.data[0] = new G.TileSet(Data.getItem("tiles_data"), size).addSections(256, new G.Rect(0, 0 * 8 * 256, 8, 8 * 256));
			Tiles.data[1] = new G.TileSet(Data.getItem("tiles_data"), size).addSections(256, new G.Rect(0, 1 * 8 * 256, 8, 8 * 256));
			Tiles.data[2] = new G.TileSet(Data.getItem("tiles_data"), size).addSections(256, new G.Rect(0, 2 * 8 * 256, 8, 8 * 256));
			
			Sprites.data = new G.SpriteSheet(Data.getItem("sprites_data")).addSections(SPRITES_NBR_SPRITES, null, new G.Size(32, 21));

			XRick.main();
		}, function(e) {
			console.log("error2", e);
		});
				
		Sysarg.args_map = 0;
		Sysarg.args_submap = 0;
	}
	
};

Gamalto.init(XRick.init);
