import { WAV_BONUS } from "../include/game";
import { ent } from "../include/ents";
import { e_rick_boxtest } from "./e_rick";
import { syssnd_play } from "./syssnd";
import { map_marks } from "./dat_maps";
import { game } from "./game";
import { MAP_MARK_NACT } from "../include/maps";
/*
 * Entity action
 *
 * ASM 242C
 */
export function
e_bonus_action(e)
{
//#define seq c1

  if (ent.ents[e].seq === 0) {
    if (e_rick_boxtest(e)) {
      game.score += 500;
//#ifdef ENABLE_SOUND
      syssnd_play(WAV_BONUS, 1);
//#endif
      map_marks[ent.ents[e].mark].ent |= MAP_MARK_NACT;
      ent.ents[e].seq = 1;
      ent.ents[e].sprite = 0xad;
      ent.ents[e].front = true;
      ent.ents[e].y -= 0x08;
    }
  }

  else if (ent.ents[e].seq > 0 && ent.ents[e].seq < 10) {
    ent.ents[e].seq++;
    ent.ents[e].y -= 2;
  }

  else {
    ent.ents[e].n = 0;
  }
}


/* eof */


