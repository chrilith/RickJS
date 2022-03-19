/*
 * counters positions (pixels, screen)
 */
var DRAW_STATUS_BULLETS_X = 0x68,
	DRAW_STATUS_BOMBS_X = 0xA8,

	DRAW_STATUS_SCORE_X = 0x20,
	DRAW_STATUS_LIVES_X = 0xF0,
	DRAW_STATUS_Y = 0,

/* map coordinates of the screen */
	DRAW_XYMAP_SCRLEFT = (-0x0020),
	DRAW_XYMAP_SCRTOP = (0x0040),

/* map coordinates of the top of the hidden bottom of the map */
	DRAW_XYMAP_HBTOP = (0x0100);

(function() {
	/*
	 * public vars
	 */
	Draw.tllst = 0;    /* pointer to tiles list */
	Draw.tilesBank = 0; /* tile number offset */

	Draw.STATUSRECT = new G.Rect(DRAW_STATUS_SCORE_X, DRAW_STATUS_Y,
									DRAW_STATUS_LIVES_X + 6 * 8 - DRAW_STATUS_SCORE_X, 8);

	Draw.SCREENRECT = new G.Rect(0, 0, SYSVID_WIDTH, SYSVID_HEIGHT);

	/*
	 * private vars
	 */
	var fb = new G.Vector();

	/*
	 * Set the frame buffer pointer
	 *
	 * x, y: position (pixels, screen)
	 */
	Draw.setfb = function(x, y) {
		fb.x = x;
		fb.y = y;
	}

	/*
	 * Clip to map screen
	 *
	 * x, y: position (pixels, map) CHANGED clipped
	 * width, height: dimension CHANGED clipped
	 * return: TRUE if fully clipped, FALSE if still (at least partly) visible
	 */
	Draw.clipms = function(x, y, width, height) {
		if (x < 0) {
			if (x + width < 0) {
				return { returns: true, x: x, y: y, width: width, height: height };
			} else {
				width += x;
				x = 0;
			}
		} else {
			if (x > 0x0100) {
				return { returns: true, x: x, y: y, width: width, height: height };
			} else if (x + width > 0x0100) {
				width = 0x0100 - x;
			}
		}
	
		if (y < DRAW_XYMAP_SCRTOP) {
			if ((y + height) < DRAW_XYMAP_SCRTOP) {
				return { returns: true, x: x, y: y, width: width, height: height };
			} else {
				height += y - DRAW_XYMAP_SCRTOP;
				y = DRAW_XYMAP_SCRTOP;
			}
		} else {
			if (y >= DRAW_XYMAP_HBTOP) {
				return { returns: true, x: x, y: y, width: width, height: height };
			} else if (y + height > DRAW_XYMAP_HBTOP) {
				height = DRAW_XYMAP_HBTOP - y;
			}
		}
	
		return { returns: false, x: x, y: y, width: width, height: height };
	}

	/*
	 * Draw a list of tiles onto the frame buffer
	 * start at position indicated by fb ; at the end of each (sub)list,
	 * perform a "carriage return + line feed" i.e. go back to the initial
	 * position then go down one tile row (8 pixels)
	 *
	 * ASM 1e33
	 * fb: CHANGED (see above)
	 * draw_tllst: CHANGED points to the element following 0xfe/0xff end code
	 */
	Draw.tilesList = function() {
		var t = fb.clone();
		while (Draw.tilesSubList() != 0xFE) {  /* draw sub-list */
			t.y += 8;  /* go down one tile i.e. 8 lines */
			fb = t.clone();
		}		
	}	
	
	/*
	 * Draw a list of tiles onto the frame buffer -- same as draw_tilesList,
	 * but accept an immediate string as parameter. Note that the string needs
	 * to be properly terminated with 0xfe (\376) and 0xff (\377) chars.
	 */
	Draw.tilesListImm = function(list) {
		Draw.tllst = (typeof list == "array") ? list : list.split(""); // FIXME? 
		Draw.tilesList();
	}
	
	/*
	 * Draw a sub-list of tiles onto the frame buffer
	 * start at position indicated by fb ; leave fb pointing to the next
	 * tile to the right of the last tile drawn
	 *
	 * ASM 1e41
	 * fpb: CHANGED (see above)
	 * draw_tllst: CHANGED points to the element following 0xfe/0xff end code
	 * returns: end code (0xfe : end of list ; 0xff : end of sub-list)
	 */
	Draw.tilesSubList = function() {
		var i = Draw.tllst.shift().charCodeAt(0);

		while (i != 0xFF && i != 0xFE) {  /* while not end */
			Draw.tile(i);  /* draw tile */
			i = Draw.tllst.shift().charCodeAt(0);
		}

		return i;
	}

	/*
	 * Draw a tile
	 * at position indicated by fb ; leave fb pointing to the next tile
	 * to the right of the tile drawn
	 *
	 * ASM 1e6c
	 * tlnbr: tile number
	 * draw_filter: CGA colors filter
	 * fb: CHANGED (see above)
	 */
	Draw.tile = function(tileNumber) {
		Tiles.data[Draw.tilesBank].draw(Sysvid.fb.renderer, fb.x, fb.y, tileNumber);
//		Sysvid.fb.renderer.fillRect(new G.Rect(fb.x, fb.y, 8, 8), new G.Color(Math.random() * 255 | 0, 0, 0));
		fb.x += 8;  /* next tile */
	}

	/*
	 * Draw a sprite
	 *
	 * ASM 1a09
	 * nbr: sprite number
	 * x, y: sprite position (pixels, screen)
	 * fb: CHANGED
	 */
	Draw.sprite = function(number, x, y) {	
		Draw.setfb(x, y);
		Sprites.data.draw(Sysvid.fb.renderer, fb.x, fb.y, number);
	}
		
	/*
	 * Draw a sprite
	 *
	 * NOTE re-using original ST graphics format
	 */
	Draw.sprite2 = function(number, x, y, front) {
	  var d = 0;   /* sprite data */
	  var x0, y0;  /* clipped x, y */
	  var w, h;    /* width, height */
	  var g,       /* sprite data offset*/
		r, c,      /* row, column */
		i,         /* frame buffer shifter */
		im;        /* tile flag shifter */
	  var flg, tmp;/* tile flag */
	
	  x0 = x;
	  y0 = y;
	  w = 0x20;
	  h = 0x15;
	
	  tmp = Draw.clipms(x0, y0, w, h);
	  if (tmp.returns) {  /* return if not visible */
		return;
	  }
	  x0 = tmp.x;
	  y0 = tmp.y;
	  w = tmp.width;
	  h = tmp.height;
	
	  g = 0;
	  
	  Sysvid.fb.enableClipping(x0 - DRAW_XYMAP_SCRLEFT, y0 - DRAW_XYMAP_SCRTOP + 8, w, h);
	  Draw.setfb(x - DRAW_XYMAP_SCRLEFT, y - DRAW_XYMAP_SCRTOP + 8);
	  Draw.sprite(number, fb.x, fb.y);
	  Sysvid.fb.disableClipping();
	/*
	  for (r = 0; r < 0x15; r++) {
		if (r >= h || y + r < y0) continue;
	
		i = 0x1f;
		im = x - (x & 0xfff8);
		flg = World.eflg[World.map[(y + r) >> 3][(x + 0x1f)>> 3]];
	
	#define LOOP(N, C0, C1) \
		d = sprites_data[number][g + N]; \
		for (c = C0; c >= C1; c--, i--, d >>= 4, im--) { \
		  if (im == 0) { \
		flg = map_eflg[map_map[(y + r) >> 3][(x + c) >> 3]]; \
		im = 8; \
		  } \
		  if (!front && (flg & MAP_EFLG_FGND)) continue; \
		  if (c >= w || x + c < x0) continue; \
		  if (d & 0x0F) fb[i] = (fb[i] & 0xF0) | (d & 0x0F); \
		}
	
		LOOP(3, 0x1f, 0x18);
		LOOP(2, 0x17, 0x10);
		LOOP(1, 0x0f, 0x08);
		LOOP(0, 0x07, 0x00);
	
	#undef LOOP
		fb += SYSVID_WIDTH;
		g += 4;
	  }
	*/
	}
	
	/*
	 * Redraw the map behind a sprite
	 * align to tile column and row, and clip
	 *
	 * x, y: sprite position (pixels, map).
	 */
	Draw.spriteBackground = function(x, y) {
		var r, c;
		var rmax, cmax;
		var xmap, ymap;	// S16
		var xs, ys, tmp;
	
		/* aligne to column and row, prepare map coordinate, and clip */
		xmap = G.Convert.toSInt16(x & 0xFFF8);
		ymap = G.Convert.toSInt16(y & 0xFFF8);
		cmax = (x - xmap == 0 ? 0x20 : 0x28);  /* width, 4 tl cols, 8 pix each */
		rmax = (y & 0x04) ? 0x20 : 0x18;  /* height, 3 or 4 tile rows */

		tmp = Draw.clipms(xmap, ymap, cmax, rmax);
		if (tmp.returns) {  /* don't draw if fully clipped */
		  return;
		}
		xmap = tmp.x;
		ymap = tmp.y;
		cmax = tmp.width;
		rmax = tmp.height;
	
		/* get back to screen */
		xs = xmap - DRAW_XYMAP_SCRLEFT;
		ys = ymap - DRAW_XYMAP_SCRTOP;
		xmap >>= 3;
		ymap >>= 3;
		cmax >>= 3;
		rmax >>= 3;

		/* draw */
		for (r = 0; r < rmax; r++) {  /* for each row */
			Draw.setfb(xs, 8 + ys + r * 8);
			for (c = 0; c < cmax; c++) {  /* for each column */
				Draw.tile(World.map[ymap + r][xmap + c]);
			}
		}
	}

	/*
	 * Draw entire map screen background tiles onto frame buffer.
	 *
	 * ASM 0af5, 0a54
	 */
	Draw.map = function() {
		var i, j;
		
		Draw.tilesBank = World.tilesBank;
	
		for (i = 0; i < 0x18; i++) {  /* 0x18 rows */
			Draw.setfb(0x20, 8 + (i * 8));
			for (j = 0; j < 0x20; j++)  /* 0x20 tiles per row */
				Draw.tile(World.map[i + 8][j]);
		}
	}
	/*
	 * Draw status indicators
	 *
	 * ASM 0309
	 */
	Draw.drawStatus = function() {
		var i;
//		var sv;
//		var s = [0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0xfe];
		
		Draw.tilesBank = 0;
		
//		for (i = 5, sv = Game.score; i >= 0; i--) {
//			s[i] = 0x30 + (sv % 10 | 0);
//			sv /= 10;
//		}
		Draw.tllst = ("00000" + Game.score + "\xFE").substr(-7).split("");
		
		Draw.setfb(DRAW_STATUS_SCORE_X, DRAW_STATUS_Y);
		Draw.tilesList();

		Draw.setfb(DRAW_STATUS_BULLETS_X, DRAW_STATUS_Y);
		for (i = 0; i < Game.bullets; i++) {
			Draw.tile(TILES_BULLET);
		}
	
		Draw.setfb(DRAW_STATUS_BOMBS_X, DRAW_STATUS_Y);
		for (i = 0; i < Game.bombs; i++) {
			Draw.tile(TILES_BOMB);
		}
		
		Draw.setfb(DRAW_STATUS_LIVES_X, DRAW_STATUS_Y);
		for (i = 0; i < Game.lives; i++) {
			Draw.tile(TILES_RICK);
		}
	}

	/*
	 * Clear status indicators
	 */
	Draw.clearStatus = function() {
		var i;
		
		Draw.tilesBank = 0;
		Draw.setfb(DRAW_STATUS_SCORE_X, DRAW_STATUS_Y);
		for (i = 0; i < DRAW_STATUS_LIVES_X/8 + 6 - DRAW_STATUS_SCORE_X/8; i++) {
			Draw.tile('@');
		}
	}

	/*
	 * Draw a picture
	 */
	Draw.pic = function(x, y, w, h, pic) {
		Sysvid.fb.renderer.drawBitmapSection(pic, x, y, new G.Rect(0, 0, w, h));
	}

/* EOF */
})();
