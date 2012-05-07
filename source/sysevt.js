
(function() {
	/* local
	 ********/
	var MAN = G.EventManager,
		eventMan = new G.EventManager(MAN.BIT_KEYBOARD);
	
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

				if (key == E.K_UP) {
					SETBIT(CONTROL_UP);
					Control.last = CONTROL_UP;

				} else if (key == E.K_DOWN) {
					SETBIT(CONTROL_DOWN);
					Control.last = CONTROL_DOWN;

				} else if (key == E.K_LEFT) {
					SETBIT(CONTROL_LEFT);
					Control.last = CONTROL_LEFT;

				} else if (key == E.K_RIGHT) {
					SETBIT(CONTROL_RIGHT);
					Control.last = CONTROL_RIGHT;

				} else if (key == 'P'.charCodeAt(0)) {
					SETBIT(CONTROL_PAUSE);
					Control.last = CONTROL_PAUSE;

				} else if (key == E.K_ESCAPE) {
					SETBIT(CONTROL_END);
					Control.last = CONTROL_END;
/*
				} else if (key == syskbd_xtra) {
					SETBIT(CONTROL_EXIT);
					Control.last = CONTROL_EXIT;
*/
				} else if (key == E.K_SPACE) {
					SETBIT(CONTROL_FIRE);
					Control.last = CONTROL_FIRE;
				}
				break;

			case E.KEYUP:
				key = event.keyCode;

				if (key == E.K_UP) {
					CLRBIT(CONTROL_UP);
					Control.last = CONTROL_UP;

				} else if (key == E.K_DOWN) {
					CLRBIT(CONTROL_DOWN);
					Control.last = CONTROL_DOWN;

				} else if (key == E.K_LEFT) {
					CLRBIT(CONTROL_LEFT);
					Control.last = CONTROL_LEFT;

				} else if (key == E.K_RIGHT) {
					CLRBIT(CONTROL_RIGHT);
					Control.last = CONTROL_RIGHT;

				} else if (key == 'P'.charCodeAt(0)) {
					CLRBIT(CONTROL_PAUSE);
					Control.last = CONTROL_PAUSE;

				} else if (key == 'S'.charCodeAt(0)) {
					Sysvid.toggle_scanlines();

				} else if (key == E.K_ESCAPE) {
					CLRBIT(CONTROL_END);
					Control.last = CONTROL_END;
/*
				} else if (key == syskbd_xtra) {
					CLRBIT(CONTROL_EXIT);
					Control.last = CONTROL_EXIT;
*/
				} else if (key == E.K_SPACE) {
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