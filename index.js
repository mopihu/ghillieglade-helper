const Command = require('command');
const Vec3 = require('tera-vec3');

module.exports = function GhilliegladeHelper(dispatch) {
  const command = Command(dispatch);

  const ghillieSpawn = new Vec3(54997, 116171, 4517);
  const ghillieBridge = new Vec3(52227, 117334, 4386);
  const velikaSpawn = new Vec3(-481, 6301, 1956);
  const velikaBank = new Vec3(-341, 8665, 2180);

  const chestIds = [81341, 81342];

  let enabled = true;
  let canReset = false;
  let currentZone;

  dispatch.hook('S_LOAD_TOPO', 3, event => {
    currentZone = event.zone;
    if (enabled && currentZone == 9714 && canReset) {
      dispatch.toServer('C_RESET_ALL_DUNGEON', 1, {});
      canReset = false;
      command.message('Ghillieglade reset.');
    }
  });

  dispatch.hook('S_SPAWN_ME', 2, event => {
    if (enabled && currentZone == 9713 && event.loc.equals(ghillieSpawn)) {
      event.loc = ghillieBridge;
      event.w = 1.6;
    } else if (enabled && currentZone == 7005 && event.loc.equals(velikaSpawn)) {
      event.loc = velikaBank;
    }
    return true;
  });

  dispatch.hook('S_SPAWN_NPC', 8, event => {
    if (enabled && event.huntingZoneId == 713 && chestIds.includes(event.templateId)) {
      canReset = true;
      command.message('Ghillieglade will be reset next time entering Velik Sanctuary.');
    }
  });

  dispatch.hook('C_RESET_ALL_DUNGEON', 1, event => {
    if (enabled && currentZone == 9713) {
      canReset = false;
      command.message('Ghillieglade was reset manually.');
    }
  });

  command.add('ggh', () => {
    enabled = !enabled;
    command.message(enabled ? 'Ghillieglade Helper enabled.' : 'Ghillieglade Helper disabled.');
  });

  this.destructor = function() {
    command.remove('ggh');
  };
};