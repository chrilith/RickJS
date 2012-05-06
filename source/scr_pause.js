(function() {

	/*
	 * Display the pause indicator
	 */
	Screen.pause = function(pause) {
		if (pause == true) {
			Draw.tilesBank = 0;
			Draw.tllst = Screen.pausedtxt.split("");
			Draw.setfb(120, 80);
			Draw.tilesList();
		} else {
			Draw.map();
			Ent.draw();
			Draw.drawStatus();
		}
		Game.rects = [Draw.SCREENRECT];
	}

/* EOF */
})();
