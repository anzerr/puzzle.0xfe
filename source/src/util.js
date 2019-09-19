
class Util {

	shouldLive(alive, count) {
		if (alive && (count === 2 || count === 3)) {
			return true;
		}

		if (!alive && count === 3) {
			return true;
		}

		return false;
	}

	check(grid, x, y) {
		return grid[x] && grid[x][y] === 1 ? 1 : 0;
	}

	neighbors(grid, x, y) {
		const checks = [
			this.check(grid, x - 1, y - 1),
			this.check(grid, x - 1, y),
			this.check(grid, x - 1, y + 1),

			this.check(grid, x, y - 1),
			this.check(grid, x, y + 1),

			this.check(grid, x + 1, y - 1),
			this.check(grid, x + 1, y),
			this.check(grid, x + 1, y + 1)
		];

		return checks.reduce((prev, current) => prev + current, 0);
	}

}

module.exports = new Util();
