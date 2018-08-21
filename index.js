const Vec3 = require('tera-vec3');
const config = require('./config.json');

module.exports = function GhilliegladeHelper(mod) {
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

  let enabled = config.enabled || true;
  let reset = false;

  mod.game.me.on('change_zone', (zone) => {
    if (!enabled) return;
    if (zone == 9714 && reset) {
      mod.send('C_RESET_ALL_DUNGEON', 1, {});
      reset = false;
      mod.command.message('Ghillieglade has been reset.');
    }
  });

  mod.hook('S_SPAWN_ME', 3, event => {
    if (!enabled || !data[mod.game.me.zone]) return;
    if (event.loc.equals(data[mod.game.me.zone].spawn)) {
      event.loc = data[mod.game.me.zone].redirect;
      event.w = data[mod.game.me.zone].w;
    }
    return true;
  });

  mod.hook('S_SPAWN_NPC', 9, event => {
    if (!enabled) return;
    if (event.huntingZoneId == 713 && chestIds.includes(event.templateId)) {
      reset = true;
      mod.command.message('Ghillieglade will be reset next time entering Velik Sanctuary.');
    }
  });

  mod.hook('C_RESET_ALL_DUNGEON', 1, event => {
    if (!enabled) return;
    if (mod.game.me.zone == 9713) {
      reset = false;
      mod.command.message('Ghillieglade was reset manually.');
    }
  });

  mod.command.add('ggh', {
    $default() {
      mod.command.message('Usage: /8 ggh - Turn module on/off.');
    },
    $none() {
      enabled = !enabled;
      mod.command.message(enabled ? 'Module enabled.' : 'Module disabled.');
    },
  })

  this.destructor = function() {
    mod.command.remove('ggh');
  };
};
