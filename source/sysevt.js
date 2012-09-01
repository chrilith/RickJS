
(function() {
	/* local
	 ********/
	var MAN = G.EventManager,
		eventMan = new G.EventManager(MAN.BIT_KEYBOARD|MAN.BIT_KBICADE);
	
	function SETBIT(b) {
		Control.status |= (b);
	}
	function CLRBIT(b) {
		Control.status &= ~(b);
	}
	
	function processEvent(event) {
		var key, E = G.Event;
		
		switch (event.type) {
			case E.KEYDOWN:
				key = event.keyCode;

				if (key == E.K_UP || key == E.K_ICADE_UP) {
					SETBIT(CONTROL_UP);
					Control.last = CONTROL_UP;

				} else if (key == E.K_DOWN || key == E.K_ICADE_DOWN) {
					SETBIT(CONTROL_DOWN);
					Control.last = CONTROL_DOWN;

				} else if (key == E.K_LEFT || key == E.K_ICADE_LEFT) {
					SETBIT(CONTROL_LEFT);
					Control.last = CONTROL_LEFT;

				} else if (key == E.K_RIGHT || key == E.K_ICADE_RIGHT) {
					SETBIT(CONTROL_RIGHT);
					Control.last = CONTROL_RIGHT;

				} else if (key == 'P'.charCodeAt(0) || key == E.K_ICADE_FIRE4) {
					SETBIT(CONTROL_PAUSE);
					Control.last = CONTROL_PAUSE;

				} else if (key == E.K_ESCAPE || key == E.K_ICADE_FIREX2) {
					SETBIT(CONTROL_END);
					Control.last = CONTROL_END;
/*
				} else if (key == syskbd_xtra) {
					SETBIT(CONTROL_EXIT);
					Control.last = CONTROL_EXIT;
*/
				} else if (key == E.K_SPACE || key == E.K_ICADE_FIRE1) {
					SETBIT(CONTROL_FIRE);
					Control.last = CONTROL_FIRE;
				}
				break;

			case E.KEYUP:
				key = event.keyCode;

				if (key == E.K_UP || key == E.K_ICADE_UP) {
					CLRBIT(CONTROL_UP);
					Control.last = CONTROL_UP;

				} else if (key == E.K_DOWN || key == E.K_ICADE_DOWN) {
					CLRBIT(CONTROL_DOWN);
					Control.last = CONTROL_DOWN;

				} else if (key == E.K_LEFT || key == E.K_ICADE_LEFT) {
					CLRBIT(CONTROL_LEFT);
					Control.last = CONTROL_LEFT;

				} else if (key == E.K_RIGHT || key == E.K_ICADE_RIGHT) {
					CLRBIT(CONTROL_RIGHT);
					Control.last = CONTROL_RIGHT;

				} else if (key == 'P'.charCodeAt(0) || key == E.K_ICADE_FIRE4) {
					CLRBIT(CONTROL_PAUSE);
					Control.last = CONTROL_PAUSE;

				} else if (key == 'S'.charCodeAt(0) || key == E.K_ICADE_FIREX1) {
					Sysvid.toggle_scanlines();

				} else if (key == E.K_ESCAPE || key == E.K_ICADE_FIREX2) {
					CLRBIT(CONTROL_END);
					Control.last = CONTROL_END;
/*
				} else if (key == syskbd_xtra) {
					CLRBIT(CONTROL_EXIT);
					Control.last = CONTROL_EXIT;
*/
				} else if (key == E.K_SPACE || key == E.K_ICADE_FIRE1) {
					CLRBIT(CONTROL_FIRE);
					Control.last = CONTROL_FIRE;
				}
				break;
		}
	}

	/* global
	 *********/
	Sysevt.poll = function() {
		var e;
		while ((e = eventMan.poll())) {
			processEvent(e);
		}
	}
	
	Sysevt.wait = function() {
		Sysevt.poll();
	}

/* EOF */
})();