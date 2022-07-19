import { _U16, _U8 } from "./c";
import { ent, ENT_FLG_LETHALI, ENT_FLG_LETHALR, ENT_FLG_ONCE,
				 ENT_FLG_TRIGBOMB, ENT_FLG_TRIGBULLET,
				 ENT_FLG_TRIGRICK, ENT_FLG_TRIGSTOP, ENT_LETHAL } from "../include/ents";
import { E_BULLET_ENT } from "../include/e_bullet";
import { e_bullet } from "./e_bullet";
import { e_bomb, e_bomb_hit } from "./e_bomb";
import { e_rick, E_RICK_ENT, E_RICK_STSTOP, E_RICK_STTST, E_RICK_STZOMBIE } from "../include/e_rick";
import { WAV_DIE, WAV_ENTITY } from "../include/game";
import { MAP_EFLG_CLIMB, MAP_EFLG_LETHAL, MAP_EFLG_SOLID, MAP_EFLG_SPAD,
				 MAP_EFLG_VERT, MAP_EFLG_WAYUP, MAP_MARK_NACT } from "../include/maps";
import { ent_sprseq, ent_mvstep } from "./dat_ents";
import { e_rick_boxtest, e_rick_gozombie } from "./e_rick";
import { syssnd_play } from "./syssnd";
import { u_trigbox, u_envtest, u_boxtest, u_fboxtest } from "./util";
import { game } from "./game";

const TYPE_1A = (0x00);
const TYPE_1B = (0xff);

/*
 * public vars
 */
export const e_them = {
	rndseed: 0
};

/*
 * local vars
 */
let e_them_rndnbr = 0;

/*
 * Check if entity boxtests with a lethal e_them i.e. something lethal
 * in slot 0 and 4 to 8.
 *
 * ASM 122E
 *
 * e: entity slot number.
 * ret: TRUE/boxtests, FALSE/not
 */
export function
u_themtest(e)
{
  let i;

  if ((ent.ents[0].n & ENT_LETHAL) && u_boxtest(e, 0))
    return true;

  for (i = 4; i < 9; i++)
    if ((ent.ents[i].n & ENT_LETHAL) && u_boxtest(e, i))
      return true;

  return false;
}


/*
 * Go zombie
 *
 * ASM 237B
 */
export function
e_them_gozombie(e)
{
//#define offsx c1
  ent.ents[e].n = 0x47;  /* zombie entity */
  ent.ents[e].front = true;
  ent.ents[e].offsy = -0x0400;
//#ifdef ENABLE_SOUND
  syssnd_play(WAV_DIE, 1);
//#endif
  game.score += 50;
  if (ent.ents[e].flags & ENT_FLG_ONCE) {
    /* make sure entity won't be activated again */
    map_marks[ent.ents[e].mark].ent |= MAP_MARK_NACT;
  }
  ent.ents[e].offsx = (ent.ents[e].x >= 0x80 ? -0x02 : 0x02);
//#undef offsx
}


/*
 * Action sub-function for e_them _t1a and _t1b
 *
 * Those two types move horizontally, and fall if they have to.
 * Type 1a moves horizontally over a given distance and then
 * u-turns and repeats; type 1b is more subtle as it does u-turns
 * in order to move horizontally towards rick.
 *
 * ASM 2242
 */
export function
e_them_t1_action2(e, type)
{
//#define offsx c1
//#define step_count c2
  let i;
  let x, y;
  let env0, env1;
	let tmp;

  /* by default, try vertical move. calculate new y */
  i = (ent.ents[e].y << 8) + ent.ents[e].offsy + ent.ents[e].ylow;
  y = i >> 8;

  /* deactivate if outside vertical boundaries */
  /* no need to test zero since e_them _t1a/b don't go up */
  /* FIXME what if they got scrolled out ? */
  if (y > 0x140) {
    ent.ents[e].n = 0;
    return;
  }

  /* test environment */
  tmp = u_envtest(ent.ents[e].x, y, false, env0, env1);
	env0 = tmp.rc0;
	env1 = tmp.rc1;

  if (!(env1 & (MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
    /* vertical move possible: falling */
    if (env1 & MAP_EFLG_LETHAL) {
      /* lethal entities kill e_them */
      e_them_gozombie(e);
      return;
    }
    /* save, cleanup and return */
    ent.ents[e].y = y;
    ent.ents[e].ylow = _U8(i);
    ent.ents[e].offsy += 0x0080;
    if (ent.ents[e].offsy > 0x0800)
      ent.ents[e].offsy = 0x0800;
    return;
  }

  /* vertical move not possible. calculate new sprite */
  ent.ents[e].sprite = ent.ents[e].sprbase
    + ent_sprseq[(ent.ents[e].x & 0x1c) >> 3]
    + (ent.ents[e].offsx < 0 ? 0x03 : 0x00);

  /* reset offsy */
  ent.ents[e].offsy = 0x0080;

  /* align to ground */
  ent.ents[e].y &= 0xfff8;
  ent.ents[e].y |= 0x0003;

  /* latency: if not zero then decrease and return */
  if (ent.ents[e].latency > 0) {
    ent.ents[e].latency--;
    return;
  }

  /* horizontal move. calculate new x */
  if (ent.ents[e].offsx == 0)  /* not supposed to move -> don't */
    return;

  x = ent.ents[e].x + ent.ents[e].offsx;
  if (ent.ents[e].x < 0 || ent.ents[e].x > 0xe8) {
    /*  U-turn and return if reaching horizontal boundaries */
    ent.ents[e].step_count = 0;
    ent.ents[e].offsx = -ent.ents[e].offsx;
    return;
  }

  /* test environment */
  tmp = u_envtest(x, ent.ents[e].y, false, env0, env1);
	env0 = tmp.rc0;
	env1 = tmp.rc1;

  if (env1 & (MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
    /* horizontal move not possible: u-turn and return */
    ent.ents[e].step_count = 0;
    ent.ents[e].offsx = -ent.ents[e].offsx;
    return;
  }

  /* horizontal move possible */
  if (env1 & MAP_EFLG_LETHAL) {
    /* lethal entities kill e_them */
    e_them_gozombie(e);
    return;
  }

  /* save */
  ent.ents[e].x = x;

  /* depending on type, */
  if (type === TYPE_1B) {
    /* set direction to move horizontally towards rick */
    if ((ent.ents[e].x & 0x1e) != 0x10)  /* prevents too frequent u-turns */
      return;
    ent.ents[e].offsx = (ent.ents[e].x < E_RICK_ENT().x) ? 0x02 : -0x02;
    return;
  }
  else {
    /* set direction according to step counter */
    ent.ents[e].step_count++;
    /* FIXME why trig_x (b16) ?? */
    if ((ent.ents[e].trig_x >> 1) > ent.ents[e].step_count)
      return;
  }

  /* type is 1A and step counter reached its limit: u-turn */
  ent.ents[e].step_count = 0;
  ent.ents[e].offsx = -ent.ents[e].offsx;
//#undef offsx
//#undef step_count
}


/*
 * ASM 21CF
 */
export function
e_them_t1_action(e, type)
{
  e_them_t1_action2(e, type);

  /* lethal entities kill them */
  if (u_themtest(e)) {
    e_them_gozombie(e);
    return;
  }

  /* bullet kills them */
  if (E_BULLET_ENT().n &&
      u_fboxtest(e, E_BULLET_ENT().x + (e_bullet.offsx < 0 ? 0 : 0x18),
		 E_BULLET_ENT().y)) {
    E_BULLET_ENT().n = 0;
    e_them_gozombie(e);
    return;
  }

  /* bomb kills them */
  if (e_bomb.lethal && e_bomb_hit(e)) {
    e_them_gozombie(e);
    return;
  }

  /* rick stops them */
  if (E_RICK_STTST(E_RICK_STSTOP) &&
      u_fboxtest(e, e_rick.stop_x, e_rick.stop_y))
    ent.ents[e].latency = 0x14;

  /* they kill rick */
  if (e_rick_boxtest(e))
    e_rick_gozombie();
}


/*
 * Action function for e_them _t1a type (stays within boundaries)
 *
 * ASM 2452
 */
export function
e_them_t1a_action(e)
{
  e_them_t1_action(e, TYPE_1A);
}


/*
 * Action function for e_them _t1b type (runs for rick)
 *
 * ASM 21CA
 */
export function
e_them_t1b_action(e)
{
  e_them_t1_action(e, TYPE_1B);
}


/*
 * Action function for e_them _z (zombie) type
 *
 * ASM 23B8
 */
export function
e_them_z_action(e)
{
//#define offsx c1
  let i;

  /* calc new sprite */
  ent.ents[e].sprite = ent.ents[e].sprbase
    + ((ent.ents[e].x & 0x04) ? 0x07 : 0x06);

  /* calc new y */
  i = (ent.ents[e].y << 8) + ent.ents[e].offsy + ent.ents[e].ylow;

  /* deactivate if out of vertical boundaries */
  if (ent.ents[e].y < 0 || ent.ents[e].y > 0x0140) {
    ent.ents[e].n = 0;
    return;
  }

  /* save */
  ent.ents[e].offsy += 0x0080;
  ent.ents[e].ylow = _U8(i);
  ent.ents[e].y = i >> 8;

  /* calc new x */
  ent.ents[e].x += ent.ents[e].offsx;

  /* must stay within horizontal boundaries */
  if (ent.ents[e].x < 0)
    ent.ents[e].x = 0;
  if (ent.ents[e].x > 0xe8)
    ent.ents[e].x = 0xe8;
//#undef offsx
}


/*
 * Action sub-function for e_them _t2.
 *
 * Must document what it does.
 *
 * ASM 2792
 */
let bx; /* static */
let cx; /* static */
export function
e_them_t2_action2(e)
{
//#define flgclmb c1
//#define offsx c2
  let i;
  let x, y, yd;
  let env0, env1;
	let tmp;

  /*
   * vars required by the Black Magic (tm) performance at the
   * end of this function.
   *//*
	static U16 bx;
  static U8 *bl = (U8 *)&bx;
  static U8 *bh = (U8 *)&bx + 1;
  static U16 cx;
  static U8 *cl = (U8 *)&cx;
  static U8 *ch = (U8 *)&cx + 1;
  static U16 *sl = (U16 *)&e_them_rndseed;
  static U16 *sh = (U16 *)&e_them_rndseed + 2;
*/
	const bl = () => ((bx & 0xFF00) >> 8);
	const bh = () => ((bx & 0x00FF) >> 0);
	const cl = () => ((cx & 0xFF00) >> 8);
	const ch = () => ((cx & 0x00FF) >> 0);
	const sl = () => ((e_them.rndseed & 0xFFFF0000) >> 16);
  const sh = () => ((e_them.rndseed & 0x0000FFFF) >> 0);

  /*sys_printf("e_them_t2 ------------------------------\n");*/

  /* latency: if not zero then decrease */
  if (ent.ents[e].latency > 0) ent.ents[e].latency--;

  /* climbing? */
  if (ent.ents[e].flgclmb !== true) { goto_climbing_not(); return; }

  /* CLIMBING */

  /*sys_printf("e_them_t2 climbing\n");*/

  /* latency: if not zero then return */
  if (ent.ents[e].latency > 0) return;

  /* calc new sprite */
  ent.ents[e].sprite = ent.ents[e].sprbase + 0x08 +
    (((ent.ents[e].x ^ ent.ents[e].y) & 0x04) ? 1 : 0);

  /* reached rick's level? */
  if ((ent.ents[e].y & 0xfe) != (E_RICK_ENT().y & 0xfe)) { goto_ymove(); return; }

	goto_xmove();
  function goto_xmove() {
    /* calc new x and test environment */
    ent.ents[e].offsx2 = (ent.ents[e].x < E_RICK_ENT().x) ? 0x02 : -0x02;
    x = ent.ents[e].x + ent.ents[e].offsx2;
    tmp = u_envtest(x, ent.ents[e].y, false, env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;
    if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))
      return;
    if (env1 & MAP_EFLG_LETHAL) {
      e_them_gozombie(e);
      return;
    }
    ent.ents[e].x = x;
    if (env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB))  /* still climbing */
      return;
    goto_climbing_not();  /* not climbing anymore */
	}

  function goto_ymove() {
    /* calc new y and test environment */
    yd = ent.ents[e].y < E_RICK_ENT().y ? 0x02 : -0x02;
    y = ent.ents[e].y + yd;
    if (y < 0 || y > 0x0140) {
      ent.ents[e].n = 0;
      return;
    }
    tmp = u_envtest(ent.ents[e].x, y, false, env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;
    if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
      if (yd < 0)
				goto_xmove();  /* can't go up */
      else
				goto_climbing_not();  /* can't go down */
			return;
    }
    /* can move */
    ent.ents[e].y = y;
    if (env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB))  /* still climbing */
      return;
		goto_climbing_not();
	}
	/* NOT CLIMBING */

 function goto_climbing_not() {
    /*sys_printf("e_them_t2 climbing NOT\n");*/

    ent.ents[e].flgclmb = false;  /* not climbing */

    /* calc new y (falling) and test environment */
    i = (ent.ents[e].y << 8) + ent.ents[e].offsy + ent.ents[e].ylow;
    y = i >> 8;
    tmp = u_envtest(ent.ents[e].x, y, false, env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;
    if (!(env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
      /*sys_printf("e_them_t2 y move OK\n");*/
      /* can go there */
      if (env1 & MAP_EFLG_LETHAL) {
				e_them_gozombie(e);
				return;
      }
      if (y > 0x0140) {  /* deactivate if outside */
				ent.ents[e].n = 0;
				return;
      }
      if (!(env1 & MAP_EFLG_VERT)) {
				/* save */
				ent.ents[e].y = y;
				ent.ents[e].ylow = _U8(i);	// UPGRADE ??
				ent.ents[e].offsy += 0x0080;
				if (ent.ents[e].offsy > 0x0800)
					ent.ents[e].offsy = 0x0800;
				return;
      }
      if (((ent.ents[e].x & 0x07) == 0x04) && (y < E_RICK_ENT().y)) {
				/*sys_printf("e_them_t2 climbing00\n");*/
				ent.ents[e].flgclmb = true;  /* climbing */
				return;
      }
    }

    /*sys_printf("e_them_t2 ymove nok or ...\n");*/
    /* can't go there, or ... */
    ent.ents[e].y = (ent.ents[e].y & 0xf8) | 0x03;  /* align to ground */
    ent.ents[e].offsy = 0x0100;
    if (ent.ents[e].latency !== 0)
      return;

    if ((env1 & MAP_EFLG_CLIMB) &&
				((ent.ents[e].x & 0x0e) == 0x04) &&
				(ent.ents[e].y > E_RICK_ENT().y)) {
      /*sys_printf("e_them_t2 climbing01\n");*/
      ent.ents[e].flgclmb = true;  /* climbing */
      return;
    }

    /* calc new sprite */
    ent.ents[e].sprite = ent.ents[e].sprbase +
      ent_sprseq[(ent.ents[e].offsx2 < 0 ? 4 : 0) +
		((ent.ents[e].x & 0x0e) >> 3)];
    /*sys_printf("e_them_t2 sprite %02x\n", ent.ents[e].sprite);*/


    /* */
    if (ent.ents[e].offsx2 == 0)
      ent.ents[e].offsx2 = 2;
    x = ent.ents[e].x + ent.ents[e].offsx2;
    /*sys_printf("e_them_t2 xmove x=%02x\n", x);*/
    if (x < 0xe8) {
      tmp = u_envtest(x, ent.ents[e].y, false, env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;
				if (!(env1 & (MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
					ent.ents[e].x = x;
					if ((x & 0x1e) != 0x08)
					  return;

				/*
				* Black Magic (tm)
				*
				* this is obviously some sort of randomizer to define a direction
				* for the entity. it is an exact copy of what the assembler code
				* does but I can't explain.
				*/
				// JS adapatation...
				bx = _U16(e_them_rndnbr + sh() + sl() + 0x0d);
				cx = sh(); let pbl = bl();
				pbl ^= ch();
				pbl ^= cl();
				pbl ^= bh();
				e_them_rndnbr = (bx = ((pbl << 8) | (bh())));

				ent.ents[e].offsx2 = (bl() & 0x01) ? -0x02 : 0x02;

				/* back to normal */

				return;
      }
    }

    /* U-turn */
    /*sys_printf("e_them_t2 u-turn\n");*/
    if (ent.ents[e].offsx2 === 0)
      ent.ents[e].offsx2 = 2;
    else
      ent.ents[e].offsx2 = -ent.ents[e].offsx2;
	}
//#undef offsx
}

/*
 * Action function for e_them _t2 type
 *
 * ASM 2718
 */
export function
e_them_t2_action(e)
{
  e_them_t2_action2(e);

  /* they kill rick */
  if (e_rick_boxtest(e))
    e_rick_gozombie();

  /* lethal entities kill them */
  if (u_themtest(e)) {
    e_them_gozombie(e);
    return;
  }

  /* bullet kills them */
  if (E_BULLET_ENT().n &&
      u_fboxtest(e, E_BULLET_ENT().x + (e_bullet.offsx < 0 ? 0 : 0x18),
		 E_BULLET_ENT().y)) {
    E_BULLET_ENT().n = 0;
    e_them_gozombie(e);
    return;
  }

  /* bomb kills them */
  if (e_bomb.lethal && e_bomb_hit(e)) {
    e_them_gozombie(e);
    return;
  }

  /* rick stops them */
  if (E_RICK_STTST(E_RICK_STSTOP) &&
      u_fboxtest(e, e_rick.stop_x, e_rick.stop_y))
    ent.ents[e].latency = 0x14;
}


/*
 * Action sub-function for e_them _t3
 *
 * FIXME always starts asleep??
 *
 * Waits until triggered by something, then execute move steps from
 * ent_mvstep with sprite from ent_sprseq. When done, either restart
 * or disappear.
 *
 * Not always lethal ... but if lethal, kills rick.
 *
 * ASM: 255A
 */
export function
e_them_t3_action2(e)
{
//#define sproffs c1
//#define step_count c2
  let i;
  let x, y;

  while (1) {

    /* calc new sprite */
    i = ent_sprseq[ent.ents[e].sprbase + ent.ents[e].sproffs];
    if (i == 0xff)
      i = ent_sprseq[ent.ents[e].sprbase];
    ent.ents[e].sprite = i;

    if (ent.ents[e].sproffs !== 0) {  /* awake */

      /* rotate sprseq */
      if (ent_sprseq[ent.ents[e].sprbase + ent.ents[e].sproffs] !== 0xff)
				ent.ents[e].sproffs++;
      if (ent_sprseq[ent.ents[e].sprbase + ent.ents[e].sproffs] === 0xff)
				ent.ents[e].sproffs = 1;

      if (ent.ents[e].step_count < ent_mvstep[ent.ents[e].step_no].count) {
				/*
				* still running this step: try to increment x and y while
				* checking that they remain within boudaries. if so, return.
				* else switch to next step.
				*/
				ent.ents[e].step_count++;
				x = ent.ents[e].x + ent_mvstep[ent.ents[e].step_no].dx;

				/* check'n save */
				if (x > 0 && x < 0xe8) {
					ent.ents[e].x = x;
					/*FIXME*/
					/*
					y = ent_mvstep[ent.ents[e].step_no].dy;
					if (y < 0)
						y += 0xff00;
					y += ent.ents[e].y;
					*/
					y = ent.ents[e].y + ent_mvstep[ent.ents[e].step_no].dy;
					if (y > 0 && y < 0x0140) {
						ent.ents[e].y = y;
						return;
					}
				}
			}

      /*
       * step is done, or x or y is outside boundaries. try to
       * switch to next step
       */
      ent.ents[e].step_no++;
      if (ent_mvstep[ent.ents[e].step_no].count !== 0xff) {
				/* there is a next step: init and loop */
				ent.ents[e].step_count = 0;
      }
      else {
				/* there is no next step: restart or deactivate */
				if (!E_RICK_STTST(E_RICK_STZOMBIE) &&
						!(ent.ents[e].flags & ENT_FLG_ONCE)) {
					/* loop this entity */
					ent.ents[e].sproffs = 0;
					ent.ents[e].n &= ~ENT_LETHAL;
					if (ent.ents[e].flags & ENT_FLG_LETHALR)
						ent.ents[e].n |= ENT_LETHAL;
					ent.ents[e].x = ent.ents[e].xsave;
					ent.ents[e].y = ent.ents[e].ysave;
					if (ent.ents[e].y < 0 || ent.ents[e].y > 0x140) {
						ent.ents[e].n = 0;
						return;
					}
				}
				else {
					/* deactivate this entity */
					ent.ents[e].n = 0;
					return;
				}
      }
    }
    else {  /* ent.ents[e].sprseq1 == 0 -- waiting */

      /* ugly GOTOs */

      if (ent.ents[e].flags & ENT_FLG_TRIGRICK) {  /* reacts to rick */
				/* wake up if triggered by rick */
				if (u_trigbox(e, E_RICK_ENT().x + 0x0C, E_RICK_ENT().y + 0x0A)) {
					goto_wakeup();
					return;
				}
			}

			if (ent.ents[e].flags & ENT_FLG_TRIGSTOP) {  /* reacts to rick "stop" */
				/* wake up if triggered by rick "stop" */
				if (E_RICK_STTST(E_RICK_STSTOP) &&
						u_trigbox(e, e_rick.stop_x, e_rick.stop_y)) {
							goto_wakeup();
							return;
				}
			}

			if (ent.ents[e].flags & ENT_FLG_TRIGBULLET) {  /* reacts to bullets */
				/* wake up if triggered by bullet */
				if (E_BULLET_ENT().n && u_trigbox(e, e_bullet.xc, e_bullet.yc)) {
					E_BULLET_ENT().n = 0;
					goto_wakeup();
					return;
				}
			}

      if (ent.ents[e].flags & ENT_FLG_TRIGBOMB) {  /* reacts to bombs */
				/* wake up if triggered by bomb */
				if (e_bomb.lethal && u_trigbox(e, e_bomb.xc, e_bomb.yc)) {
					goto_wakeup();
				}
			}

			/* not triggered: keep waiting */
			return;

      /* something triggered the entity: wake up */
      /* initialize step counter */
			function goto_wakeup() {
				if (E_RICK_STTST(E_RICK_STZOMBIE))
					return;
//#ifdef ENABLE_SOUND
				/*
				* FIXME the sound should come from a table, there are 10 of them
				* but I dont have the table yet. must rip the data off the game...
				* FIXME is it 8 of them, not 10?
				* FIXME testing below...
				*/
				syssnd_play(WAV_ENTITY[(ent.ents[e].trigsnd & 0x1F) - 0x14], 1);
				/*syssnd_play(WAV_ENTITY[0], 1);*/
//#endif
				ent.ents[e].n &= ~ENT_LETHAL;
				if (ent.ents[e].flags & ENT_FLG_LETHALI)
					ent.ents[e].n |= ENT_LETHAL;
				ent.ents[e].sproffs = 1;
				ent.ents[e].step_count = 0;
				ent.ents[e].step_no = ent.ents[e].step_no_i;
				return;
			}
		}
	}
//#undef step_count
}

/*
 * Action function for e_them _t3 type
 *
 * ASM 2546
 */
export function
e_them_t3_action(e)
{
  e_them_t3_action2(e);

  /* if lethal, can kill rick */
  if ((ent.ents[e].n & ENT_LETHAL) &&
      !E_RICK_STTST(E_RICK_STZOMBIE) && e_rick_boxtest(e)) {  /* CALL 1130 */
    e_rick_gozombie();
  }
}

/* eof */
