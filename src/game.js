/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/game.c
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012-2022 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

import { sysarg } from "./sysarg";
import { GAME_PERIOD, hscore_t } from "../include/game";
import { screen_xrick } from "./scr_xrick";
import { sysvid, sysvid_update, sysvid_clear, sysvid_fadeStart, sysvid_fadeEnd } from "./sysvid";
import { sysevt_poll } from "./sysevt";
import { draw_SCREENRECT, draw_STATUSRECT, draw_map,
				 draw_drawStatus, draw_infos, draw_clearStatus } from "./draw";
import { SCREEN_EXIT, SCREEN_DONE, SCREEN_RUNNING } from "../include/screens";
import { map_maps } from "./dat_maps";
import { map, map_resetMarks, map_init, map_chain } from "./maps";
import { ENT_ENTSNUM, ent } from "../include/ents";
import { E_RICK_STRST, E_RICK_STTST, E_RICK_STDEAD, E_RICK_STZOMBIE } from "../include/e_rick";
import { e_rick_restore, e_rick_save } from "./e_rick";
import { screen_introMain } from "./scr_imain";
import { screen_introMap } from "./scr_imap";
import { e_them } from "./e_them";
import { ent_action, ent_clprev, ent_draw } from "./ents";
import { control } from "./control";
import { CONTROL_END, CONTROL_EXIT, CONTROL_PAUSE } from "../include/control";
import { scroll_down, scroll_up } from "./scroller";
import { SCROLL_RUNNING, SCROLL_DONE } from "../include/scroller";
import { _U8 } from "./c";
import { screen_gameover } from "./scr_gameover";
import { screen_getname } from "./scr_getname";

/*
	* local typedefs
	*/
const XRICK = 0;
const INIT_GAME = 1, INIT_BUFFER = 2;
const INTRO_MAIN = 3, INTRO_MAP = 4;
const PAUSE_PRESSED1 = 5, PAUSE_PRESSED1B = 6, PAUSED = 7, PAUSE_PRESSED2 = 8;
const PLAY0 = 9, PLAY1 = 10, PLAY2 = 11, PLAY3 = 12;
const CHAIN_SUBMAP = 13, CHAIN_MAP = 14, CHAIN_END = 15;
const SCROLL_UP = 16, SCROLL_DOWN = 17;
const RESTART = 18, GAMEOVER = 19, GETNAME = 20, EXIT = 21;

/*
 * global vars
 */
export const game = {
	period: 0,
	waitevt: false,
	rects: null,
	lives: 0,
	bombs: 0,
	bullets: 0,
	score: 0,

	map: 0,
	submap: 0,

	dir: 0,
	chsm: 0,

	cheat1: 0,
	cheat2: 0,
	cheat3: 0,

//#ifdef GFXST
	hscores/*[8]*/: [
		hscore_t( 8000, "SIMES@@@@@" ),
		hscore_t( 7000, "JAYNE@@@@@" ),
		hscore_t( 6000, "DANGERSTU@" ),
		hscore_t( 5000, "KEN@@@@@@@" ),
		hscore_t( 4000, "ROB@N@BOB@" ),
		hscore_t( 3000, "TELLY@@@@@" ),
		hscore_t( 2000, "NOBBY@@@@@" ),
		hscore_t( 1000, "JEZEBEL@@@" )
	]
//#endif

};

/*
 * local vars
 */
let isave_frow;
let game_state;
let game_timer;
let fading;


/*
 * Cheats
 */
//#ifdef ENABLE_CHEATS
export function
game_toggleCheat(nbr)
{
  if (game_state !== INTRO_MAIN && game_state !== INTRO_MAP &&
      game_state !== GAMEOVER && game_state !== GETNAME &&
//#ifdef ENABLE_DEVTOOLS
//      game_state !== DEVTOOLS &&
//#endif
      game_state !== XRICK && game_state !== EXIT) {
    switch (nbr) {
    case 1:
      game.cheat1 = ~game.cheat1;
      game.lives = 6;
      game.bombs = 6;
      game.bullets = 6;
      break;
    case 2:
      game.cheat2 = ~game.cheat2;
      break;
    case 3:
      game.cheat3 = ~game.cheat3;
      break;
    }
    draw_infos();
    /* FIXME this should probably only raise a flag ... */
    /* plus we only need to update INFORECT not the whole screen */
    sysvid_update(draw_SCREENRECT);
  }
}
//#endif

//#ifdef ENABLE_SOUND
/*
 * Music
 */
export function
game_setmusic(name, loop)
{
	console.log("game_setmusic", name);
/*	U8 channel;

	if (music_snd)
		game_stopmusic();
	music_snd = syssnd_load(name);
	if (music_snd)
	{
		music_snd->dispose = TRUE; /* music is always "fire and forget" //
		channel = syssnd_play(music_snd, loop);
	}
*/
}

export function
game_stopmusic()
{
	console.log("game_stopmusic");
//	syssnd_stopsound(music_snd);
//	music_snd = NULL;
}
//#endif

/*
 * Main loop
 */
export function
game_run()
{
//  let tm, tmx;

	loaddata(); /* load cached data */

	game.period = sysarg.args_period ? sysarg.args_period : GAME_PERIOD;
//	tm = sys_gettime();
	game_state = XRICK;

	/* main loop */
	game_timer = new G.Timer(gameLoop, 30, 0);
	game_timer.start(true);

	function gameLoop(timer) {
		if (game_state === EXIT) {
			game_timer.stop();
			return;
		}

		/* video */
		sysvid_update(game.rects);
		draw_STATUSRECT.next = null;  /* FIXME freerects should handle this */

		/* sound */
		/*snd_mix();*/

		/* events */
		if (game.waitevt) {
			sysevt_wait();  /* wait for an event */
		} else {
			sysevt_poll();  /* process events (non-blocking) */
		}

		/* frame */
		frame(timer);
	}

	freedata(); /* free cached data */
}

/*
 * Prepare frame
 *
 * This function loops forever: use 'return' when a frame is ready.
 * When returning, game_rects must contain every parts of the buffer
 * that have been modified.
 */
function
frame(timer)
{
	while (1) {

		switch (game_state) {


		case XRICK:
			switch(screen_xrick()) {
				case SCREEN_RUNNING:
					return;
				case SCREEN_DONE:
					game_state = INIT_GAME;
					break;
				case SCREEN_EXIT:
					game_state = EXIT;
					return;
			}
			break;



		case INIT_GAME:
			init();
			game_state = INTRO_MAIN;
			break;



		case INTRO_MAIN:
			switch (screen_introMain(timer)) {
			case SCREEN_RUNNING:
				return;
			case SCREEN_DONE:
				game_state = INTRO_MAP;
				break;
			case SCREEN_EXIT:
				game_state = EXIT;
				return;
			}
		break;



		case INTRO_MAP:
			switch (screen_introMap(timer)) {
			case SCREEN_RUNNING:
				return;
			case SCREEN_DONE:
				game.waitevt = false;
				game_state = INIT_BUFFER;
				break;
			case SCREEN_EXIT:
				game_state = EXIT;
				return;
			}
		break;


		case INIT_BUFFER:
			sysvid_clear();                 /* clear buffer */
			draw_map();                     /* draw the map onto the buffer */
			draw_drawStatus();              /* draw the status bar onto the buffer */
//#ifdef ENABLE_CHEATS
			draw_infos();                   /* draw the info bar onto the buffer */
//#endif
			game.rects = draw_SCREENRECT;   /* request full buffer refresh */
			game_state = PLAY0;
			fading = GE.Fader.IN;
			sysvid_fadeStart();
			return;



		case PAUSE_PRESSED1:
			screen_pause(true);
			game_state = PAUSE_PRESSED1B;
			break;



		case PAUSE_PRESSED1B:
			if (control.status & CONTROL_PAUSE)
				return;
			game_state = PAUSED;
			break;



		case PAUSED:
			if (control.status & CONTROL_PAUSE)
				game_state = PAUSE_PRESSED2;
			if (control.status & CONTROL_EXIT)
				game_state = EXIT;
			return;



		case PAUSE_PRESSED2:
			if (!(control.status & CONTROL_PAUSE)) {
				game.waitevt = false;
				screen_pause(false);
//#ifdef ENABLE_SOUND
				syssnd_pause(false, false);
//#endif
				game_state = PLAY2;
			}
		return;



		case PLAY0:
			play0();
			break;



		case PLAY1:
			if (control.status & CONTROL_PAUSE) {
//#ifdef ENABLE_SOUND
				syssnd_pause(true, false);
//#endif
				game.waitevt = true;
				game_state = PAUSE_PRESSED1;
			}
			else if (control.active === false) {
//#ifdef ENABLE_SOUND
				syssnd_pause(true, false);
//#endif
				game.waitevt = true;
				screen_pause(true);
				game_state = PAUSED;
			}
			else
				game_state = PLAY2;
			break;



		case PLAY2:
			if (E_RICK_STTST(E_RICK_STDEAD)) {  /* rick is dead */
				if (game.cheat1 || --game.lives) {
					game_state = RESTART;
				} else {
					game_state = GAMEOVER;
				}
			}
			else if (game.chsm)  /* request to chain to next submap */
				game_state = CHAIN_SUBMAP;
			else
				game_state = PLAY3;
			break;



		case PLAY3:
			play3(timer);
			return;



		case CHAIN_SUBMAP:
			if (map_chain())
				game_state = CHAIN_END;
			else {
				game.bullets = 0x06;
				game.bombs = 0x06;
				game.map++;

				if (game.map == 0x04) {
					/* reached end of game */
					/* FIXME @292?*/
				}

				game_state = CHAIN_MAP;
			}
			break;



		case CHAIN_MAP:                             /* CHAIN MAP */
			switch (screen_introMap(timer)) {
			case SCREEN_RUNNING:
				return;
			case SCREEN_DONE:
				if (game.map >= 0x04) {  /* reached end of game */
					sysarg.args_map = 0;
					sysarg.args_submap = 0;
					game_state = GAMEOVER;
				}
				else {  /* initialize game */
					ent.ents[1].x = map_maps[game.map].x;
					ent.ents[1].y = map_maps[game.map].y;
					map.frow = _U8(map_maps[game.map].row);
					game.submap = map_maps[game.map].submap;
					game_state = CHAIN_END;
				}
				break;
			case SCREEN_EXIT:
				game_state = EXIT;
				return;
			}
			break;



		case CHAIN_END:
			map_init();                         /* initialize the map */
			isave();                            /* save data in case of a restart */
			ent_clprev();              	        /* cleanup entities */
			draw_map();                         /* draw the map onto the buffer */
			draw_drawStatus();              		/* draw the status bar onto the buffer */
			game.rects = draw_SCREENRECT;  /* request full screen refresh */
			game_state = PLAY3;	// UPGRADE: should be PLAY0??
			return;



		case SCROLL_UP:
			switch (scroll_up()) {
			case SCROLL_RUNNING:
				return;
			case SCROLL_DONE:
				game_state = PLAY0;
				break;
			}
			break;



		case SCROLL_DOWN:
			switch (scroll_down()) {
			case SCROLL_RUNNING:
				return;
			case SCROLL_DONE:
				game_state = PLAY0;
				break;
			}
			break;



		case RESTART:
			restart();
			game_state = PLAY0;
			return;



		case GAMEOVER:
			switch (screen_gameover()) {
			case SCREEN_RUNNING:
				return;
			case SCREEN_DONE:
				game_state = GETNAME;
				break;
			case SCREEN_EXIT:
				game_state = EXIT;
				break;
			}
			break;



		case GETNAME:
			switch (screen_getname()) {
			case SCREEN_RUNNING:
				return;
			case SCREEN_DONE:
				game_state = INIT_GAME;
				return;
			case SCREEN_EXIT:
				game_state = EXIT;
				break;
			}
			break;



		case EXIT:
			return;

		}
	}
}

/*
 * Initialize the game
 */
function
init()
{
	let i;

	E_RICK_STRST(0xff);

	game.lives = 6;
	game.bombs = 6;
	game.bullets = 6;
	game.score = 0;

	game.map = sysarg.args_map;

	if (sysarg.args_submap == 0) {
		game.submap = map_maps[game.map].submap;
		map.frow = _U8(map_maps[game.map].row);
	} else {
		// dirty hack to determine frow //
		game.submap = sysarg.args_submap;
		i = 0;
		while (i < MAP_NBR_CONNECT &&
			(map_connect[i].submap != game.submap ||
				map_connect[i].dir != RIGHT)) {
			i++;
		}
		map.frow = _U8(map_connect[i].rowin - 0x10);
		ent.ents[1].y = 0x10 << 3;
	}

	ent.ents[1].x = map_maps[game.map].x;
	ent.ents[1].y = map_maps[game.map].y;
	ent.ents[1].w = 0x18;
	ent.ents[1].h = 0x15;
	ent.ents[1].n = 0x01;
	ent.ents[1].sprite = 0x01;
	ent.ents[1].front = false;
	ent.ents[ENT_ENTSNUM].n = 0xFF;

	map_resetMarks();

	map_init();
	isave();
}


/*
 * play0
 *
 */
function
play0()
{
  if (control.status & CONTROL_END) {  /* request to end the game */
    game_state = GAMEOVER;
    return;
  }

  if (control.last == CONTROL_EXIT) {  /* request to exit the game */
    game_state = EXIT;
    return;
  }

  ent_action();      /* run entities */
  e_them.rndseed++;  /* (0270) */

  game_state = PLAY1;
}


/*
 * play3
 *
 */
function
play3(timer)
{
  let r;

  draw_clearStatus();  /* clear the status bar */
  ent_draw();          /* draw all entities onto the buffer */
  /* sound */
  draw_drawStatus();   /* draw the status bar onto the buffer*/

	if (fading) {
		game.rects = draw_SCREENRECT;
		if (!sysvid.fader.update(timer, fading)) {
			// FIXME: return til not ended?
			fading = sysvid_fadeEnd();
		}
	} else {
  	r = draw_STATUSRECT; r.next = ent.rects;  /* refresh status bar too */
  	game.rects = r;  /* take care to cleanup draw_STATUSRECT->next later! */
	}
  if (!E_RICK_STTST(E_RICK_STZOMBIE)) {  /* need to scroll ? */
    if (ent.ents[1].y >= 0xCC) {
      game_state = SCROLL_UP;
      return;
    }
    if (ent.ents[1].y <= 0x60) {
      game_state = SCROLL_DOWN;
      return;
    }
  }

  game_state = PLAY0;
}


/*
 * restart
 *
 */
function
restart()
{
  E_RICK_STRST(E_RICK_STDEAD|E_RICK_STZOMBIE);

  game.bullets = 6;
  game.bombs = 6;

  ent.ents[1].n = 1;

  irestore();
  map_init();
  isave();
  ent_clprev();
  draw_map();
  draw_drawStatus();
  game.rects = draw_SCREENRECT;
}


/*
 * isave (0bbb)
 *
 */
function isave() {
  e_rick_save();
  isave_frow = map.frow;
}


/*
 * irestore (0bdc)
 *
 */
function
irestore()
{
  e_rick_restore();
  map.frow = isave_frow;
}

/*
 *
 */
function
loaddata()
{
//#ifdef ENABLE_SOUND
	/*
	 * Cache sounds
	 *
	 * tune[0-5].wav not cached
	 *//*
	WAV_GAMEOVER = syssnd_load("sounds/gameover.wav");
	WAV_SBONUS2 = syssnd_load("sounds/sbonus2.wav");
	WAV_BULLET = syssnd_load("sounds/bullet.wav");
	WAV_BOMBSHHT = syssnd_load("sounds/bombshht.wav");
	WAV_EXPLODE = syssnd_load("sounds/explode.wav");
	WAV_STICK = syssnd_load("sounds/stick.wav");
	WAV_WALK = syssnd_load("sounds/walk.wav");
	WAV_CRAWL = syssnd_load("sounds/crawl.wav");
	WAV_JUMP = syssnd_load("sounds/jump.wav");
	WAV_PAD = syssnd_load("sounds/pad.wav");
	WAV_BOX = syssnd_load("sounds/box.wav");
	WAV_BONUS = syssnd_load("sounds/bonus.wav");
	WAV_SBONUS1 = syssnd_load("sounds/sbonus1.wav");
	WAV_DIE = syssnd_load("sounds/die.wav");
	WAV_ENTITY[0] = syssnd_load("sounds/ent0.wav");
	WAV_ENTITY[1] = syssnd_load("sounds/ent1.wav");
	WAV_ENTITY[2] = syssnd_load("sounds/ent2.wav");
	WAV_ENTITY[3] = syssnd_load("sounds/ent3.wav");
	WAV_ENTITY[4] = syssnd_load("sounds/ent4.wav");
	WAV_ENTITY[5] = syssnd_load("sounds/ent5.wav");
	WAV_ENTITY[6] = syssnd_load("sounds/ent6.wav");
	WAV_ENTITY[7] = syssnd_load("sounds/ent7.wav");
	WAV_ENTITY[8] = syssnd_load("sounds/ent8.wav");*/
//#endif
}

/*
 *
 */
function
freedata()
{
//#ifdef ENABLE_SOUND
/*	syssnd_stopall();
	syssnd_free(WAV_GAMEOVER);
	syssnd_free(WAV_SBONUS2);
	syssnd_free(WAV_BULLET);
	syssnd_free(WAV_BOMBSHHT);
	syssnd_free(WAV_EXPLODE);
	syssnd_free(WAV_STICK);
	syssnd_free(WAV_WALK);
	syssnd_free(WAV_CRAWL);
	syssnd_free(WAV_JUMP);
	syssnd_free(WAV_PAD);
	syssnd_free(WAV_BOX);
	syssnd_free(WAV_BONUS);
	syssnd_free(WAV_SBONUS1);
	syssnd_free(WAV_DIE);
	syssnd_free(WAV_ENTITY[0]);
	syssnd_free(WAV_ENTITY[1]);
	syssnd_free(WAV_ENTITY[2]);
	syssnd_free(WAV_ENTITY[3]);
	syssnd_free(WAV_ENTITY[4]);
	syssnd_free(WAV_ENTITY[5]);
	syssnd_free(WAV_ENTITY[6]);
	syssnd_free(WAV_ENTITY[7]);
	syssnd_free(WAV_ENTITY[8]);*/
//#endif
}


/* eof */
