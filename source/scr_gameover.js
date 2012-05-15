(function() {

	/*
	 * Display the game over screen
	 *
	 * return: SCREEN_RUNNING, SCREEN_DONE, SCREEN_EXIT
	 */
	var seq = 0;	/* static */
	var period = 0;	/* static */
	var tm = 0;		/* static */

	Screen.gameover = function() {
	
		if (seq == 0) {
			Draw.tilesBank = 0;
			seq = 1;
			period = Game.period; /* save period, */
			Game.period = 50;     /* and use our own */
			Game.setmusic("WAV_GAMEOVER", 1);
		}
	
		switch (seq) {
			case 1:  /* display banner */
				Sysvid.clear();
				tm = Date.now();
		
				Draw.tllst = Screen.gameovertxt.split("");
				Draw.setfb(120, 80);
				Draw.tilesList();
				Draw.drawStatus();
		
				Game.rects = [Draw.SCREENRECT];
				seq = 2;
				break;
		
			case 2:  /* wait for key pressed */
				if (Control.status & CONTROL_FIRE) {
					seq = 3;
				} else if (Date.now() - tm > SCREEN_TIMEOUT) {
					seq = 4;
				}
		//		else {
		//			sys_sleep(50);
		//		}
				break;
		
			case 3:  /* wait for key released */
				if (!(Control.status & CONTROL_FIRE)) {
					seq = 4;
				}
		//		else {
		//			sys_sleep(50);
		//		}
				break;
		}
	
		if (Control.status & CONTROL_EXIT)  /* check for exit request */
			return SCREEN_EXIT;
	
		if (seq == 4) {  /* we're done */
			Sysvid.clear();
			seq = 0;
			Game.period = period;
			return SCREEN_DONE;
		}
	
		return SCREEN_RUNNING;
	}

/* EOF */
})();
