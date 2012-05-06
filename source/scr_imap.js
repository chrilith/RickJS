/* const
 ********/
// ...
var SCREEN_TIMEOUT = 4000;

(function() {
	/* local
	 ********/
	var step,				/* current step */
		count,				/* number of loops for current step */
		run,				/* 1 = run, 0 = no more step */
		flipflop = 0,		/* flipflop for top, bottom, left, right */
		spnum,				/* sprite number */
		spx, spdx,			/* sprite x position and delta */
		spy, spdy,			/* sprite y position and delta */
		spbase, spoffs,		/* base, offset for sprite numbers table */
		seq = 0;			/* anim sequence */

	var anim_rect = new G.Rect(120, 16 + 16, 64, 64); /* anim rectangle */

	/* global
	 *********/
	Screen.introMap = function(timer) {
		switch (seq) {
			case 0:
				Sysvid.clear();
				Draw.tilesBank = 0;
				Draw.tllst = Screen.imaptext[Game.map].split("");

				Draw.setfb(32, 16);		// 32, 0
				Draw.tilesSubList();
				
				Draw.setfb(32, 104);	// 32, 96
				Draw.tilesList();
				
				Game.rects = null;

				init();

				nextstep();
				drawcenter();
				drawtb();
				drawlr();
				drawsprite();
				Draw.drawStatus();
				Control.last = 0;

				Game.rects = [Draw.SCREENRECT];

				//game_setmusic(map_maps[game_map].tune, 1);

				seq = 1;
				break;

			case 1:  /* top and bottom borders */
				drawtb();
				Game.rects = [anim_rect];
				seq = 2;
				break;

			case 2:  /* background and sprite */
				anim();
				drawcenter();
				drawsprite();
				Game.rects = [anim_rect];
				seq = 3;
				break;

			case 3:  /* all borders */
				drawtb();
				drawlr();
				Game.rects = [anim_rect];
				seq = 1;
				break;

			case 4:  /* wait for key release */
				if (!(Control.status & CONTROL_FIRE)) {
					seq = 5;
				} else {
					Sys.sleep(50); /* .5s */
				}
				break;
		}

		if (Control.status & CONTROL_FIRE) {  /* end as soon as key pressed */
			seq = 4;
		}
		
		if (Control.status & CONTROL_EXIT)  /* check for exit request */
			return SCREEN_EXIT;
		
		if (seq == 5) {  /* end as soon as key pressed */
			Sysvid.clear();
			seq = 0;
			return SCREEN_DONE;
		} else {
			return SCREEN_RUNNING;
		}
	}

	/* local
	 ********/

	/*
	 * Display top and bottom borders (0x1B1F)
	 *
	 */
	function drawtb() {
		var i;
		
		flipflop++;
		if (flipflop & 0x01) {
			Draw.setfb(128, 16 + 16);
			for (i = 0; i < 6; i++) {
				Draw.tile(0x40);
			}
			Draw.setfb(128, 72 + 16);
			for (i = 0; i < 6; i++) {
				Draw.tile(0x06);
			}
		} else {
			Draw.setfb(128, 16 + 16);
			for (i = 0; i < 6; i++) {
				Draw.tile(0x05);
			}
			Draw.setfb(128, 72 + 16);
			for (i = 0; i < 6; i++) {
				Draw.tile(0x40);
			}
		}
	}

	/*
	 * Display left and right borders (0x1B7C)
	 *
	 */
	function drawlr() {
	  var i;
	
		if (flipflop & 0x02) {
			for (i = 0; i < 8; i++) {
				Draw.setfb(120, 16 + i * 8 + 16);
				Draw.tile(0x04);
				Draw.setfb(176, 16 + i * 8 + 16);
				Draw.tile(0x04);
			}
		} else {
			for (i = 0; i < 8; i++) {
				Draw.setfb(120, 16 + i * 8 + 16);
				Draw.tile(0x2B);
				Draw.setfb(176, 16 + i * 8 + 16);
				Draw.tile(0x2B);
			}
		}
	}

	/*
	 * Draw the sprite (0x19C6)
	 *
	 */
	function drawsprite() {
		Draw.sprite(spnum, 128 + ((spx << 1) & 0x1C), 24 + (spy << 1) + 16);
	}

	/*
	 * Draw the background (0x1AF1)
	 *
	 */
	function drawcenter() {
		var tn0 = [ 0x07, 0x5B, 0x7F, 0xA3, 0xC7 ],
			i, j, tn = tn0[Game.map];
	
		for (i = 0; i < 6; i++) {
			Draw.setfb(128, (24 + 8 * i) + 16);
			for (j = 0; j < 6; j++) {
				Draw.tile(tn++);
			}
		}
	}
	
	/*
	 * Next Step (0x1A74)
	 *
	 */
	function nextstep() {
		if (Screen.imapsteps[step].count) {
			count = Screen.imapsteps[step].count;
			spdx = Screen.imapsteps[step].dx;
			spdy = Screen.imapsteps[step].dy;
			spbase = Screen.imapsteps[step].base;
			spoffs = 0;
			step++;
		} else {
			run = 0;
		}
	}

	/*
	 * Anim (0x1AA8)
	 *
	 */
	function anim() {
		var i;
		
		if (run) {
			i = Screen.imapsl[spbase + spoffs];
			if (i == 0) {
				spoffs = 0;
				i = Screen.imapsl[spbase];
			}
			spnum = i;
			spoffs++;
			spx += spdx;
			spy += spdy;
			count--;
			if (count == 0) {
				nextstep();
			}
		}
	}

	function init() {
		run = 0; run--;
		step = Screen.imapsofs[Game.map];
		spx = Screen.imapsteps[step].dx;
		spy = Screen.imapsteps[step].dy;
		step++;
		spnum = 0; /* NOTE spnum in [8728] is never initialized ? */
	}

/* EOF */
})();
