import { ent } from "./ents";

export const E_RICK_NO = 1;
export function E_RICK_ENT() { return ent.ents[E_RICK_NO]; }

export const e_rick = {
	state: 0,
	stop_x: 0, stop_y: 0
};

export const E_RICK_STSTOP = 0x01;
export const E_RICK_STSHOOT = 0x02;
export const E_RICK_STCLIMB = 0x04;
export const E_RICK_STJUMP = 0x08;
export const E_RICK_STZOMBIE = 0x10;
export const E_RICK_STDEAD = 0x20;
export const E_RICK_STCRAWL = 0x40;

export function E_RICK_STSET(X) { e_rick.state |= (X) }
export function E_RICK_STRST(X) { e_rick.state &= ~(X) }
export function E_RICK_STTST(X) { return (e_rick.state & (X)) }
