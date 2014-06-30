/* const
 ********/
var	SCREEN_RUNNING	= 0,
	SCREEN_DONE		= 1,
	SCREEN_EXIT		= 2;

(function() {
	/* local
	 ********/
	var seq = 0,
		wait = 0;

	/* global
	 *********/
	Screen.xrick = function(timer) {
	
		if (seq == 0) {
			Sysvid.clear();
	//		draw_img(IMG_SPLASH);
			Game.rects = [Draw.SCREENRECT];
			seq = 1;
		}
		
		switch (seq) {
			case 1:
				if (wait++ > 0x2) {
					Syssnd.play("WAV_BULLET", 1);
					seq = 2;
					wait = 0;
				}
				break;
	
			case 2:  /* wait */
				if (wait++ > 0x20) {
					seq = 99;
					wait = 0;
				}
				break;
		}
	
		if (Control.status & CONTROL_EXIT) { /* check for exit request */
			return SCREEN_EXIT;
		}

		if (seq == 99) {  /* we're done */
			Sysvid.clear();
			Sysvid.setGamePalette();
			seq = 0;
			return SCREEN_DONE;
		}

		return SCREEN_RUNNING;
	}

/* EOF */
})();
