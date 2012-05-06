(function() {
	
	var timer;
	
	/*
	 * Return number of microseconds elapsed since first call
	 */
	var ticks_base = 0;	// static
	Sys.gettime = function() {
		var ticks;
		
		ticks = Date.now();
		
		if (!ticks_base) {
			ticks_base = ticks;
		}
	
		return ticks - ticks_base;
	}

	/*
	* Sleep a number of microseconds
	*/
	Sys.sleep = function(s) {
//		Game.timer.sleep(s);
	}

	/*
	 * Initialize system
	 */
	Sys.init = function() {
		Gamalto.setMainContainer("container");
		Sysvid.init();
	}

/* EOF */
})();