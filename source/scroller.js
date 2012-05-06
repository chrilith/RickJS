/* const
 ********/
var SCROLL_RUNNING = 1,
	SCROLL_DONE = 0,

	SCROLL_PERIOD = 24;


(function() {
	/* local
	 ********/
	var period;
	
	/* global
	 *********/
	/*
	 * Scroll up
	 *
	 */
	var static_n1 = 0;
	Scroll.up = function() {
		var i, j;
	
		/* last call: restore */
		if (static_n1 == 8) {
			static_n1 = 0;
			Game.period = period;
			return SCROLL_DONE;
		}
	
		/* first call: prepare */
		if (static_n1 == 0) {
			period = Game.period;
			Game.period = SCROLL_PERIOD;
		}
	
		/* translate map */
		for (i = MAP_ROW_SCRTOP; i < MAP_ROW_HBBOT; i++) {
			for (j = 0x00; j < 0x20; j++) {
				Map.map[i][j] = Map.map[i + 1][j];
			}
		}
	
		/* translate entities */
		for (i = 0; Ent.ents[i].n != 0xFF; i++) {
			if (Ent.ents[i].n) {
				Ent.ents[i].ysave -= 8;
				Ent.ents[i].trig_y -= 8;
				Ent.ents[i].y -= 8;
				if (Ent.ents[i].y & 0x8000) {  /* map coord. from 0x0000 to 0x0140 */
	/*				IFDEBUG_SCROLLER(
					sys_printf("xrick/scroller: entity %#04X is gone\n", i);
					);*/
					Ent.ents[i].n = 0;
				}
			}
		}
	
		/* display */
		Draw.map();
		Ent.draw();
		Draw.drawStatus();
		Map.frow++;
	
		/* loop */
		if (static_n1++ == 7) {
			/* activate visible entities */
			Ent.actvis(Map.frow + MAP_ROW_HBTOP, Map.frow + MAP_ROW_HBBOT);
			
			/* prepare map */
			Map.expand();
			
			/* display */
			Draw.map();
			Ent.draw();
			Draw.drawStatus();
		}
	
		Game.rects = [Draw.SCREENRECT];
	
		return SCROLL_RUNNING;
	}
	
	/*
	 * Scroll down
	 *
	 */
	var static_n2 = 0;
	Scroll.down =function() {
	  var i, j;
	
		/* last call: restore */
		if (static_n2 == 8) {
			static_n2 = 0;
			Game.period = period;
			return SCROLL_DONE;
		}
	
		/* first call: prepare */
		if (static_n2 == 0) {
			period = Game.period;
			Game.period = SCROLL_PERIOD;
		}
	
		/* translate map */
		for (i = MAP_ROW_SCRBOT; i > MAP_ROW_HTTOP; i--) {
			for (j = 0x00; j < 0x20; j++) {
				Map.map[i][j] = Map.map[i - 1][j];
			}
		}
		
		/* translate entities */
		for (i = 0; Ent.ents[i].n != 0xFF; i++) {
			if (Ent.ents[i].n) {
				Ent.ents[i].ysave += 8;
				Ent.ents[i].trig_y += 8;
				Ent.ents[i].y += 8;
				if (Ent.ents[i].y > 0x0140) {  /* map coord. from 0x0000 to 0x0140 */
		/*			IFDEBUG_SCROLLER(
						sys_printf("xrick/scroller: entity %#04X is gone\n", i);
					);*/
					Ent.ents[i].n = 0;
				}
			}
		}
	
		/* display */
		Draw.map();
		Ent.draw();
		Draw.drawStatus();
		Map.frow--;
	
		/* loop */
		if (static_n2++ == 7) {
			/* activate visible entities */
			Ent.actvis(Map.frow + MAP_ROW_HTTOP, Map.frow + MAP_ROW_HTBOT);
		
			/* prepare map */
			Map.expand();
		
			/* display */
			Draw.map();
			Ent.draw();
			Draw.drawStatus();
		}
		
		Game.rects = [Draw.SCREENRECT];
	
		return SCROLL_RUNNING;
	}

/* EOF */
})();
