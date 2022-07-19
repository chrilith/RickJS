/*
 * FIXME this is because the same structure is used
 * for all entities. Need to replace this w/ an inheritance
 * solution.
 */
//#define cnt c1

/*
 * Constants
 */
var SEQ_INIT = 0x0A;

(function() {

	var sp = [ 0x24, 0x25, 0x26, 0x27, 0x28 ];  /* explosion sprites sequence */

	/*
	 * Entity action
	 *
	 * ASM 245A
	 */
	EBox.action = function(e) {

		if (Ent.ents[e].n & ENT_LETHAL) {
			/*
			 * box is lethal i.e. exploding
			 * play sprites sequence then stop
			 */
			Ent.ents[e].sprite = sp[Ent.ents[e].cnt >> 1];
			if (--Ent.ents[e].cnt == 0) {
				Ent.ents[e].n = 0;
				World.marks[Ent.ents[e].mark].ent |= MAP_MARK_NACT;
			}
		} else {
			/*
			 * not lethal: check to see if triggered
			 */
			if (ERick.boxtest(e)) {
				/* rick: collect bombs or bullets and stop */
				Syssnd.play("WAV_BOX", 1);

				if (Ent.ents[e].n == 0x10) {
					Game.bombs = GAME_BOMBS_INIT;
				} else {  /* 0x11 */
					Game.bullets = GAME_BULLETS_INIT;
				}
				Ent.ents[e].n = 0;
				World.marks[Ent.ents[e].mark].ent |= MAP_MARK_NACT;

			} else if (E_RICK_STTST(E_RICK_STSTOP) &&
					U.fboxtest(e, ERick.stop_x, ERick.stop_y)) {
				/* rick's stick: explode */
				explode(e);

			} else if (E_BULLET_ENT.n && U.fboxtest(e, EBullet.xc, EBullet.yc)) {
				/* bullet: explode (and stop bullet) */
				E_BULLET_ENT.n = 0;
				explode(e);

			} else if (EBomb.lethal && EBomb.hit(e)) {
				/* bomb: explode */
				explode(e);
			}
		}
	}

	/*
	 * Explode when
	 */
	function explode(e) {
		Ent.ents[e].cnt = SEQ_INIT;
		Ent.ents[e].n |= ENT_LETHAL;
		Syssnd.play("WAV_EXPLODE", 1);
	}


/* EOF */
})();
