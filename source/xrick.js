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
		var nb = 0,
			complete = function() {

			if (++nb == 29) {
				Tiles.data = [];
				Tiles.data[0] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 0 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				Tiles.data[1] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 1 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				Tiles.data[2] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 2 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				
				Sprites.data = new G.SpriteSheet(Data.getItem("sprites_data"), null, SPRITES_NBR_SPRITES, 32, 21);

				XRick.main();
			}
		}
		
		Data = new G.BitmapLibrary(complete);
		Snd = new G.SoundPool(complete);

		Data.loadItem("pic_splash", "data/title.png");
		Data.loadItem("pic_haf", "data/haf.png");
		Data.loadItem("pic_congrat", "data/congrat.png");
		Data.loadItem("tiles_data", "data/tiles.png");
		Data.loadItem("sprites_data", "data/sprites.png");


		Snd.loadItem("WAV_GAMEOVER", "sound/gameover.mp3");
		Snd.loadItem("WAV_SBONUS2", "sound/sbonus2.mp3");
		Snd.loadItem("WAV_BULLET", "sound/bullet.mp3");
		Snd.loadItem("WAV_BOMBSHHT", "sound/bombshht.mp3");
		Snd.loadItem("WAV_EXPLODE", "sound/explode.mp3");
		Snd.loadItem("WAV_STICK", "sound/stick.mp3");
		Snd.loadItem("WAV_WALK", "sound/walk.mp3");
		Snd.loadItem("WAV_CRAWL", "sound/crawl.mp3");
		Snd.loadItem("WAV_JUMP", "sound/jump.mp3");
		Snd.loadItem("WAV_PAD", "sound/pad.mp3");
		Snd.loadItem("WAV_BOX", "sound/box.mp3");
		Snd.loadItem("WAV_BONUS", "sound/bonus.mp3");
		Snd.loadItem("WAV_SBONUS1", "sound/sbonus1.mp3");
		Snd.loadItem("WAV_DIE", "sound/die.mp3");
		Snd.loadItem("WAV_ENTITY0", "sound/ent0.mp3");
		Snd.loadItem("WAV_ENTITY1", "sound/ent1.mp3");
		Snd.loadItem("WAV_ENTITY2", "sound/ent2.mp3");
		Snd.loadItem("WAV_ENTITY3", "sound/ent3.mp3");
		Snd.loadItem("WAV_ENTITY4", "sound/ent4.mp3");
		Snd.loadItem("WAV_ENTITY5", "sound/ent5.mp3");
		Snd.loadItem("WAV_ENTITY6", "sound/ent6.mp3");
		Snd.loadItem("WAV_ENTITY7", "sound/ent7.mp3");
		Snd.loadItem("WAV_ENTITY8", "sound/ent8.mp3");

		Snd.loadItem("WAV_TUNE0", "sound/tune0.mp3");
		Snd.loadItem("WAV_TUNE1", "sound/tune1.mp3");
		Snd.loadItem("WAV_TUNE2", "sound/tune2.mp3");
		Snd.loadItem("WAV_TUNE3", "sound/tune3.mp3");
		Snd.loadItem("WAV_TUNE4", "sound/tune4.mp3");
		Snd.loadItem("WAV_TUNE5", "sound/tune5.mp3");

		Sysarg.args_map = 0;
		Sysarg.args_submap = 0;
	}
	
};

Gamalto.init(XRick.init);
