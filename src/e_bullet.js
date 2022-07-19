import { E_BULLET_ENT } from "../include/e_bullet";
import { LEFT, WAV_BULLET } from "../include/game";
import { MAP_EFLG_SOLID } from "../include/maps";
import { game } from "./game";
import { syssnd_play } from "./syssnd";
import { map } from "./maps";

/*
 * public vars (for performance reasons)
 */
export const e_bullet = {
	offsx: 0,
	xc: 0, yc: 0
};

/*
 * Initialize bullet
 */
export function
e_bullet_init(x, y)
{
  E_BULLET_ENT().n = 0x02;
  E_BULLET_ENT().x = x;
  E_BULLET_ENT().y = y + 0x0006;
  if (game.dir === LEFT) {
    e_bullet.offsx = -0x08;
    E_BULLET_ENT().sprite = 0x21;
  }
  else {
    e_bullet.offsx = 0x08;
    E_BULLET_ENT().sprite = 0x20;
  }
//#ifdef ENABLE_SOUND
  syssnd_play(WAV_BULLET, 1);
//#endif
}


/*
 * Entity action
 *
 * ASM 1883, 0F97
 */
export function
e_bullet_action(_UNUSED_e)
{
  /* move bullet */
  E_BULLET_ENT().x += e_bullet.offsx;

  if (E_BULLET_ENT().x <= -0x10 || E_BULLET_ENT().x > 0xe8) {
    /* out: deactivate */
    E_BULLET_ENT().n = 0;
  }
  else {
    /* update bullet center coordinates */
    e_bullet.xc = E_BULLET_ENT().x + 0x0c;
    e_bullet.yc = E_BULLET_ENT().y + 0x05;
    if (map.eflg[map.map[e_bullet.yc >> 3][e_bullet.xc >> 3]] &
				MAP_EFLG_SOLID) {
      /* hit something: deactivate */
      E_BULLET_ENT().n = 0;
    }
  }
}


/* eof */

