import { create_struct } from "../src/c";

export const LEFT = 1;
export const RIGHT = 0;

export const GAME_PERIOD = 75

export const GAME_BOMBS_INIT = 6;
export const GAME_BULLETS_INIT = 6;

const struct_hscore_t = [
  "score",
  "name"
];
export function hscore_t(...values) {
	return create_struct(struct_hscore_t, values);
}

//#ifdef ENABLE_SOUND
export const WAV_GAMEOVER = "WAV_GAMEOVER";
export const WAV_SBONUS2 = "WAV_SBONUS2";
export const WAV_BULLET = "WAV_BULLET";
export const WAV_BOMBSHHT = "WAV_BOMBSHHT";
export const WAV_EXPLODE = "WAV_EXPLODE";
export const WAV_STICK = "WAV_STICK";
export const WAV_WALK = "WAV_WALK";
export const WAV_CRAWL = "WAV_CRAWL";
export const WAV_JUMP = "WAV_JUMP";
export const WAV_PAD = "WAV_PAD";
export const WAV_BOX = "WAV_BOX";
export const WAV_BONUS = "WAV_BONUS";
export const WAV_SBONUS1 = "WAV_SBONUS1";
export const WAV_DIE = "WAV_DIE";
export const WAV_ENTITY = [0, 1, 2, 3, 4, 5, 6, 7, 8];
//#endif
