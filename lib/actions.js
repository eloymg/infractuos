const { GameHelpers } = require('./helpers');

actions = {
    moveBug: function(player, action, game) {
        if(player.role != "bug") {
            console.log("Trying to cheat?");
            return;
        };

        const dir = action.direction;

        // Move the player to the new position

        if(dir == "left" && player.pos_x > 0) {
            player.pos_x -= 1;
        }
        else if(dir == "right" && player.pos_x < game.x_tiles - 1) {
            player.pos_x += 1;

        }
        else if(dir == "down" && player.pos_y < game.y_tiles - 1) {
            player.pos_y += 1;
        }
        else if(dir == "up" && player.pos_y > 0) {
            player.pos_y -= 1;
        }

        // Check if the player collides with a plant
        const plant = GameHelpers.cellHasPlant(player.pos_x, player.pos_y, game); 
        if(plant) {
            player.score += 1;
            plant.to_delete = true;
        }

        console.log("Player updated", player);
    }
}

module.exports = { actions };
