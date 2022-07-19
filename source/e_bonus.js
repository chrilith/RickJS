(function() {

	/*
	 * Entity action
	 *
	 * ASM 242C
	 */
	EBonus.action = function(e) {
	//#define seq c1

		if (Ent.ents[e].seq == 0) {
			if (ERick.boxtest(e)) {
				Game.score += 500;
				Syssnd.play("WAV_BONUS", 1);
				World.marks[Ent.ents[e].mark].ent |= MAP_MARK_NACT;
				Ent.ents[e].seq = 1;
				Ent.ents[e].sprite = 0xad;
				Ent.ents[e].front = true;
				Ent.ents[e].y -= 0x08;
			}

		} else if (Ent.ents[e].seq > 0 && Ent.ents[e].seq < 10) {
			Ent.ents[e].seq++;
			Ent.ents[e].y -= 2;

		} else {
			Ent.ents[e].n = 0;
		}
	}

/* EOF */
})();
