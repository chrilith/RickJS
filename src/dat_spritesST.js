import { SPRITES_NBR_SPRITES } from "../include/sprites";

export const sprites_data = "spritesData";
export const sprites = {
	data: null
};

export function sprites_init(data) {
	sprites.data = new G.SpriteSheet(data).addSections(new G.Size(32, 21), SPRITES_NBR_SPRITES);
}
