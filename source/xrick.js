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
		Data = new G.BitmapLibrary(function() {
			if (++nb == 4) {
				Tiles.data = [];
				Tiles.data[0] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 0 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				Tiles.data[1] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 1 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				Tiles.data[2] = new G.TileSet(Data.getItem("tiles_data"), new G.Rect(0, 2 * 8 * 256, 8, 8 * 256), 256, 8, 8);
				
				Sprites.data = new G.SpriteSheet(Data.getItem("sprites_data"), null, SPRITES_NBR_SPRITES, 32, 21);

				XRick.main();
			}
		});

		Data.loadItem("pic_splash", "data/title.png");
		Data.loadItem("pic_haf", "data/haf.png");
		Data.loadItem("tiles_data", "data/tiles.png");
		Data.loadItem("sprites_data", "data/sprites.png");
		
		Sysarg.args_map = 0;
		Sysarg.args_submap = 0;
	}
	
};

Gamalto.init(XRick.init);
