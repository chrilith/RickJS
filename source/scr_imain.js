/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/scr_imain.c
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

(function() {
	/*
	 * static
	 */
	var seq = 0,
		seen = 0,
		first = true,
		period = 0,
		tm = 0,
		i , s = [],
		fading;

	/*
	 * Main introduction
	 *
	 * return: SCREEN_RUNNING, SCREEN_DONE, SCREEN_EXIT
	 */
	Screen.introMain = function(timer) {
		if (seq == 0) {
			Draw.tilesBank = 0;
			if (first == true) {
				seq = 1;
			} else {
				seq = 4;
			}
			period = Game.period;
			Game.period = 50;
			Game.rects = [Draw.SCREENRECT];
//			game_setmusic("sounds/tune5.wav", -1);
		}
		
		 switch (seq) {
			case 1:  /* display Rick Dangerous title and Core Design copyright */
				if (fading) {
					break;
				}
				Sysvid.clear();
				tm = Sys.gettime();
				Draw.pic(0, 0, 0x140, 0xc8, Data.getItem("pic_splash"));
				seq = 2;

				fading = GE.IN;
				Sysvid.fade_start();
				break;

			case 2:  /* wait for key pressed or timeout */
				if (Control.status & CONTROL_FIRE) {
					seq = 3;
				} else if (Sys.gettime() - tm > SCREEN_TIMEOUT) {
					seen++;
					seq = 4;

					fading = GE.OUT;
					Sysvid.fade_start();
				}
				break;

			case 3:  /* wait for key released */

				if (!(Control.status & CONTROL_FIRE)) {
					if (seen++ == 0)
						seq = 4;
					else
						seq = 7;
				}
				break;

			case 4:  /* dispay hall of fame */
				if (fading) {
					break;
				}
				Sysvid.clear();
				tm = Sys.gettime();

				/* hall of fame title */
				Draw.pic(0, 0, 0x140, 0x20, Data.getItem("pic_haf"));
			
				/* hall of fame content */
				Draw.setfb(56, 40);
			
				for (i = 0; i < 8; i++) {
					var score = ("00" + Game.hscores[i].score).substr(-6);
					Draw.tllst = (score +
								  "@@@====@@@" +
								  Game.hscores[i].name +
								  "\xFF\xFF\xFE").split(""); // \377\377\376
					Draw.tilesList();
				}

				seq = 5;

				fading = GE.IN;
				Sysvid.fade_start();
				break;

			case 5:  /* wait for key pressed or timeout */

				if (Control.status & CONTROL_FIRE) {
					seq = 6;
				} else if (Sys.gettime() - tm > SCREEN_TIMEOUT) {
					seen++;
					seq = 1;

					fading = GE.OUT;
					Sysvid.fade_start();
				}
				break;
				
			case 6:  /* wait for key released */
				if (!(Control.status & CONTROL_FIRE)) {
					if (seen++ == 0) {
						seq = 1;
					} else {
						seq = 7;
					}
				}
				break;	
		}
		
		if (fading) {
			var a;
			Game.rects = [Draw.SCREENRECT];
			if (! (a= Sysvid.fader.update(timer, fading))) {
				fading = Sysvid.fade_end();
				// Loop directly to prevent flipping
				Screen.introMain(timer);
			}
		}

		if (Control.status & CONTROL_EXIT) {  /* check for exit request */
			return SCREEN_EXIT;
		}

		if (seq == 7) {  /* we're done */
			Sysvid.clear();
			seq = 0;
			seen = 0;
			first = false;
			Game.period = period;
			return SCREEN_DONE;
		} else {
			return SCREEN_RUNNING;
		}
	}

/* EOF */
})();
