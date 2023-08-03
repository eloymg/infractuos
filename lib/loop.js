
function startLoop(game, socket) {
    const tickLengthMs = 1000 / 20
    var previousTick = Date.now()
    var actualTicks = 0

    const gameLoop = () => {
        var now = Date.now()

        actualTicks++
        if (previousTick + tickLengthMs <= now) {
            const delta = (now - previousTick) / 1000
            previousTick = now

            const new_state = game.update(delta);
            socket.emit("updateState", new_state);

            //console.log('delta', delta, '(target: ' + tickLengthMs +' ms)', 'node ticks', actualTicks)
            actualTicks = 0;
        }

        if (now - previousTick + 16 < tickLengthMs) {
            setTimeout(gameLoop, now - previousTick - 16)
        } else {
            setImmediate(gameLoop)
        }
    }

    gameLoop();
}

module.exports = { startLoop }
