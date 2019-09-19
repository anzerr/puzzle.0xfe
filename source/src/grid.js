
class Grid {

	constructor(sX, sY) {
		this.grid = {};
		for (let x = 0; x < sX; x++) {
			this.grid[x] = {};
			for (let y = 0; y < sY; y++) {
				this.grid[x][y] = 0;
			}
		}
		this.size = {width: sX, height: sY};
	}

}

module.exports = Grid;
