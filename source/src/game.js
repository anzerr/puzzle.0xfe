
const Grid = require('./grid.js'),
	util = require('./util.js');

class Game {

	constructor(x = 64, y = 64) {
		this.grid = new Grid(x, y);
		this.tick = 0;
	}

	seed(seed) {
		const s = [
			Math.floor(this.grid.size.width / 2),
			Math.floor(this.grid.size.height / 2),
			Math.floor(seed[0].length / 2),
			Math.floor(seed.length / 2)
		];
		let offset = [s[0] - s[2], s[1] - s[3]];
		for (let x = 0; x < seed.length; x++) {
			for (let y = 0; y < seed[0].length; y++) {
				this.grid.grid[offset[0] + x][offset[1] + y] = seed[x][y];
			}
		}
		return this;
	}

	update() {
		const next = {}, grid = this.grid.grid;
		for (let x in grid) {
			next[x] = {};
			for (let y in grid[x]) {
				const count = util.neighbors(grid, Number(x), Number(y));
				next[x][y] = util.shouldLive((grid[x][y] === 1), count) ? 1 : 0;
			}
		}
		this.grid.grid = next;
	}

	draw() {
		const grid = this.grid.grid;
		for (let x in grid) {
			for (let y in grid) {
				if (grid[x][y]) {
					process.stdout.write('1');
				} else {
					process.stdout.write('0');
				}
			}
			process.stdout.write('\n');
		}
		process.stdout.write('\n');
	}

}

module.exports = Game;
