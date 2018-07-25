const Command = require('command');
const Vec3 = require('tera-vec3');
const GameState = require('tera-game-state');

module.exports = function GhilliegladeHelper(dispatch) {
	const command = Command(dispatch);
	const game = GameState(dispatch);

	const chestIds = [81341, 81342];
	const data = {
		9713: {
			spawn: new Vec3(54997, 116171, 4517),
			redirect: new Vec3(52227, 117334, 4386),
			w: 1.6
		},
		7005: {
			spawn: new Vec3(-481, 6301, 1956),
			redirect: new Vec3(-341, 8665, 2180),
			w: -0.96
		}
	};

	let enabled = true;
	let reset = false;

	game.me.on('change_zone', (zone) => {
		if (!enabled) return;
		if (zone == 9714 && reset) {
			dispatch.toServer('C_RESET_ALL_DUNGEON', 1, {});
			reset = false;
			command.message('Ghillieglade reset.');
		}
	});

	dispatch.hook('S_SPAWN_ME', 3, event => {
		if (!enabled || !data[game.me.zone]) return;
		if (event.loc.equals(data[game.me.zone].spawn)) {
			event.loc = data[game.me.zone].redirect;
			event.w = data[game.me.zone].w;
		}
		return true;
	});

	dispatch.hook('S_SPAWN_NPC', 8, event => {
		if (!enabled) return;
		if (event.huntingZoneId == 713 && chestIds.includes(event.templateId)) {
			reset = true;
			command.message('Ghillieglade will be reset next time entering Velik Sanctuary.');
		}
	});

	dispatch.hook('C_RESET_ALL_DUNGEON', 1, event => {
		if (!enabled) return;
		if (game.me.zone == 9713) {
			reset = false;
			command.message('Ghillieglade was reset manually.');
		}
	});

	command.add('ggh', () => {
		enabled = !enabled;
		command.message('Ghillieglade Helper ' + enabled ? 'enabled.' : 'disabled.');
	});

	this.destructor = function() {
		command.remove('ggh');
	};
};
