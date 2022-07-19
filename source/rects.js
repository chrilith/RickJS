(function() {

	/*
	 * Free a list of rectangles and set the pointer to NULL.
	 *
	 * p: rectangle list CHANGED to NULL
	 */
	Rects.free = function(r) {
		if (r) {
			r.splice(0, r.length);
		}
	}

	/*
	 * Add a rectangle to a list of rectangles
	 */
	Rects.create = function(x, y, width, height, next) {	// was new()
		var r;

		r = new G.Rect(x, y, width, height);
		next = next || [];
		next.unshift(r);
		return next;
	}

/* EOF */
})();
