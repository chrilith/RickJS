import { rect_t } from "../include/rects";

/*
 * Free a list of rectangles and set the pointer to NULL.
 *
 * p: rectangle list CHANGED to NULL
 */
export function
rects_free(r) {
  if (r) {
    rects_free(r.next);
		r.next = null;
//    free(r);
  }
}

/*
 * Add a rectangle to a list of rectangles
 */
export function
rects_new(x, y, width, height, next)
{
  let r;

  r = rect_t(
		x,
		y,
		width,
		height,
		next
	);
  return r;
}

/* eof */
