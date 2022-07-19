import { ent, ENT_ENTSNUM } from "../include/ents";
import { ent_entdata } from "./dat_ents";
import { map } from "./maps";
import { game } from "./game";
import { e_rick_boxtest } from "./e_rick";
import { E_RICK_NO } from "../include/e_rick";
import { MAP_EFLG_01, MAP_EFLG_CLIMB, MAP_EFLG_FGND, MAP_EFLG_LETHAL,
				 MAP_EFLG_SOLID, MAP_EFLG_SPAD, MAP_EFLG_VERT,
				 MAP_EFLG_WAYUP } from "../include/maps";
import { _U8 } from "./c";

/*
 * Full box test.
 *
 * ASM 1199
 *
 * e: entity to test against.
 * x,y: coordinates to test.
 * ret: TRUE/(x,y) is within e's space, FALSE/not.
 */
export function
u_fboxtest(e, x, y)
{
  if (ent.ents[e].x >= x ||
      ent.ents[e].x + ent.ents[e].w < x ||
      ent.ents[e].y >= y ||
      ent.ents[e].y + ent.ents[e].h < y)
    return false;
  else
    return true;
}




/*
 * Box test (then whole e2 is checked agains the center of e1).
 *
 * ASM 113E
 *
 * e1: entity to test against (corresponds to DI in asm code).
 * e2: entity to test (corresponds to SI in asm code).
 * ret: TRUE/intersect, FALSE/not.
 */
export function
u_boxtest(e1, e2)
{
  /* rick is special (may be crawling) */
  if (e1 === E_RICK_NO)
    return e_rick_boxtest(e2);

  /*
   * entity 1: x+0x05 to x+0x011, y to y+0x14
   * entity 2: x to x+ .w, y to y+ .h
   */
  if (ent.ents[e1].x + 0x11 < ent.ents[e2].x ||
      ent.ents[e1].x + 0x05 > ent.ents[e2].x + ent.ents[e2].w ||
      ent.ents[e1].y + 0x14 < ent.ents[e2].y ||
      ent.ents[e1].y > ent.ents[e2].y + ent.ents[e2].h - 1)
    return false;
  else
    return true;
}


/*
 * Compute the environment flag.
 *
 * ASM 0FBC if !crawl, else 103E
 *
 * x, y: coordinates where to compute the environment flag
 * crawl: is rick crawling?
 * rc0: anything CHANGED to the environment flag for crawling (6DBA)
 * rc1: anything CHANGED to the environment flag (6DAD)
 */
export function
u_envtest(x, y, crawl, rc0, rc1)
{
  let i, xx;

  /* prepare for ent #0 test */
  ent.ents[ENT_ENTSNUM].x = x;
  ent.ents[ENT_ENTSNUM].y = y;

  i = 1;
  if (!crawl) i++;
  if (y & 0x0004) i++;

  x += 4;
  xx = _U8(x); /* FIXME? */

  x = x >> 3;  /* from pixels to tiles */
  y = y >> 3;  /* from pixels to tiles */

  rc0 = rc1 = 0;

  if (xx & 0x07) {  /* tiles columns alignment */
    if (crawl) {
      rc0 |= (map.eflg[map.map[y][x]] &
	   		(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
      rc0 |= (map.eflg[map.map[y][x + 1]] &
	   		(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
      rc0 |= (map.eflg[map.map[y][x + 2]] &
	   		(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
      y++;
    }
    do {
      rc1 |= (map.eflg[map.map[y][x]] &
	       (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
					MAP_EFLG_LETHAL|MAP_EFLG_01));
      rc1 |= (map.eflg[map.map[y][x + 1]] &
	       (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
					MAP_EFLG_LETHAL|MAP_EFLG_CLIMB|MAP_EFLG_01));
      rc1 |= (map.eflg[map.map[y][x + 2]] &
	       (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
					MAP_EFLG_LETHAL|MAP_EFLG_01));
      y++;
    } while (--i > 0);

    rc1 |= (map.eflg[map.map[y][x]] &
	     (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP|MAP_EFLG_FGND|
	      MAP_EFLG_LETHAL|MAP_EFLG_01));
    rc1 |= (map.eflg[map.map[y][x + 1]]);
    rc1 |= (map.eflg[map.map[y][x + 2]] &
	     (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP|MAP_EFLG_FGND|
	      MAP_EFLG_LETHAL|MAP_EFLG_01));
  }
  else {
    if (crawl) {
      rc0 |= (map.eflg[map.map[y][x]] &
	   		(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
      rc0 |= (map.eflg[map.map[y][x + 1]] &
	   		(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
      y++;
    }
    do {
      rc1 |= (map.eflg[map.map[y][x]] &
	       (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
					MAP_EFLG_LETHAL|MAP_EFLG_CLIMB|MAP_EFLG_01));
      rc1 |= (map.eflg[map.map[y][x + 1]] &
	       (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
					MAP_EFLG_LETHAL|MAP_EFLG_CLIMB|MAP_EFLG_01));
      y++;
    } while (--i > 0);

    rc1 |= (map.eflg[map.map[y][x]]);
    rc1 |= (map.eflg[map.map[y][x + 1]]);
  }

  /*
   * If not lethal yet, and there's an entity on slot zero, and (x,y)
   * boxtests this entity, then raise SOLID flag. This is how we make
   * sure that no entity can move over the entity that is on slot zero.
   *
   * Beware! When game_cheat2 is set, this means that a block can
   * move over rick without killing him -- but then rick is trapped
   * because the block is solid.
   */
  if (!(rc1 & MAP_EFLG_LETHAL)
      && ent.ents[0].n
      && u_boxtest(ENT_ENTSNUM, 0)) {
    rc1 |= MAP_EFLG_SOLID;
  }

  /* When game_cheat2 is set, the environment can not be lethal. */
//#ifdef ENABLE_CHEATS
  if (game.cheat2) rc1 &= ~MAP_EFLG_LETHAL;
//#endif

	return { rc0, rc1 };
}


/*
 * Check if x,y is within e trigger box.
 *
 * ASM 126F
 * return: FALSE if not in box, TRUE if in box.
 */
export function
u_trigbox(e, x, y)
{
  let xmax, ymax;

  xmax = ent.ents[e].trig_x + (ent_entdata[ent.ents[e].n & 0x7F].trig_w << 3);
  ymax = ent.ents[e].trig_y + (ent_entdata[ent.ents[e].n & 0x7F].trig_h << 3);

  if (xmax > 0xFF) xmax = 0xFF;

  if (x <= ent.ents[e].trig_x || x > xmax ||
      y <= ent.ents[e].trig_y || y > ymax)
    return false;
  else
    return true;
}


/* eof */


