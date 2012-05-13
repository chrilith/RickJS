/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/scr_imain.c
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

/*
 * constants
 */
var LEFT = 1,
	RIGHT = 0,

	GAME_PERIOD = 75,

	GAME_BOMBS_INIT = 6,
	GAME_BULLETS_INIT = 6;

(function() {
	
	/*
	 * local typedefs
	 */
	var XRICK = 0,
		INIT_GAME = 1,
		INIT_BUFFER = 2,
		INTRO_MAIN = 3,
		INTRO_MAP = 4,
		PAUSE_PRESSED1 = 5,
		PAUSE_PRESSED1B = 6,
		PAUSED = 7,
		PAUSE_PRESSED2 = 8,
		PLAY0 = 9,
		PLAY1 = 10,
		PLAY2 = 11,
		PLAY3 = 12,
		CHAIN_SUBMAP = 13,
		CHAIN_MAP = 14,
		CHAIN_END = 15,
		SCROLL_UP = 16,
		SCROLL_DOWN = 17,
		RESTART = 18,
		GAMEOVER = 19,
		GETNAME = 20,
		EXIT = 21;	// game_state_t

	/*
	 * global vars
	 */
	Game.period = 0;
	Game.waitevt = false;
	Game.rects = null;

	Game.lives = 0;
	Game.bombs = 0;
	Game.bullets = 0;
	Game.score = 0;
	
	Game.map = 0;
	Game.submap = 0;

	Game.dir = 0;
	Game.chsm = false;
	
	Game.cheat1 = 0;
	Game.cheat2 = 0;
	Game.cheat3 = 0;
	
	Game.hscores = [
		{ score: 8000, name: "SIMES@@@@@" },
		{ score: 7000, name: "JAYNE@@@@@" },
		{ score: 6000, name: "DANGERSTU@" },
		{ score: 5000, name: "KEN@@@@@@@" },
		{ score: 4000, name: "ROB@N@BOB@" },
		{ score: 3000, name: "TELLY@@@@@" },
		{ score: 2000, name: "NOBBY@@@@@" },
		{ score: 1000, name: "JEZEBEL@@@" }
	];

	/*
	 * local vars
	 */
	var isave_frow,
		game_state,
		fading;
	
	/*
	 * Main loop
	 */
	Game.run = function() {
//		var tm, tmx = 0;

		//loaddata(); /* load cached data */

		Game.period = /*sysarg_args_period ? sysarg_args_period :*/ GAME_PERIOD;
//		tm = Sys.gettime();
		game_state = XRICK;
		
		/* main loop */
		Game.timer = new G.Timer(gameLoop, 30, 0);
		Game.timer.start(true);

		function gameLoop(timer) {
			/* timer */
//			tmx = tm; tm = sys_gettime(); tmx = tm - tmx;
//			if (tmx < game_period) sys_sleep(game_period - tmx);
// TODO: Timer is handled by G.Timer, should change frame rate based on Game.period

			/* video */
			Sysvid.update(Game.rects);
//			draw_STATUSRECT.next = NULL;  /* FIXME freerects should handle this */

			/* events */
			if (Game.waitevt) {
				Sysevt.wait();  /* wait for an event */
			} else {
				Sysevt.poll();  /* process events (non-blocking) */
			}

			/* frame */
			frame(timer);
		}

//		freedata(); /* free cached data */
	}
	
	/*
	 * Prepare frame
	 *
	 * This function loops forever: use 'return' when a frame is ready.
	 * When returning, game_rects must contain every parts of the buffer
	 * that have been modified.
	 */
	function frame(timer) {
		while (1) {
			switch (game_state) {
				case XRICK:
					switch(Screen.xrick()) {
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
					switch (Screen.introMain(timer)) {
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
					switch (Screen.introMap(timer)) {
						case SCREEN_RUNNING:
							return;
						case SCREEN_DONE:
							Game.waitevt = false;
							game_state = INIT_BUFFER;
							break;
						case SCREEN_EXIT:
							game_state = EXIT;
							return;
					}
					break;

					
				case INIT_BUFFER:
					Sysvid.clear();					/* clear buffer */
					Draw.map();						/* draw the map onto the buffer */
					Draw.drawStatus();				/* draw the status bar onto the buffer */
					Game.rects = [Draw.SCREENRECT];	/* request full buffer refresh */
					game_state = PLAY0;
					fading = GE.IN;
					Sysvid.fade_start();
					return;


				case PAUSE_PRESSED1:
					Screen.pause(true);
					game_state = PAUSE_PRESSED1B;
					break;

					
				case PAUSE_PRESSED1B:
					if (Control.status & CONTROL_PAUSE) {
						return;
					}
					game_state = PAUSED;
					break;


				case PAUSED:
					if (Control.status & CONTROL_PAUSE) {
						game_state = PAUSE_PRESSED2;
					}
					if (Control.status & CONTROL_EXIT) {
						game_state = EXIT;
					}
					return;


				case PAUSE_PRESSED2:
					if (!(Control.status & CONTROL_PAUSE)) {
						Game.waitevt = false;
						Screen.pause(false);
			//			syssnd_pause(FALSE, FALSE);
						game_state = PLAY2;
					}
					return;

	
				case PLAY0:
					play0();
					break;


				case PLAY1:
					if (Control.status & CONTROL_PAUSE) {
						Game.waitevt = true;
						game_state = PAUSE_PRESSED1;
					} else if (Control.active == false) {
						Game.waitevt = true;
						Screen.pause(true);
						game_state = PAUSED;
					} else {
						game_state = PLAY2;
					}
					break;

					
				case PLAY2:
					if (E_RICK_STTST(E_RICK_STDEAD)) {  /* rick is dead */
						if (Game.cheat1 || --Game.lives) {
							game_state = RESTART;
						} else {
							game_state = GAMEOVER;
						}
					} else if (Game.chsm) { /* request to chain to next submap */
						game_state = CHAIN_SUBMAP;
					} else {
						game_state = PLAY3;
					}
					break;
					
				case PLAY3:
					play3(timer);
					return;


				case CHAIN_SUBMAP:
					if (Map.chain())
						game_state = CHAIN_END;
					else {
						Game.bullets = 0x06;
						Game.bombs = 0x06;
						Game.map++;
					
						if (Game.map == 0x04) {
							/* reached end of game */
							/* FIXME @292?*/
						}
					
						game_state = CHAIN_MAP;
					}
					break;

				case CHAIN_MAP:
					switch (Screen.introMap()) {
						case SCREEN_RUNNING:
							return;
			
						case SCREEN_DONE:
							if (Game.map >= 0x04) {  /* reached end of game */
								Sysarg.args_map = 0;
								Sysarg.args_submap = 0;
								game_state = GAMEOVER;
			
							} else {  /* initialize game */
								Ent.ents[1].x = Map.maps[Game.map].x;
								Ent.ents[1].y = Map.maps[Game.map].y;
								map_frow = Map.maps[Game.map].row & 0xFF; // (U8)Map...
								Game.submap = Map.maps[Game.map].submap;
								game_state = CHAIN_END;
							}
							break;
						case SCREEN_EXIT:
							game_state = EXIT;
							return;
					}
					break;


				case CHAIN_END:
					Map.init();                     /* initialize the map */
					isave();                        /* save data in case of a restart */
					Ent.clprev();                   /* cleanup entities */
					Draw.map();                     /* draw the map onto the buffer */
					Draw.drawStatus();              /* draw the status bar onto the buffer */
					Game.rects = [Draw.SCREENRECT];  /* request full screen refresh */
					game_state = PLAY0;
					return;

	
				case SCROLL_UP:
					switch (Scroll.up()) {
						case SCROLL_RUNNING:
							return;
						case SCROLL_DONE:
							game_state = PLAY0;
							break;
					}
					break;

				
				case SCROLL_DOWN:
					switch (Scroll.down()) {
						case SCROLL_RUNNING:
							return;
						case SCROLL_DONE:
							game_state = PLAY0;
							break;
					}
					break;;

	
				case RESTART:
					restart();
					game_state = PLAY0;
					return;

	
				case GAMEOVER:
					switch (Screen.gameover()) {
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
					switch (Screen.getname()) {
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
	function init() {
		
		E_RICK_STRST(0xff);
		
		Game.lives = 6;
		Game.bombs = 6;
		Game.bullets = 6;
		Game.score = 0;

		Game.map = Sysarg.args_map;

		if (Sysarg.args_submap == 0) {
			Game.submap = Map.maps[Game.map].submap;
			Map.frow = Map.maps[Game.map].row;
		} else {
			// dirty hack to determine frow //
			Game.submap = Sysarg.args_submap;
			i = 0;
			while (i < MAP_NBR_CONNECT &&
				(Map.connect[i].submap != Game.submap ||
					Map.connect[i].dir != RIGHT)) {
				i++;
			}
			Map.frow = Map.connect[i].rowin - 0x10;
			Ent.ents[1].y = 0x10 << 3;
		}

		Ent.ents[1].x = Map.maps[Game.map].x;
		Ent.ents[1].y = Map.maps[Game.map].y;
		Ent.ents[1].w = 0x18;
		Ent.ents[1].h = 0x15;
		Ent.ents[1].n = 0x01;
		Ent.ents[1].sprite = 0x01;
		Ent.ents[1].front = false;
		Ent.ents[ENT_ENTSNUM].n = 0xFF;

		Map.resetMarks();

		Map.init();
		isave();
	}
	
	/*
	 * play0
	 *
	 */
	function play0() {

		if (Control.status & CONTROL_END) {  /* request to end the game */
			game_state = GAMEOVER;
			return;
		}
		
		if (Control.last == CONTROL_EXIT) {  /* request to exit the game */
			game_state = EXIT;
			return;
		}
		
		Ent.action();      /* run entities */
		EThem.rndseed++;  /* (0270) */

		game_state = PLAY1;
	}

	/*
	 * play3
	 *
	 */
	var static_r;	// static
	function play3(timer) {
	
		Draw.clearStatus();  /* clear the status bar */
		Ent.draw();          /* draw all entities onto the buffer */
		/* sound */
		Draw.drawStatus();   /* draw the status bar onto the buffer*/

		if (fading) {
			Game.rects = [Draw.SCREENRECT];
			if (!Sysvid.fader.update(timer, fading)) {
				fading = Sysvid.fade_end();
			}			
		} else {
			static_r = [Draw.STATUSRECT]; static_r.push.apply(static_r, Ent.rects);  /* refresh status bar too */
			Game.rects = static_r;//[Draw.SCREENRECT];  /* take care to cleanup draw_STATUSRECT->next later! */
		}

		if (!E_RICK_STTST(E_RICK_STZOMBIE)) {  /* need to scroll ? */
			if (Ent.ents[1].y >= 0xCC) {
				game_state = SCROLL_UP;
				return;
			}
			if (Ent.ents[1].y <= 0x60) {
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
	function restart() {
		E_RICK_STRST(E_RICK_STDEAD|E_RICK_STZOMBIE);
		
		Game.bullets = 6;
		Game.bombs = 6;
		
		Ent.ents[1].n = 1;
	
		irestore();
		Map.init();
		isave();
		Ent.clprev();
		Draw.map();
		Draw.drawStatus();
		Game.rects = [Draw.SCREENRECT];
	}

	/*
	 * isave (0bbb)
	 *
	 */
	function isave() {
		ERick.save();
		isave_frow = Map.frow;
	}

	/*
	 * irestore (0bdc)
	 *
	 */
	function irestore() {
		ERick.restore();
		Map.frow = isave_frow;
	}
	
/* EOF */
})();
