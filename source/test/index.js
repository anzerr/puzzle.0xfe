
const fs = require('fs.promisify'),
	bip = require('bip39'),
	Puzzle = require('../src/puzzle.js'),
	assert = require('assert'),
	account = require('banano.account'),
	solution = require('../out.json');

const puzzle = new Puzzle(solution.mnemonic);

fs.readFile('out.svg').then((res) => {
	return res.toString().match(/<g>.*?<\/g>/g);
}).then((data) => {
	for (let i in data) {
		data[i] = data[i].match(/<[a-z]+\s.*?\/>/g);
	}

	let map = [], r = [];
	for (let i in data[0]) {
		let o = data[0][i].match(/x="(\d+)"\sy="(\d+)".*black;([0-9a-f]+):(\d+)/), row = {
			x: Number(o[1]),
			y: Number(o[2]),
			r: parseInt(o[3], 16),
			v: Number(o[4]),
		};
		r[row.v] = row.r;
		let n = Math.floor((row.x / 2) / 8), offset = (row.y / 50) * 160;
		for (let x = 0; x <= 8; x++) {
			if (!map[(n * 8) + offset + x]) {
				map[(n * 8) + offset + x] = 0;
			}
		}
		map[(row.x / 2) + offset] = 1;
	}

	map = map.join('').match(/.{8}/g);

	let out = Buffer.alloc(map.length);
	for (let i = 0; i < map.length; i++) {
		out[i] = parseInt(map[i], 2);
	}
	assert.equal(out.toString(), 'I wake from my slumber 8 blinks of my eyes and life changes I have to find a way to claw back time?');
	assert.equal(Buffer.from(r).toString(), 'player 0 has joined the game');

	map = {};
	let words = [];
	for (let i = 2; i < data.length - 1; i++) {
		let m = {};
		for (let x = 0; x < 32; x++) {
			m[x] = {};
			for (let y = 0; y < 32; y++) {
				m[x][y] = 0;
			}
		}
		for (let x in data[i]) {
			let o = data[i][x].match(/x="(\d+)"\sy="(\d+)"/);
			m[Math.floor(Number(o[1] / 10))][Math.floor(Number(o[2] / 10))] = 1;
		}
		m = JSON.stringify(m);
		let word = null;
		for (let x in puzzle.ref) {
			if (puzzle.ref[x] === m) {
				word = x;
				break;
			}
		}
		if (word) {
			words.push(word);
		}
	}

	assert.deepEqual(words, solution.mnemonic);
	assert.equal(bip.mnemonic.toEntropy(words.join(' ')), solution.account.seed);
	assert.equal(account.create(bip.mnemonic.toEntropy(words.join(' ')), 0).account, solution.account.account);
}).catch((err) => {
	console.log(err);
	process.exit(1);
});
