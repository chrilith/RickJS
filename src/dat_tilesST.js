
export const tiles_data = "tilesData";
export const tiles = {
	data: []
};

export function tiles_init(data) {
	const size = new G.Size(8, 8);
	tiles.data[0] = new G.TileSet(data, size).addSections(256, new G.Rect(0, 0 * 8 * 256, 8, 8 * 256));
	tiles.data[1] = new G.TileSet(data, size).addSections(256, new G.Rect(0, 1 * 8 * 256, 8, 8 * 256));
	tiles.data[2] = new G.TileSet(data, size).addSections(256, new G.Rect(0, 2 * 8 * 256, 8, 8 * 256));
}
