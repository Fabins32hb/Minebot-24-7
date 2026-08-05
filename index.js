const mc = require("minecraft-protocol");

const config = {
    host: process.env.HOST || "World-of-Gods32.aternos.me",
    port: Number(process.env.PORT || 11978),
    username: process.env.USERNAME || "Neguin das afk",
    // "offline" para servidores offline/pirata.
    // Troque para "microsoft" se for servidor premium.
    auth: "offline",
    version: false
};

let bot = null;
let reconnecting = false;
let antiAfkInterval = null;

function clearAntiAfk() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
    }
}

function connect() {
    if (bot) {
        try {
            bot.removeAllListeners();
            bot.end();
        } catch (_) {}
        bot = null;
    }

    clearAntiAfk();
    console.log(`[${new Date().toLocaleTimeString()}] Conectando...`);

    bot = mc.createClient(config);

    bot.on("login", () => {
        reconnecting = false;
        console.log("✅ Neguin das afk entrou no jogo!");
    });

    bot.on("spawn", () => {
        console.log("Neguin das afk comeu o frango dus kfc!");

        clearAntiAfk(); // garante que não fique com interval duplicado

        // Anti-AFK: gira a visão de vez em quando
        antiAfkInterval = setInterval(() => {
            if (!bot || bot.state !== mc.states.PLAY) return;

            try {
                bot.write("look", {
                    yaw: Math.random() * Math.PI * 2,
                    pitch: (Math.random() - 0.5) * 0.4, // leve variação de pitch
                    onGround: true
                });
            } catch (_) {}
        }, 60000);
    });

    bot.on("chat", (packet) => {
        console.log(`[CHAT] ${packet.message}`);
    });

    bot.on("kick_disconnect", (reason) => {
        console.log("❌ Neguin das afk foi molestado:", reason);
    });

    bot.on("error", (err) => {
        console.log("Erro:", err.message);
    });

    bot.on("end", () => {
        console.log("🔄 Neguin das afk saiu do jogo.");
        clearAntiAfk();

        if (!reconnecting) {
            reconnecting = true;

            setTimeout(() => {
                console.log("Tentando des-assar o cu do Neguin das afk...");
                connect();
            }, 5000);
        }
    });
}

connect();

process.on("SIGINT", () => {
    console.log("Encerrando...");
    clearAntiAfk();
    if (bot) {
        try {
            bot.end();
        } catch (_) {}
    }
    process.exit(0);
});

process.on("SIGTERM", () => {
    clearAntiAfk();
    if (bot) {
        try {
            bot.end();
        } catch (_) {}
    }
    process.exit(0);
});
