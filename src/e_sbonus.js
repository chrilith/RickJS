import { game } from "./game";
import { ent, ENT_XRICK } from "../include/ents";
import { u_trigbox } from "./util";
import { syssnd_play } from "./syssnd";
import { WAV_SBONUS1, WAV_SBONUS2 } from "../include/game";
import { map_marks } from "./dat_maps";
import { MAP_MARK_NACT } from "../include/maps";

/*
 * public vars
 */
export const e_sbonus = {
	counting: false,
	counter: 0,
	bonus: 0
};


/*
 * Entity action / start counting
 *
 * ASM 2182
 */
export function
e_sbonus_start(e)
{
	ent.ents[e].sprite = 0; /* invisible */
	if (u_trigbox(e, ENT_XRICK().x + 0x0C, ENT_XRICK().y + 0x0A)) {
		/* rick is within trigger box */
		ent.ents[e].n = 0;
		e_sbonus.counting = true;  /* 6DD5 */
		e_sbonus.counter = 0x1e;  /* 6DDB */
		e_sbonus.bonus = 2000;    /* 291A-291D */
//#ifdef ENABLE_SOUND
		syssnd_play(WAV_SBONUS1, 1);
//#endif
	}
}


/*
 * Entity action / stop counting
 *
 * ASM 2143
 */
export function
e_sbonus_stop(e)
{
	ent.ents[e].sprite = 0; /* invisible */

	if (!e_sbonus.counting)
		return;

	if (u_trigbox(e, ENT_XRICK().x + 0x0C, ENT_XRICK().y + 0x0A)) {
		/* rick is within trigger box */
		e_sbonus.counting = false;  /* stop counting */
		ent.ents[e].n = 0;  /* deactivate entity */
		game.score += e_sbonus.bonus;  /* add bonus to score */
//#ifdef ENABLE_SOUND
		syssnd_play(WAV_SBONUS2, 1);
//#endif
		/* make sure the entity won't be activated again */
		map_marks[ent.ents[e].mark].ent |= MAP_MARK_NACT;
	}
	else {
		/* keep counting */
		if (--e_sbonus.counter == 0) {
			e_sbonus.counter = 0x1e;
			if (e_sbonus.bonus) e_sbonus.bonus--;
		}
	}
}

/* eof */


