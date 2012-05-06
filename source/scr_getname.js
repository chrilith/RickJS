/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/scr_getname.c
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

/*
 * constants
 */
var TILE_POINTER = 0x3A,	// \072
	TILE_CURSOR = 0x3B,		// \073
	TOPLEFT_X = 116,
	TOPLEFT_Y = 64,
	NAMEPOS_X = 120,
	NAMEPOS_Y = 160,
	AUTOREPEAT_TMOUT = 100;

(function() {
	/*
	 * local vars
	 */
	var seq = 0,
		x, y, p,
		name = [];

	/*
	 * Get name
	 *
	 * return: 0 while running, 1 when finished.
	 */
	var tm = 0;	// static
	Screen.getname = function() {
		var i, j;
	
		if (seq == 0) {
			/* figure out if this is a high score */
			if (Game.score < Game.hscores[7].score) {
				return SCREEN_DONE;
			}
			
			/* prepare */
			Draw.tilesBank = 0;
			for (i = 0; i < 10; i++) {
				name[i] = '@'.charCodeAt(0);
			}
			x = y = p = 0;
			Game.rects = [Draw.SCREENRECT];
			seq = 1;
		}
	
		switch (seq) {
	
			case 1:  /* prepare screen */
				Sysvid.clear();
				Draw.setfb(76, 40);
				Draw.tilesListImm("PLEASE@ENTER@YOUR@NAME\xFE");
				for (i = 0; i < 6; i++) {
					for (j = 0; j < 4; j++) {
						Draw.setfb(TOPLEFT_X + i * 8 * 2, TOPLEFT_Y + j * 8 * 2);
						Draw.tile('A'.charCodeAt(0) + i + j * 6);
					}
				}
				Draw.setfb(TOPLEFT_X, TOPLEFT_Y + 64);
				Draw.tilesListImm("Y@Z@.@@@\x3C\xFB\xFC\xFD\xFE");
				name_draw();
				pointer_show(true);
				seq = 2;
				break;
	
			case 2:  /* wait for key pressed */
				if (Control.status & CONTROL_FIRE) {
					seq = 3;
				}
				if (Control.status & CONTROL_UP) {
					if (y > 0) {
						pointer_show(false);
						y--;
						pointer_show(true);
						tm = Sys.gettime();
					}
					seq = 4;
				}
				if (Control.status & CONTROL_DOWN) {
					if (y < 4) {
						pointer_show(false);
						y++;
						pointer_show(true);
						tm = Sys.gettime();
					}
					seq = 5;
				}
				if (Control.status & CONTROL_LEFT) {
					if (x > 0) {
						pointer_show(false);
						x--;
						pointer_show(true);
						tm = Sys.gettime();
					}
					seq = 6;
				}
				if (Control.status & CONTROL_RIGHT) {
					if (x < 5) {
						pointer_show(false);
						x++;
						pointer_show(true);
						tm = Sys.gettime();
					}
					seq = 7;
				}
				if (seq == 2) {
					//sys_sleep(50);
				}
				break;
	
			case 3:  /* wait for FIRE released */
				if (!(Control.status & CONTROL_FIRE)) {
					if (x == 5 && y == 4) {  /* end */
						i = 0;
						while (Game.score < Game.hscores[i].score) {
							i++;
						}
						j = 7;
						while (j > i) {
							Game.hscores[j].score = Game.hscores[j - 1].score;
//							for (x = 0; x < 10; x++) {
								Game.hscores[j].name = Game.hscores[j - 1].name;
//							}
							j--;
						}
						Game.hscores[i].score = Game.score;
						var tmp = "";
						for (x = 0; x < 10; x++) {
							tmp += String.fromCharCode(name[x]);
						}
						Game.hscores[i].name = tmp;
						seq = 99;
					} else {
						name_update();
						name_draw();
						seq = 2;
					}
				} else {
				//	sys_sleep(50);
				}
				break;
	
			case 4:  /* wait for UP released */
				if (!(Control.status & CONTROL_UP) ||
						Sys.gettime() - tm > AUTOREPEAT_TMOUT) {
					seq = 2;
				} else {
				//	sys_sleep(50);
				}
				break;
	
			case 5:  /* wait for DOWN released */
				if (!(Control.status & CONTROL_DOWN) ||
						Sys.gettime() - tm > AUTOREPEAT_TMOUT) {
					seq = 2;
				} else {
				//	sys_sleep(50);
				}
				break;
	
			case 6:  /* wait for LEFT released */
				if (!(Control.status & CONTROL_LEFT) ||
						Sys.gettime() - tm > AUTOREPEAT_TMOUT) {
					seq = 2;
				} else {
				//	sys_sleep(50);
				}
				break;
	
			case 7:  /* wait for RIGHT released */
				if (!(Control.status & CONTROL_RIGHT) ||
						Sys.gettime() - tm > AUTOREPEAT_TMOUT) {
					seq = 2;
				} else {
				//	sys_sleep(50);
				}
				break;
		}
	
		if (Control.status & CONTROL_EXIT) {  /* check for exit request */
			return SCREEN_EXIT;
		}
	
		if (seq == 99) {  /* seq 99, we're done */
			Sysvid.clear();
			seq = 0;
			return SCREEN_DONE;
		} else {
			return SCREEN_RUNNING;
		}
	}

	
	function pointer_show(show) {
		Draw.setfb(TOPLEFT_X + x * 8 * 2, TOPLEFT_Y + y * 8 * 2 + 8);
		Draw.tile((show == true)?TILE_POINTER:'@'.charCodeAt(0));
	}

	function name_update() {
		var i;
	
		i = x + y * 6;
		if (i < 26 && p < 10) {
			name[p++] = 'A'.charCodeAt(0) + i;
		}
		if (i == 26 && p < 10) {
			name[p++] = '.'.charCodeAt(0);
		}
		if (i == 27 && p < 10) {
			name[p++] = '@'.charCodeAt(0);
		}
		if (i == 28 && p > 0) {
			p--;
		}
	}
	
	
	function name_draw() {
		var i;
		
		Draw.setfb(NAMEPOS_X, NAMEPOS_Y);
	
		for (i = 0; i < p; i++) {
			Draw.tile(name[i]);
		}
		for (i = p; i < 10; i++) {
			Draw.tile(TILE_CURSOR);
		}
	
		Draw.setfb(NAMEPOS_X, NAMEPOS_Y + 8);
		for (i = 0; i < 10; i++) {
			Draw.tile('@'.charCodeAt(0));
		}
		Draw.setfb(NAMEPOS_X + 8 * (p < 9 ? p : 9), NAMEPOS_Y + 8);
		Draw.tile(TILE_POINTER);
	}	
	
/* EOF */
})();
