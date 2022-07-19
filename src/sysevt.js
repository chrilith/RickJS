import { control } from "./control";
import { CONTROL_UP, CONTROL_DOWN, CONTROL_LEFT, CONTROL_RIGHT,
				 CONTROL_PAUSE, CONTROL_END, CONTROL_FIRE } from "../include/control";

const MAN = G.EventManager;
const event_man = new G.EventManager(MAN.BIT_KEYBOARD);

function SETBIT(b) { control.status |= (b); }
function CLRBIT(b) { control.status &= ~(b); }

/*
 * Process an event
 */
function
processEvent(event)
{
	let key;
	const E = G.Event;

	switch (event.type) {
		case E.KEYDOWN:
			key = event.keyCode;
			if (key == E.K_UP) {
				SETBIT(CONTROL_UP);
				control.last = CONTROL_UP;

			} else if (key == E.K_DOWN) {
				SETBIT(CONTROL_DOWN);
				control.last = CONTROL_DOWN;

			} else if (key == E.K_LEFT) {
				SETBIT(CONTROL_LEFT);
				control.last = CONTROL_LEFT;

			} else if (key == E.K_RIGHT) {
				SETBIT(CONTROL_RIGHT);
				control.last = CONTROL_RIGHT;

			} else if (key == 'P'.charCodeAt(0)) {
				SETBIT(CONTROL_PAUSE);
				control.last = CONTROL_PAUSE;

			} else if (key == E.K_ESCAPE) {
				SETBIT(CONTROL_END);
				control.last = CONTROL_END;
/*
			} else if (key == syskbd_xtra) {
				SETBIT(CONTROL_EXIT);
				Control.last = CONTROL_EXIT;
*/
			} else if (key == E.K_SPACE) {
				SETBIT(CONTROL_FIRE);
				control.last = CONTROL_FIRE;
			}
/*
			else if (key == SDLK_F1) {
				sysvid_toggleFullscreen();
			}
			else if (key == SDLK_F2) {
				sysvid_zoom(-1);
			}
			else if (key == SDLK_F3) {
				sysvid_zoom(+1);
			}
	#ifdef ENABLE_SOUND
			else if (key == SDLK_F4) {
				syssnd_toggleMute();
			}
			else if (key == SDLK_F5) {
				syssnd_vol(-1);
			}
			else if (key == SDLK_F6) {
				syssnd_vol(+1);
			}
	#endif
	#ifdef ENABLE_CHEATS
			else if (key == SDLK_F7) {
				game_toggleCheat(1);
			}
			else if (key == SDLK_F8) {
				game_toggleCheat(2);
			}
			else if (key == SDLK_F9) {
				game_toggleCheat(3);
			}
	#endif
*/
		break;

		case E.KEYUP:
			key = event.keyCode;

			if (key == E.K_UP) {
				CLRBIT(CONTROL_UP);
				control.last = CONTROL_UP;

			} else if (key == E.K_DOWN) {
				CLRBIT(CONTROL_DOWN);
				control.last = CONTROL_DOWN;

			} else if (key == E.K_LEFT) {
				CLRBIT(CONTROL_LEFT);
				control.last = CONTROL_LEFT;

			} else if (key == E.K_RIGHT) {
				CLRBIT(CONTROL_RIGHT);
				control.last = CONTROL_RIGHT;

			} else if (key == 'P'.charCodeAt(0)) {
				CLRBIT(CONTROL_PAUSE);
				control.last = CONTROL_PAUSE;

			} else if (key == 'S'.charCodeAt(0)) {
				sysvid.toggle_scanlines();

			} else if (key == E.K_ESCAPE) {
				CLRBIT(CONTROL_END);
				control.last = CONTROL_END;
/*
			} else if (key == syskbd_xtra) {
				CLRBIT(CONTROL_EXIT);
				Control.last = CONTROL_EXIT;
*/
			} else if (key == E.K_SPACE) {
				CLRBIT(CONTROL_FIRE);
				control.last = CONTROL_FIRE;
			}
			break;
		default:
			break;
	}
}

/*
 * Process events, if any, then return
 */
export function
sysevt_poll()
{
	let e;

	while ((e = event_man.poll())) {
		processEvent(e);
	}
}

/*
 * Wait for an event, then process it and return
 */
export function
sysevt_wait()
{
	sysevt_poll();
}

/* eof */
