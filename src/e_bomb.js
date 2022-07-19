import { WAV_BOMBSHHT, WAV_EXPLODE } from "../include/game";
import { E_BOMB_TICKER, E_BOMB_ENT } from "../include/e_bomb";
import { syssnd_play } from "./syssnd";
import { ent } from "../include/ents";
import { e_rick_gozombie } from "./e_rick";
import { E_RICK_NO } from "../include/e_rick";

/*
 * public vars (for performance reasons)
 */
export const e_bomb = {
	lethal: false,
	xc: 0,
	yc: 0
};

/*
 * private vars
 */
let e_bomb_ticker;


/*
 * Bomb hit test
 *
 * ASM 11CD
 * returns: TRUE/hit, FALSE/not
 */
export function e_bomb_hit(e)
{
	if (ent.ents[e].x > (E_BOMB_ENT().x >= 0xE0 ? 0xFF : E_BOMB_ENT().x + 0x20))
			return false;
	if (ent.ents[e].x + ent.ents[e].w < (E_BOMB_ENT().x > 0x04 ? E_BOMB_ENT().x - 0x04 : 0))
			return false;
	if (ent.ents[e].y > (E_BOMB_ENT().y + 0x1D))
			return false;
	if (ent.ents[e].y + ent.ents[e].h < (E_BOMB_ENT().y > 0x0004 ? E_BOMB_ENT().y - 0x0004 : 0))
			return false;
	return true;
}

/*
 * Initialize bomb
 */
export function e_bomb_init(x, y)
{
    E_BOMB_ENT().n = 0x03;
    E_BOMB_ENT().x = x;
    E_BOMB_ENT().y = y;
    e_bomb_ticker = E_BOMB_TICKER;
    e_bomb.lethal = false;

    /*
     * Atari ST dynamite sprites are not centered the
     * way IBM PC sprites were ... need to adjust things a little bit
     */
//#ifdef GFXST
    E_BOMB_ENT().x += 4;
    E_BOMB_ENT().y += 5;
//#endif

}


/*
 * Entity action
 *
 * ASM 18CA
 */
export function
e_bomb_action(UNUSED_e)
{
	/* tick */
	e_bomb_ticker--;

	if (e_bomb_ticker === 0)
	{
		/*
		 * end: deactivate
		 */
		E_BOMB_ENT().n = 0;
		e_bomb.lethal = false;
	}
	else if (e_bomb_ticker >= 0x0A)
	{
		/*
		 * ticking
		 */
//#ifdef ENABLE_SOUND
		if ((e_bomb_ticker & 0x03) == 0x02)
			syssnd_play(WAV_BOMBSHHT, 1);
//#endif
//#ifdef GFXST
		/* ST bomb sprites sequence is longer */
		if (e_bomb_ticker < 40)
			E_BOMB_ENT().sprite = 0x99 + 19 - (e_bomb_ticker >> 1);
		else
//#endif
		E_BOMB_ENT().sprite = (e_bomb_ticker & 0x01) ? 0x23 : 0x22;
	}
	else if (e_bomb_ticker == 0x09)
	{
		/*
		 * explode
		 */
//#ifdef ENABLE_SOUND
		syssnd_play(WAV_EXPLODE, 1);
//#endif
//#ifdef GFXPC
//		E_BOMB_ENT().sprite = 0x24 + 4 - (e_bomb_ticker >> 1);
//#endif
//#ifdef GFXST
		/* See above: fixing alignment */
		E_BOMB_ENT().x -= 4;
		E_BOMB_ENT().y -= 5;
		E_BOMB_ENT().sprite = 0xa8 + 4 - (e_bomb_ticker >> 1);
//#endif
		e_bomb.xc = E_BOMB_ENT().x + 0x0C;
		e_bomb.yc = E_BOMB_ENT().y + 0x000A;
		e_bomb.lethal = true;
		if (e_bomb_hit(E_RICK_NO))
			e_rick_gozombie();
	}
	else
	{
		/*
		 * exploding
		 */
//#ifdef GFXPC
//		E_BOMB_ENT().sprite = 0x24 + 4 - (e_bomb_ticker >> 1);
//#endif
//#ifdef GFXST
		E_BOMB_ENT().sprite = 0xa8 + 4 - (e_bomb_ticker >> 1);
//#endif
		/* exploding, hence lethal */
		if (e_bomb_hit(E_RICK_NO))
			e_rick_gozombie();
	}
}

/* eof */


