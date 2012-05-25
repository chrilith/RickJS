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

			if (++nb == 5) {
				Tiles.data = [];
				Tiles.data[0] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 0 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				Tiles.data[1] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 1 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				Tiles.data[2] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 2 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				
				Sprites.data = new G.SpriteSheet(Data.getItem("sprites_data"), null, SPRITES_NBR_SPRITES, 32, 21);

				XRick.main();
			}
		}
		
		Data = new G.BitmapLibrary(complete);
		Snd = new G.SoundPool(new Function);

		Data.loadItem("pic_splash", "data/title.png");
		Data.loadItem("pic_haf", "data/haf.png");
		Data.loadItem("pic_congrat", "data/congrat.png");
		Data.loadItem("tiles_data", "data/tiles.png");
		Data.loadItem("sprites_data", "data/sprites.png");

		Snd.loadItem("WAV_GAMEOVER", "sound/gameover.wav");
		Snd.loadItem("WAV_SBONUS2", "sound/sbonus2.wav");
		Snd.loadItem("WAV_BULLET", "sound/bullet.wav");
		Snd.loadItem("WAV_BOMBSHHT", "sound/bombshht.wav");
		Snd.loadItem("WAV_EXPLODE", "sound/explode.wav");
		Snd.loadItem("WAV_STICK", "sound/stick.wav");
		Snd.loadItem("WAV_WALK", "sound/walk.wav");
		Snd.loadItem("WAV_CRAWL", "sound/crawl.wav");
		Snd.loadItem("WAV_JUMP", "sound/jump.wav");
		Snd.loadItem("WAV_PAD", "sound/pad.wav");
		Snd.loadItem("WAV_BOX", "sound/box.wav");
		Snd.loadItem("WAV_BONUS", "sound/bonus.wav");
		Snd.loadItem("WAV_SBONUS1", "sound/sbonus1.wav");
		Snd.loadItem("WAV_DIE", "sound/die.wav");
		Snd.loadItem("WAV_ENTITY0", "sound/ent0.wav");
		Snd.loadItem("WAV_ENTITY1", "sound/ent1.wav");
		Snd.loadItem("WAV_ENTITY2", "sound/ent2.wav");
		Snd.loadItem("WAV_ENTITY3", "sound/ent3.wav");
		Snd.loadItem("WAV_ENTITY4", "sound/ent4.wav");
		Snd.loadItem("WAV_ENTITY5", "sound/ent5.wav");
		Snd.loadItem("WAV_ENTITY6", "sound/ent6.wav");
		Snd.loadItem("WAV_ENTITY7", "sound/ent7.wav");
		Snd.loadItem("WAV_ENTITY8", "sound/ent8.wav");

		Snd.loadItem("WAV_TUNE0", "sound/tune0.wav");
		Snd.loadItem("WAV_TUNE1", "sound/tune1.wav");
		Snd.loadItem("WAV_TUNE2", "sound/tune2.wav");
		Snd.loadItem("WAV_TUNE3", "sound/tune3.wav");
		Snd.loadItem("WAV_TUNE4", "sound/tune4.wav");
		Snd.loadItem("WAV_TUNE5", "sound/tune5.wav");

		Sysarg.args_map = 0;
		Sysarg.args_submap = 0;
	}
	
};

Gamalto.init(XRick.init);
