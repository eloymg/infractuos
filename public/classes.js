class Packet extends Phaser.GameObjects.GameObject {
    constructor(scene) {
        super(scene, "packet");
        this.scene = scene
        this.size = Math.random() * 5;
        this.timeout = 3;
        this.expired = false;
        this.delayedCall = scene.time.delayedCall(this.timeout * 1000, this.expire.bind(this));
        this.on("destroy", this.destroyAndClean);
    }
    expire() {
        this.expired = true;
        this.scene.score -= 1

    }
    destroyAndClean() {
        this.delayedCall.destroy()
        if (!this.expired) {
            this.scene.score += 1
        }
    }
}
class Machine extends Phaser.GameObjects.Sprite {
    constructor(scene, image_id, x, y, max_connections) {
        super(scene, x, y, image_id);
        this.max_connections = max_connections
        scene.add.existing(this);
        this.setInteractive();
        scene.input.setDraggable(this);
        this.connections = [];
        this.packets = []
        this.on("pointerup", () => {
            if (
                (scene.activeObject != undefined) &
                (scene.activeObject != this)
            ) {
                if (this.connections.length < this.max_connections & !(scene.activeObject instanceof Computer)) {
                    scene.activeObject.connect(this);
                }
            }
            scene.activeObject = this;
        });
        this.scene = scene;
        return this;
    }
    connect(obj) {
        let sprite = this.scene.add.graphics({
            lineStyle: { width: 4, color: 0xaa00aa },
        });
        sprite.lineBetween(
            this.getCenter().x,
            this.getCenter().y,
            obj.getCenter().x,
            obj.y
        );
        this.connections.push({ "sprite": sprite, "object": obj })
        obj.connections.push({ "sprite": sprite, "object": this })
    }
    tryToSend() {
        this.packets.forEach((packet) => {
            this.roundRobin(packet)
        });
        this.packets = [];
    }
    roundRobin(packet) {
        if (this.connections.length > 0) {
            if (this.roundRobinIndex === undefined | this.roundRobinIndex === this.connections.length) {
                this.roundRobinIndex = 0
            }
            if (!(this.connections[this.roundRobinIndex] instanceof Generator)){
                this.connections[this.roundRobinIndex].object.packets.push(packet);
            }
            this.roundRobinIndex += 1
        }
    }

}

class Generator extends Machine {
    constructor(scene) {
        super(scene, "end_user", 100, 200, 1);
        this.scene = scene;
        this.packetsGroup = scene.add.group(this);
        this.packets = [];
        this.id = "generator";
        if (typeof Generator.instance === "object") {
            return Generator.instance;
        }
        Generator.instance = this;
        return this;
    }
    createPacket() {
        let packet = new Packet(this.scene, this);
        this.packetsGroup.add(packet);
        this.packets.push(packet);
    }
    startGeneration() {
        setInterval(this.createPacket.bind(this), 50);
    }

}

class MachineWithComputing extends Machine {
    constructor(scene, id, x, y, maxConnections, cpuPower) {
        super(scene, id, x, y, maxConnections);
        this.scene = scene;
        this.cpu = 0;
        this.cpuPower = cpuPower
        this.chartData = [0, 0, 0, 0, 0];
    }
    processPacket() {
        if (this.packets.length > 0) {
            let finalCpu = this.cpu + this.packets[0].size;
            if (finalCpu < 100) {
                let packet = this.packets.shift();
                this.cpu += 10;
                this.scene.time.delayedCall(packet.size * this.cpuPower, this.process.bind(this), [
                    packet,
                ]);
            }
        }
    }
    showCpu() {
        this.chart = new Chart(
            document.getElementById("chart").getContext("2d"),
            {
                type: "line",
                data: {
                    labels: [1, 2, 3, 4, 5],
                    datasets: [
                        {
                            label: "CPU",
                            data: this.chartData,
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            offset: true,
                        },
                        x: {
                            grid: {
                                display: true,
                                offset: true,
                            },
                        },
                    },
                },
            }
        );
        this.scene.add.dom(320, 320, "#chart-wrapper").setOrigin(0);
        this.updateLoop = setInterval(this.chartUpdate.bind(this), 1000);
    }
    chartUpdate() {
        this.chartData.shift();
        this.chartData.push(this.cpu);
        this.chart.data.datasets[0].data = this.chartData;
        this.chart.update();
    }
    deleteShowCpu() {
        this.chart.destroy();
        this.chart = undefined;
        clearInterval(this.updateLoop);
    }
}
class Computer extends MachineWithComputing {
    constructor(scene) {
        super(scene, "computer", 600, 100, 1, 100);
        this.scene = scene;
        return this;
    }
    process(packet) {
        this.cpu -= 10;
        packet.destroy();
    }
}

class LoadBalancer extends MachineWithComputing {
    constructor(scene) {
        super(scene, "loadBalancer", 600, 300, 5, 10);
        this.scene = scene;
        return this;
    }
    process(packet) {
        console.log("processed")
        this.cpu -= 10;
        this.roundRobin(packet)
    }
}