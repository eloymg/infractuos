const { actions } = require("./actions")

class Player {
    constructor(id, game) {
        this.id = id;
        this.pos_x = Math.floor(Math.random() * game.x_tiles);
        this.pos_y = Math.floor(Math.random() * game.y_tiles);
        this.role = 'bug';
        this.alive = true;
        this.score = 0;
    }
}

class Plant {
    constructor(pos_x, pos_y, type) {
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.type = type;
        this.to_delete = false;
    }
}

class Game {
    constructor() {
        this.init();
        this.x_tiles = 64;
        this.y_tiles = 40;
    }

    init() {
        this.playing = true;
        this.players = {};
        this.actions = {};
        this.plants = {};
    }

    addPlayer(id) {
        this.players[id] = new Player(id, this);
    }

    initPlants(){
        for (let x=0; x<this.x_tiles ; x++){
            for (let y=0; y<this.y_tiles ; y++){
                if(Math.random() < 0.025) {
                    if(!(x in this.plants)) {
                        this.plants[x] = {};
                    }
                    this.plants[x][y] = new Plant(x, y,'plant' + ( Math.floor(Math.random() * 3)+1));
                }
            }
        }
    }

    startGame() {
        this.initPlants();
        console.log(this.plants);
    }

    addAction(id, action_data) {
        if(!this.playing) return;
        if(!this.players[id].alive) return;

        this.actions[id] = action_data;
    }

    update(delta) {
        if(this.playing) {
            for(const id_player in this.actions) {
                const player = this.players[id_player];
                const action = this.actions[id_player];

                actions[action.type](player, action, this);
            }

            for(const x in this.plants) {
                for(const y in this.plants[x]) {
                    const plant = this.plants[x][y];
                    if(plant.to_delete) {
                        delete this.plants[x][y];
                    }
                }
            }
        }

        this.actions = {};

        return {plants: this.plants, players: this.players};
    }
    
}

module.exports = { Game }