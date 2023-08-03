class GameHelpers {
    static cellHasPlant(pos_x, pos_y, game) {
        for(const x in game.plants) {
            for(const y in game.plants[x]) {
                const plant = game.plants[x][y];
                const diff_x = plant.pos_x - pos_x;
                const diff_y = plant.pos_y - pos_y;
                if(diff_x >= 0 && diff_x < 2 && diff_y >= 0 && diff_y < 2) {
                    return plant;
                }
            }
        }
        return null;
    }
}

module.exports = {GameHelpers}