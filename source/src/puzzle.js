
const Game = require('./game.js'),
	bip = require('bip39'),
	fs = require('fs.promisify'),
	qr = require('qr.util'),
	account = require('banano.account'),
	crypto = require('crypto');

class Puzzle {

	constructor(solution) {
		this.maps = this.generate(8, solution);
		this.ref = {};
		for (let i in this.maps) {
			this.ref[i] = JSON.stringify(this.maps[i]);
		}
	}

	setup() {
		let runs = 1;
		while (runs) {
			this.words = this.getWords();
			let valid = true;
			for (let i in this.words.mnemonic) {
				let w = this.words.mnemonic[i], map = this.ref[w];
				for (let x in this.maps) {
					if (w !== x && map === this.ref[x]) {
						valid = false;
						break;
					}
				}
				if (!valid) {
					break;
				}
			}
			runs++;
			if (runs % 1000 === 0) {
				console.log(runs);
			}
			if (valid) {
				break;
			}
		}
		this.draw();
	}

	draw() {
		const scale = 10;
		let data = `<svg viewBox="0 0 ${32 * scale} ${32 * scale}" xmlns="http://www.w3.org/2000/svg">`;

		const hints = {
			text: 'I wake from my slumber 8 blinks of my eyes and life changes I have to find a way to claw back time?',
			player: Buffer.from('player 0 has joined the game'),
			color: [
				'#4200AB',
				'#000095',
				'#00ABFF',
				'#00C800',
				'#FFF800',
				'#FF7642',
				'#E40000'
			]
		};

		data += '<g>';
		let bin = this.stringBinary(hints.text), hintI = 0;
		for (let x in bin) {
			if (bin[x]) {
				let h = 16 * scale, n = Math.floor(x / h), id = hintI % hints.player.length, hex = hints.player[id].toString(16).padStart(2, '0');
				data += `<rect x="${(Number(x) % h) * 2}" y="${5 * scale * n}" width="${2}" height="${4 * scale}" style="fill:black;${hex}:${id};" />`;
				hintI++;
			}
		}
		data += '</g>';

		data += '<g>';
		let matrix = qr(this.words.account.account), offset = ((32 * scale) - matrix.length) - 10;
		for (let x in matrix) {
			for (let y in matrix[x]) {
				if (matrix[x][y]) {
					data += `<rect x="${offset + Number(x)}" y="${offset + Number(y)}" width="${1}" height="${1}" style="fill:black;" />`;
				}
			}
		}
		data += '</g>';

		for (let i in this.words.mnemonic) {
			data += '<g>';
			let w = this.words.mnemonic[i], map = this.maps[w];
			for (let x in map) {
				for (let y in map[x]) {
					if (map[x][y]) {
						data += `<rect x="${Number(x) * scale}" y="${Number(y) * scale}" width="${scale}" height="${scale}" style="fill:black;" />`;
					}
				}
			}
			data += '</g>';
		}

		data += '<g>';
		offset = (32 * scale) - 20;
		for (let x in hints.color) {
			data += `<rect x="${10 + Number(x)}" y="${offset}" width="${2}" height="${10}" style="fill:${hints.color[x]};" />`;
		}
		data += '</g>';

		return Promise.all([
			fs.writeFile('out.json', JSON.stringify(this.words, null, '\t')),
			fs.writeFile('out.svg', `${data}</svg>`)
		]);
	}

	toBinary(num, pad = 8) {
		return num.toString(2).padStart(pad, '0').split('').map((a) => Number(a));
	}

	stringBinary(text, pad = 8) {
		let bin = [];
		text = Buffer.isBuffer(text) ? text : Buffer.from(text);
		for (let i = 0; i < text.length; i++) {
			bin = bin.concat(this.toBinary(text[i], pad));
		}
		return bin;
	}

	generate(steps = 8) {
		const map = {};
		for (let x in bip.wordlists.english.array) {
			let game = new Game(32, 32), id = bip.wordlists.english.array[x];
			let word = Buffer.from(id), seed = [];
			for (let i = 0; i < word.length; i++) {
				seed.push(word[i].toString(2).padStart(8, '0').split('').map((a) => Number(a)));
			}
			game.seed(seed);

			for (let i = 0; i < steps; i++) {
				game.update();
			}
			map[id] = game.grid.grid;
		}
		return map;
	}

	getWords() {
		let entropy = crypto.randomBytes(32).toString('hex'),
			mnemonic = bip.entropy.toMnemonic(entropy),
			acc = account.create(entropy, 0);
		return {
			entropy: entropy,
			mnemonic: mnemonic,
			account: acc
		};
	}

}

module.exports = Puzzle;
