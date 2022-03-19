(function() {
	/*
	 * public vars
	 */
	ESbonus.counting = false;
	ESbonus.counter = 0;
	ESbonus.bonus = 0;
	
	/*
	 * Entity action / start counting
	 *
	 * ASM 2182
	 */
	ESbonus.start = function(e) {
		Ent.ents[e].sprite = 0; /* invisible */
		if (U.trigbox(e, ENT_XRICK.x + 0x0C, ENT_XRICK.y + 0x0A)) {
			/* rick is within trigger box */
			Ent.ents[e].n = 0;
			ESbonus.counting = true;  /* 6DD5 */
			ESbonus.counter = 0x1e;  /* 6DDB */
			ESbonus.bonus = 2000;    /* 291A-291D */
			Syssnd.play("WAV_SBONUS1", 1);
		}
	}
	
	/*
	 * Entity action / stop counting
	 *
	 * ASM 2143
	 */
	ESbonus.stop = function(e) {
		Ent.ents[e].sprite = 0; /* invisible */
	
		if (!ESbonus.counting) {
			return;
		}
	
		if (U.trigbox(e, ENT_XRICK.x + 0x0C, ENT_XRICK.y + 0x0A)) {
			/* rick is within trigger box */
			ESbonus.counting = false;  /* stop counting */
			Ent.ents[e].n = 0;  /* deactivate entity */
			Game.score += ESbonus.bonus;  /* add bonus to score */
			Syssnd.play("WAV_SBONUS2", 1);
			/* make sure the entity won't be activated again */
			World.marks[Ent.ents[e].mark].ent |= MAP_MARK_NACT;
		} else {
			/* keep counting */
			if (--ESbonus.counter == 0) {
				ESbonus.counter = 0x1e;
				if (ESbonus.bonus) ESbonus.bonus--;
			}
		}
	}

/* EOF */
})();
