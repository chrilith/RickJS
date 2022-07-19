
/*
 * FIXME this is because the same structure is used
 * for all entities. Need to replace this w/ an inheritance
 * solution.
 */
//#define cnt c1

import { GAME_BOMBS_INIT, GAME_BULLETS_INIT, WAV_BOX,
				 WAV_EXPLODE } from "../include/game";
import { ent, ENT_LETHAL } from "../include/ents";
import { e_rick_boxtest } from "./e_rick";
import { MAP_MARK_NACT } from "../include/maps";
import { E_RICK_STSTOP, E_RICK_STTST } from "../include/e_rick";
import { u_fboxtest } from "./util";
import { E_BULLET_ENT } from "../include/e_bullet";
import { e_bomb, e_bomb_hit } from "./e_bomb";
import { game } from "./game";
import { map_marks } from "./dat_maps";
import { e_bullet } from "./e_bullet";
import { syssnd_play } from "./syssnd";

/*
 * Constants
 */
const SEQ_INIT = 0x0A;

/*
 * Entity action
 *
 * ASM 245A
 */
export function
e_box_action(e)
{
	const sp = [0x24, 0x25, 0x26, 0x27, 0x28];  /* explosion sprites sequence */

	if (ent.ents[e].n & ENT_LETHAL) {
		/*
		 * box is lethal i.e. exploding
		 * play sprites sequence then stop
		 */
		ent.ents[e].sprite = sp[ent.ents[e].cnt >> 1];
		if (--ent.ents[e].cnt == 0) {
			ent.ents[e].n = 0;
			map_marks[ent.ents[e].mark].ent |= MAP_MARK_NACT;
		}
	} else {
		/*
		 * not lethal: check to see if triggered
		 */
		if (e_rick_boxtest(e)) {
			/* rick: collect bombs or bullets and stop */
//#ifdef ENABLE_SOUND
			syssnd_play(WAV_BOX, 1);
//#endif
			if (ent.ents[e].n == 0x10)
				game.bombs = GAME_BOMBS_INIT;
			else  /* 0x11 */
				game.bullets = GAME_BULLETS_INIT;
			ent.ents[e].n = 0;
			map_marks[ent.ents[e].mark].ent |= MAP_MARK_NACT;
		}
		else if (E_RICK_STTST(E_RICK_STSTOP) &&
				u_fboxtest(e, e_rick.stop_x, e_rick.stop_y)) {
			/* rick's stick: explode */
			explode(e);
		}
		else if (E_BULLET_ENT().n && u_fboxtest(e, e_bullet.xc, e_bullet.yc)) {
			/* bullet: explode (and stop bullet) */
			E_BULLET_ENT().n = 0;
			explode(e);
		}
		else if (e_bomb.lethal && e_bomb_hit(e)) {
			/* bomb: explode */
			explode(e);
		}
	}
}


/*
 * Explode when
 */
function explode(e)
{
	ent.ents[e].cnt = SEQ_INIT;
	ent.ents[e].n |= ENT_LETHAL;
//#ifdef ENABLE_SOUND
	syssnd_play(WAV_EXPLODE, 1);
//#endif
}

/* eof */


