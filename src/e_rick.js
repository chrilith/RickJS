import { _U8 } from "./c";
import { E_RICK_ENT, E_RICK_STCRAWL, E_RICK_STTST, E_RICK_STRST,
				 E_RICK_STSTOP, E_RICK_STSHOOT, E_RICK_STZOMBIE, E_RICK_STCLIMB,
				 E_RICK_STJUMP, E_RICK_STSET, E_RICK_STDEAD} from "../include/e_rick";
import { u_envtest } from "./util";
import { MAP_EFLG_VERT, MAP_EFLG_SOLID, MAP_EFLG_SPAD,
				 MAP_EFLG_WAYUP, MAP_EFLG_LETHAL, MAP_EFLG_CLIMB } from "../include/maps";
import { CONTROL_DOWN, CONTROL_LEFT, CONTROL_RIGHT, CONTROL_UP,
				 CONTROL_FIRE } from "../include/control";
import { LEFT, RIGHT, WAV_CRAWL, WAV_DIE, WAV_JUMP, WAV_PAD,
				 WAV_STICK, WAV_WALK } from "../include/game";
import { control } from "./control";
import { game } from "./game";
import { syssnd_play } from "./syssnd";
import { ent } from "../include/ents";
import { e_rick } from "../include/e_rick";
import { E_BULLET_ENT } from "../include/e_bullet";
import { E_BOMB_ENT } from "../include/e_bomb";
import { e_bullet_init } from "./e_bullet";
import { e_bomb_init } from "./e_bomb";

/*
 * public vars
 */
// See include/e_rick.js

/*
 * local vars
 */
let scrawl;

let trigger = false;

let offsx;
let ylow;
let offsy;

let seq;

let save_crawl;
let save_x, save_y;


/*
 * Box test
 *
 * ASM 113E (based on)
 *
 * e: entity to test against (corresponds to SI in asm code -- here DI
 *    is assumed to point to rick).
 * ret: TRUE/intersect, FALSE/not.
 */
export function
e_rick_boxtest(e)
{
	/*
	 * rick: x+0x05 to x+0x11, y+[0x08 if rick's crawling] to y+0x14
	 * entity: x to x+w, y to y+h
	 */

	if (E_RICK_ENT().x + 0x11 < ent.ents[e].x ||
		E_RICK_ENT().x + 0x05 > ent.ents[e].x + ent.ents[e].w ||
		E_RICK_ENT().y + 0x14 < ent.ents[e].y ||
		E_RICK_ENT().y + (E_RICK_STTST(E_RICK_STCRAWL) ? 0x08 : 0x00) > ent.ents[e].y + ent.ents[e].h - 1)
		return false;
	else
		return true;
}




/*
 * Go zombie
 *
 * ASM 1851
 */
export function
e_rick_gozombie()
{
//#ifdef ENABLE_CHEATS
	if (game.cheat2) return;
//#endif

	/* already zombie? */
	if (E_RICK_STTST(E_RICK_STZOMBIE)) return;

//#ifdef ENABLE_SOUND
	syssnd_play(WAV_DIE, 1);
//#endif

	E_RICK_STSET(E_RICK_STZOMBIE);
	offsy = -0x0400;	// UPGRADE: set to 0x03000 to match ST?
	offsx = (E_RICK_ENT().x > 0x80 ? -3 : +3);
	ylow = 0;
	E_RICK_ENT().front = true;
}


/*
 * Action sub-function for e_rick when zombie
 *
 * ASM 17DC
 */
function
e_rick_z_action()
{
	let i;

	/* sprite */
	E_RICK_ENT().sprite = (E_RICK_ENT().x & 0x04) ? 0x1A : 0x19;

	/* x */
	E_RICK_ENT().x += offsx;

	/* y */
	i = (E_RICK_ENT().y << 8) + offsy + ylow;
	E_RICK_ENT().y = i >> 8;
	offsy += 0x80;
	ylow = _U8(i);

	/* dead when out of screen */
	if (E_RICK_ENT().y < 0 || E_RICK_ENT().y > 0x0140)
		E_RICK_STSET(E_RICK_STDEAD);
}


/*
 * Action sub-function for e_rick.
 *
 * ASM 13BE
 */
export function
e_rick_action2()
{
	let env0, env1;
	let x, y;
	let i;
	let tmp;

	E_RICK_STRST(E_RICK_STSTOP|E_RICK_STSHOOT);

	/* if zombie, run dedicated function and return */
	if (E_RICK_STTST(E_RICK_STZOMBIE)) {
		e_rick_z_action();
		return;
	}

	/* climbing? */
	if (E_RICK_STTST(E_RICK_STCLIMB)) {
		goto_climbing();
		return;
	}

	/*
	* NOT CLIMBING
	*/
	E_RICK_STRST(E_RICK_STJUMP);
	/* calc y */
	i = (E_RICK_ENT().y << 8) + offsy + ylow;
	y = i >> 8;
	/* test environment */
	tmp = u_envtest(E_RICK_ENT().x, y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
	env0 = tmp.rc0;
	env1 = tmp.rc1;
/* stand up, if possible */
	if (E_RICK_STTST(E_RICK_STCRAWL) && !env0)
		E_RICK_STRST(E_RICK_STCRAWL);
	/* can move vertically? */
	if (env1 & (offsy < 0 ?
					MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD :
					MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
		goto_vert_not();
		return;
	}

	/*
	* VERTICAL MOVE
	*/
	E_RICK_STSET(E_RICK_STJUMP);
	/* killed? */
	if (env1 & MAP_EFLG_LETHAL) {
		e_rick_gozombie();
		return;
	}
	/* save */
	E_RICK_ENT().y = y;
	ylow = _U8(i);
	/* climb? */
	if ((env1 & MAP_EFLG_CLIMB) &&
			(control.status & (CONTROL_UP|CONTROL_DOWN))) {
		offsy = 0x0100;
		E_RICK_STSET(E_RICK_STCLIMB);
		return;
	}
	/* fall */
	offsy += 0x0080;
	if (offsy > 0x0800) {
		offsy = 0x0800;
		ylow = 0;
	}

	/*
	* HORIZONTAL MOVE
	*/
	goto_horiz();
	function goto_horiz() {
		/* should move? */
		if (!(control.status & (CONTROL_LEFT|CONTROL_RIGHT))) {
			seq = 2; /* no: reset seq and return */
			return;
		}
		if (control.status & CONTROL_LEFT) {  /* move left */
			x = E_RICK_ENT().x - 2;
			game.dir = LEFT;
			if (x < 0) {  /* prev submap */
				game.chsm = true;
				E_RICK_ENT().x = 0xe2;
				return;
			}
		} else {  /* move right */
			x = E_RICK_ENT().x + 2;
			game.dir = RIGHT;
			if (x >= 0xe8) {  /* next submap */
				game.chsm = true;
				E_RICK_ENT().x = 0x04;
				return;
			}
		}

		/* still within this map: test environment */
		tmp = u_envtest(x, E_RICK_ENT().y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;

		/* save x-position if it is possible to move */
		if (!(env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
			E_RICK_ENT().x = x;
			if (env1 & MAP_EFLG_LETHAL) e_rick_gozombie();
		}

	}
	/* end */
	return;

		/*
   * NO VERTICAL MOVE
   */
	function goto_vert_not() {
		if (offsy < 0) {
			/* not climbing + trying to go _up_ not possible -> hit the roof */
			E_RICK_STSET(E_RICK_STJUMP);  /* fall back to the ground */
			E_RICK_ENT().y &= 0xF8;
			offsy = 0;
			ylow = 0;
			goto_horiz();
			return;
		}
		/* else: not climbing + trying to go _down_ not possible -> standing */
		/* align to ground */
		E_RICK_ENT().y &= 0xF8;
		E_RICK_ENT().y |= 0x03;
		ylow = 0;

		/* standing on a super pad? */
		if ((env1 & MAP_EFLG_SPAD) && offsy >= 0X0200) {
			offsy = (control.status & CONTROL_UP) ? 0xf800 : 0x00fe - offsy;
//#ifdef ENABLE_SOUND
			syssnd_play(WAV_PAD, 1);
//#endif
			goto_horiz();
			return;
		}

		offsy = 0x0100;  /* reset*/

		/* standing. firing ? */
		if (scrawl || !(control.status & CONTROL_FIRE)) {
			goto_firing_not();
			return;
		}

		/*
		* FIRING
		*/
		if (control.status & (CONTROL_LEFT|CONTROL_RIGHT)) {  /* stop */
			if (control.status & CONTROL_RIGHT)
			{
				game.dir = RIGHT;
				e_rick.stop_x = E_RICK_ENT().x + 0x17;
			} else {
				game.dir = LEFT;
				e_rick.stop_x = E_RICK_ENT().x;
			}
			e_rick.stop_y = E_RICK_ENT().y + 0x000E;
			E_RICK_STSET(E_RICK_STSTOP);
			return;
		}

		if (control.status === (CONTROL_FIRE|CONTROL_UP)) {  /* bullet */
			E_RICK_STSET(E_RICK_STSHOOT);
			/* not an automatic gun: shoot once only */
			if (trigger)
				return;
			else
				trigger = true;
			/* already a bullet in the air ... that's enough */
			if (E_BULLET_ENT().n)
				return;
			/* else use a bullet, if any available */
			if (!game.bullets)
				return;
//#ifdef ENABLE_CHEATS
			if (!game.cheat1)
				game.bullets--;
//#endif
			/* initialize bullet */
			e_bullet_init(E_RICK_ENT().x, E_RICK_ENT().y);
			return;
		}

		trigger = false; /* not shooting means trigger is released */
		seq = 0; /* reset */

		if (control.status === (CONTROL_FIRE|CONTROL_DOWN)) {  /* bomb */
			/* already a bomb ticking ... that's enough */
			if (E_BOMB_ENT().n)
				return;
			/* else use a bomb, if any available */
			if (!game.bombs)
				return;
//#ifdef ENABLE_CHEATS
			if (!game.cheat1)
				game.bombs--;
//#endif
			/* initialize bomb */
			e_bomb_init(E_RICK_ENT().x, E_RICK_ENT().y);
			return;
		}

		return;
	}
  /*
   * NOT FIRING
   */
	function goto_firing_not() {
		if (control.status & CONTROL_UP) {  /* jump or climb */
			if (env1 & MAP_EFLG_CLIMB) {  /* climb */
				E_RICK_STSET(E_RICK_STCLIMB);
				return;
			}
			offsy = -0x0580;  /* jump */
			ylow = 0;
	//#ifdef ENABLE_SOUND
			syssnd_play(WAV_JUMP, 1);
	//#endif
			goto_horiz();
			return;
		}
		if (control.status & CONTROL_DOWN) {  /* crawl or climb */
			if ((env1 & MAP_EFLG_VERT) &&  /* can go down */
				!(control.status & (CONTROL_LEFT|CONTROL_RIGHT)) &&  /* + not moving horizontaly */
				(E_RICK_ENT().x & 0x1f) < 0x0a) {  /* + aligned -> climb */

				E_RICK_ENT().x &= 0xf0;
				E_RICK_ENT().x |= 0x04;
				E_RICK_STSET(E_RICK_STCLIMB);
			}
			else {  /* crawl */
				E_RICK_STSET(E_RICK_STCRAWL);
				goto_horiz();
				return;
			}
		}
		goto_horiz();
		return;
	}
 /*
	* CLIMBING
	*/
	function goto_climbing() {
		/* should move? */
		if (!(control.status & (CONTROL_UP|CONTROL_DOWN|CONTROL_LEFT|CONTROL_RIGHT))) {
			seq = 0; /* no: reset seq and return */
			return;
		}

		if (control.status & (CONTROL_UP|CONTROL_DOWN)) {
			/* up-down: calc new y and test environment */
			y = E_RICK_ENT().y + ((control.status & CONTROL_UP) ? -0x02 : 0x02);
			tmp = u_envtest(E_RICK_ENT().x, y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;
			if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP) &&
					!(control.status & CONTROL_UP)) {
				/* FIXME what? */
				E_RICK_STRST(E_RICK_STCLIMB);
				return;
			}
			if (!(env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) ||
					(env1 & MAP_EFLG_WAYUP)) {
				/* ok to move, save */
				E_RICK_ENT().y = y;
				if (env1 & MAP_EFLG_LETHAL) {
					e_rick_gozombie();
					return;
				}
				if (!(env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB))) {
					/* reached end of climb zone */
					offsy = (control.status & CONTROL_UP) ? -0x0300 : 0x0100;
//#ifdef ENABLE_SOUND
					if (control.status & CONTROL_UP)
						syssnd_play(WAV_JUMP, 1);
//#endif
					E_RICK_STRST(E_RICK_STCLIMB);
					return;
				}
			}
		}
		if (control.status & (CONTROL_LEFT|CONTROL_RIGHT)) {
			/* left-right: calc new x and test environment */
			if (control.status & CONTROL_LEFT) {
				x = E_RICK_ENT().x - 0x02;
				if (x < 0) {  /* (i.e. negative) prev submap */
					game.chsm = true;
					/*6dbd = 0x00;*/
					E_RICK_ENT().x = 0xe2;
					return;
				}
			}
			else {
				x = E_RICK_ENT().x + 0x02;
				if (x >= 0xe8) {  /* next submap */
					game.chsm = true;
					/*6dbd = 0x01;*/
					E_RICK_ENT().x = 0x04;
					return;
      	}
    	}
			tmp = u_envtest(x, E_RICK_ENT().y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;
			if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD)) return;
			E_RICK_ENT().x = x;
			if (env1 & MAP_EFLG_LETHAL) {
				e_rick_gozombie();
				return;
			}

			if (env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB)) return;
			E_RICK_STRST(E_RICK_STCLIMB);
			if (control.status & CONTROL_UP)
				offsy = -0x0300;
  	}
	}
}


/*
 * Action function for e_rick
 *
 * ASM 12CA
 */
let stopped = false;	// static
export function e_rick_action(_UNUSED_e)
{
//	static U8 stopped = FALSE;  /* is this the most elegant way? */

	e_rick_action2();

	scrawl = E_RICK_STTST(E_RICK_STCRAWL);

	if (E_RICK_STTST(E_RICK_STZOMBIE))
		return;

	/*
	 * set sprite
	 */

	if (E_RICK_STTST(E_RICK_STSTOP)) {
		E_RICK_ENT().sprite = (game.dir ? 0x17 : 0x0B);
//#ifdef ENABLE_SOUND
		if (!stopped)
		{
			syssnd_play(WAV_STICK, 1);
			stopped = true;
		}
//#endif
		return;
	}

	stopped = false;

	if (E_RICK_STTST(E_RICK_STSHOOT)) {
		E_RICK_ENT().sprite = (game.dir ? 0x16 : 0x0A);
		return;
	}

	if (E_RICK_STTST(E_RICK_STCLIMB)) {
		E_RICK_ENT().sprite = (((E_RICK_ENT().x ^ E_RICK_ENT().y) & 0x04) ? 0x18 : 0x0c);
//#ifdef ENABLE_SOUND
		seq = (seq + 1) & 0x03;
		if (seq === 0) syssnd_play(WAV_WALK, 1);
//#endif
		return;
	}

	if (E_RICK_STTST(E_RICK_STCRAWL))
	{
		E_RICK_ENT().sprite = (game.dir ? 0x13 : 0x07);
		if (E_RICK_ENT().x & 0x04) E_RICK_ENT().sprite++;
//#ifdef ENABLE_SOUND
		seq = (seq + 1) & 0x03;
		if (seq === 0) syssnd_play(WAV_CRAWL, 1);
//#endif
		return;
	}

	if (E_RICK_STTST(E_RICK_STJUMP))
	{
		E_RICK_ENT().sprite = (game.dir ? 0x15 : 0x06);
		return;
	}

	seq++;

	if (seq >= 0x14)
	{
//#ifdef ENABLE_SOUND
		syssnd_play(WAV_WALK, 1);
//#endif
		seq = 0x04;
	}
//#ifdef ENABLE_SOUND
  else
  if (seq == 0x0C)
    syssnd_play(WAV_WALK, 1);
//#endif

  E_RICK_ENT().sprite = (seq >> 2) + 1 + (game.dir ? 0x0c : 0x00);
}


/*
 * Save status
 *
 * ASM part of 0x0BBB
 */
export function e_rick_save() {
	save_x = E_RICK_ENT().x;
	save_y = E_RICK_ENT().y;
	save_crawl = E_RICK_STTST(E_RICK_STCRAWL);
	/* FIXME
	 * save_C0 = E_RICK_ENT().b0C;
	 * plus some 6DBC stuff?
	 */
}


/*
 * Restore status
 *
 * ASM part of 0x0BDC
 */
export function e_rick_restore()
{
	E_RICK_ENT().x = save_x;
	E_RICK_ENT().y = save_y;
	E_RICK_ENT().front = false;

	// UPGARDED
	// FIXME: should we reset other states?
	E_RICK_STRST(E_RICK_STCLIMB);
	// Face the correct direction
	game.dir = (save_x < 0x80) ? RIGHT : LEFT;
	// END UPGRADED

	if (save_crawl)
		E_RICK_STSET(E_RICK_STCRAWL);
	else
		E_RICK_STRST(E_RICK_STCRAWL);
	/* FIXME
	 * E_RICK_ENT().b0C = save_C0;
	 * plus some 6DBC stuff?
	 */
}




/* eof */
