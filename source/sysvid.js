/* const
 ********/
var	SYSVID_WIDTH	= 320;
	SYSVID_HEIGHT	= 200;

(function() {
	/* local
	 ********/
	var screen, buffer, scanlines = false;

	/* global
	 *********/
	Sysvid.SCREENRECT = new G.Rect(0, 0, SYSVID_WIDTH, SYSVID_HEIGHT);
	
	function init_screen(w, h/*, bpp, flags*/) {
		var s = new G.Screen(SYSVID_WIDTH, SYSVID_HEIGHT);
		G.Screen.setActive(s);
		s.enableFiltering(false);
		s.setStretch(s.STRETCH_UNIFORM);
		return s;
	}
	
	Sysvid.setPalette = function() {
	}

	Sysvid.restorePalette = function() {
	}
	
	Sysvid.setGamePalette = function() {
//		Sysvid.setPalette();
	}

	Sysvid.init = function() {
		screen = init_screen(SYSVID_WIDTH, SYSVID_HEIGHT);
		Sysvid.fb = new G.Surface(SYSVID_WIDTH, SYSVID_HEIGHT);
		buffer = Sysvid.fb;
		Sysvid.fader = new GE.Fader(Sysvid.fb, new G.Color(), 150);
	}
	
	Sysvid.fade_start = function() {
		Sysvid.fader.reset();
		buffer = Sysvid.fader.surface;
	}

	Sysvid.fade_end = function() {
		buffer = Sysvid.fb;
	}
	
	Sysvid.update = function(rects) {
		if (rects == null) {
			return;
		}
		screen.redraw(buffer, 0, 0, rects);
		screen.refresh();
	}

	Sysvid.toggle_scanlines = function(isOn) {
		scanlines = !scanlines;
		if (scanlines) {
			screen.setScanlines(50, 5);			
		} else {
			screen.setScanlines();
		}
	}

	Sysvid.clear = function() {
		Sysvid.fb.renderer.fillRect(null, new G.Color(0,0,0));
	}

/* EOF */
})();