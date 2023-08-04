class Packet extends Phaser.GameObjects.GameObject {
    constructor(scene) {
        super(scene, "packet");
        this.scene = scene;
        this.size = Math.random() * 30;
        this.timeout = 10;
        this.expired = false;
        this.delayedCall = this.scene.time.delayedCall(
            this.timeout * 1000,
            this.expire.bind(this)
        );
        this.on("destroy", this.destroyAndClean);
    }
    expire() {
        this.expired = true;
        this.scene.score -= 10;
    }
    destroyAndClean() {
        this.delayedCall.destroy();
        if (!this.expired) {
            this.scene.score += 1;
        }
    }
}
class Machine extends Phaser.GameObjects.Sprite {
    constructor(scene, image_id, x, y, max_connections) {
        super(scene, x, y, image_id);
        this.image_id = image_id
        this.max_connections = max_connections;
        scene.add.existing(this);
        this.setInteractive();
        scene.input.setDraggable(this);
        this.connections = [];
        this.packets = [];
        this.on("pointerup", () => {
            if ((scene.activeObject != undefined) & (scene.activeObject != this)) {
                if (
                    (scene.activeObject.connections.length < scene.activeObject.max_connections) &
                    !(scene.activeObject instanceof Computer)
                ) {
                    scene.activeObject.connect(this);
                }
            }
            scene.activeObject = this;
            this.setTexture(image_id+"Active");
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
        this.connections.push({ sprite: sprite, object: obj });
        obj.connections.push({ sprite: sprite, object: this });
    }
    tryToSend() {
        this.packets.forEach((packet) => {
            this.roundRobin(packet);
        });
        this.packets = [];
    }
    roundRobin(packet) {
        if (this.connections.length > 0) {
            if (
                (this.roundRobinIndex === undefined) |
                (this.roundRobinIndex === this.connections.length)
            ) {
                this.roundRobinIndex = 0;
            }
            if (!(this.connections[this.roundRobinIndex] instanceof Generator)) {
                this.connections[this.roundRobinIndex].object.packets.push(packet);
                this.roundRobinIndex += 1;
            } else {
                this.connections[this.roundRobinIndex + 1].object.packets.push(packet);
                this.roundRobinIndex += 2;
            }

        }
    }
    setInactive(){
        this.setTexture(this.image_id);
    }
}

class Generator extends Machine {
    constructor(scene) {
        super(scene, "endUser", 100, 200, 1);
        this.scene = scene;
        this.packetsGroup = scene.add.group(this);
        this.packets = [];
        this.id = "generator";
        this.trafficRate = 1000;
        if (typeof Generator.instance === "object") {
            return Generator.instance;
        }
        Generator.instance = this;
        return this;
    }
    createPacket() {
        for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
            let packet = new Packet(this.scene);
            this.packetsGroup.add(packet);
            this.packets.push(packet);
        }
    }
    startGeneration() {
        this.interval = this.scene.time.addEvent({
            callback: this.createPacket.bind(this),
            delay: this.trafficRate,
            loop: true
        })
    }
    incriseTraffic() {
        this.trafficRate = this.trafficRate - 100;
        this.interval.reset({
            callback: this.createPacket.bind(this),
            delay: this.trafficRate,
            loop: true
        })
    }
}

class MachineWithComputing extends Machine {
    constructor(scene, id, x, y, maxConnections, cpuPower) {
        super(scene, id, x, y, maxConnections);
        this.scene = scene;
        this.cpu = 0;
        this.cpuPower = cpuPower;
        this.chartData = Array.from({ length: 20 }, (x, i) => i);;
    }
    processPackets() {
        this.packets.forEach((packet) => {
            let finalCpu = this.cpu + 1;
            if (finalCpu < 100) {
                this.compute(packet);
            } else {
                this.cpu += 1;
                this.scene.time.delayedCall(10, () => {
                    packet.expire()
                    packet.destroy()
                    this.cpu -= 1;
                })
            }
        })
        this.packets = []
    }
    destroyPacket(packet) {
        packet.expire()
        packet.destroy()
        this.cpu -= 1;
    }
    showCpu() {
        this.chart = new Chart(document.getElementById("chart").getContext("2d"), {
            type: "line",
            data: {
                labels: Array.from({ length: 20 }, (x, i) => i),
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
        });
        this.scene.add.dom(470, 460, "#chart-wrapper").setOrigin(0);
        this.updateLoop = setInterval(this.chartUpdate.bind(this), 250);
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
        this.id = "Computer"
        this.scene = scene;
    }
    compute(packet) {
        let cost = Math.floor(Math.random() * 5);
        this.cpu += cost;
        this.scene.time.delayedCall(
            packet.size * this.cpuPower,
            this.process.bind(this),
            [packet, cost]
        );
    }
    process(packet, cost) {
        this.cpu -= cost;
        packet.destroy();
    }


}

class LoadBalancer extends MachineWithComputing {
    constructor(scene) {
        super(scene, "loadBalancer", 600, 300, 5, 10);
        this.id = "Load Balancer"
        this.scene = scene;
        return this;
    }
    compute(packet) {
        this.cpu += 1;
        this.scene.time.delayedCall(
            10,
            this.process.bind(this),
            [packet]
        );
    }
    process(packet) {
        this.cpu -= 1;
        this.roundRobin(packet);
    }
}
