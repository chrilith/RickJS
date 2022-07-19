import { create_struct } from "../src/c";

export const SCREEN_TIMEOUT = 4000;
export const SCREEN_RUNNING = 0;
export const SCREEN_DONE = 1;
export const SCREEN_EXIT = 2;

const struct_screen_imapsteps_t = [
  "count",  /* number of loops */
  "dx", "dy",  /* sprite x and y deltas */
  "base"  /* base for sprite numbers table */
];  /* description of one step */
export function screen_imapsteps_t(...values) {
	return create_struct(struct_screen_imapsteps_t, values);
}
