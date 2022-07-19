var E_BOMB_NO = 3,
	E_BOMB_ENT, // Defined later in ents.js
	E_BOMB_TICKER = (0x2D);

(function() {

	/*
	 * public vars (for performance reasons)
	 */
	EBomb.lethal = 0;
	EBomb.xc = 0;
	EBomb.yc = 0;

	/*
	 * private vars
	 */
	var e_bomb_ticker;

	/*
	 * Bomb hit test
	 *
	 * ASM 11CD
	 * returns: TRUE/hit, FALSE/not
	 */
	EBomb.hit = function(e) {
		if (Ent.ents[e].x > (E_BOMB_ENT.x >= 0xE0 ? 0xFF : E_BOMB_ENT.x + 0x20)) {
				return false;
		}
		if (Ent.ents[e].x + Ent.ents[e].w < (E_BOMB_ENT.x > 0x04 ? E_BOMB_ENT.x - 0x04 : 0)) {
				return false;
		}
		if (Ent.ents[e].y > (E_BOMB_ENT.y + 0x1D)) {
				return false;
		}
		if (Ent.ents[e].y + Ent.ents[e].h < (E_BOMB_ENT.y > 0x0004 ? E_BOMB_ENT.y - 0x0004 : 0)) {
				return false;
		}
		return true;
	}

	/*
	 * Initialize bomb
	 */
	EBomb.init = function(x, y) {
		E_BOMB_ENT.n = 0x03;
		E_BOMB_ENT.x = x;
		E_BOMB_ENT.y = y;
		e_bomb_ticker = E_BOMB_TICKER;
		EBomb.lethal = false;

		/*
		 * Atari ST dynamite sprites are not centered the
		 * way IBM PC sprites were ... need to adjust things a little bit
		 */
		E_BOMB_ENT.x += 4;
		E_BOMB_ENT.y += 5;

	}

	/*
	 * Entity action
	 *
	 * ASM 18CA
	 */
	EBomb.action = function(/*UNUSED(U8 e)*/) {
		/* tick */
		e_bomb_ticker--;

		if (e_bomb_ticker == 0) {
			/*
			 * end: deactivate
			 */
			E_BOMB_ENT.n = 0;
			EBomb.lethal = false;

		} else if (e_bomb_ticker >= 0x0A) {
			/*
			 * ticking
			 */
			if ((e_bomb_ticker & 0x03) == 0x02) {
				Syssnd.play("WAV_BOMBSHHT", 1);
			}

			/* ST bomb sprites sequence is longer */
			if (e_bomb_ticker < 40)
				E_BOMB_ENT.sprite = 0x99 + 19 - (e_bomb_ticker >> 1);
			else

			E_BOMB_ENT.sprite = (e_bomb_ticker & 0x01) ? 0x23 : 0x22;

		} else if (e_bomb_ticker == 0x09) {
			/*
			 * explode
			 */
			Syssnd.play("WAV_EXPLODE", 1);
			/* See above: fixing alignment */
			E_BOMB_ENT.x -= 4;
			E_BOMB_ENT.y -= 5;
			E_BOMB_ENT.sprite = 0xa8 + 4 - (e_bomb_ticker >> 1);

			EBomb.xc = E_BOMB_ENT.x + 0x0C;
			EBomb.yc = E_BOMB_ENT.y + 0x000A;
			EBomb.lethal = true;
			if (EBomb.hit(E_RICK_NO)) {
				ERick.gozombie();
			}
		} else {
			/*
			 * exploding
			 */
			E_BOMB_ENT.sprite = 0xa8 + 4 - (e_bomb_ticker >> 1);

			/* exploding, hence lethal */
			if (EBomb.hit(E_RICK_NO)) {
				ERick.gozombie();
			}
		}
	}

/* EOF */
})();
