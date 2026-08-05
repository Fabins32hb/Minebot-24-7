const mc = require("minecraft-protocol");
const http = require("http");

const config = {
    host: process.env.HOST || "World-of-Gods32.aternos.me",
    port: Number(process.env.PORT_MC || 11978),
    username: process.env.USERNAME || "Neguin das afk",
    auth: "offline",
    version: "1.21.11",
    hideErrors: true
};

let bot = null;
let reconnecting = false;
let antiAfkInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60000; // máximo 1 minuto entre tentativas

function clearAntiAfk() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
    }
}

function getReconnectDelay() {
    // backoff: 5s, 10s, 20s, 40s... até 60s
    const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;
    return delay;
}

function connect() {
    if (bot) {
        try {
            bot.removeAllListeners();
            bot.end("reconnect");
        } catch (_) {}
        bot = null;
    }

    clearAntiAfk();
    console.log(`[${new Date().toLocaleTimeString()}] Conectando...`);

    try {
        bot = mc.createClient(config);
    } catch (err) {
        console.log("Erro:", err.message);
        scheduleReconnect();
        return;
    }

    bot.on("login", () => {
        reconnecting = false;
        reconnectAttempts = 0; // resetou porque conectou
        console.log("✅ Neguin das afk entrou no jogo!");
    });

    bot.on("spawn", () => {
        console.log("Neguin das afk comeu o frango dus kfc!");

        clearAntiAfk();

        antiAfkInterval = setInterval(() => {
            if (!bot || bot.state !== mc.states.PLAY) return;

            try {
                // olha pra um lado aleatório
                bot.write("look", {
                    yaw: Math.random() * Math.PI * 2,
                    pitch: (Math.random() - 0.5) * 0.5,
                    onGround: true
                });

                // às vezes dá um swing de braço (parece mais humano)
                if (Math.random() < 0.3) {
                    bot.write("arm_animation", { hand: 0 });
                }
            } catch (_) {}
        }, 45000); // a cada 45 segundos
    });

    bot.on("chat", (packet) => {
        try {
            console.log(`[CHAT] ${packet.message}`);
        } catch (_) {}
    });

    bot.on("kick_disconnect", (reason) => {
        console.log("❌ Neguin das afk foi molestado:", reason);
    });

    bot.on("error", (err) => {
        console.log("Erro:", err.message || err);
    });

    bot.on("end", (reason) => {
        console.log("🔄 Neguin das afk saiu do jogo.");
        clearAntiAfk();
        scheduleReconnect();
    });
}

function scheduleReconnect() {
    if (reconnecting) return;
    reconnecting = true;

    const delay = getReconnectDelay();

    setTimeout(() => {
        console.log("Tentando des-assar o cu do Neguin das afk...");
        reconnecting = false;
        connect();
    }, delay);
}

// ====== HTTP serverzinho só pra Render não reclamar de porta ======
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Neguin das afk ta rebolano lentin prus crias 🍗🍗");
}).listen(PORT, () => {
    console.log(`HTTP rodando na porta ${PORT} (só pra Render não chorar)`);
});

// ====== Inicia o bot ======
connect();

// ====== Shutdown limpo ======
function shutdown() {
    console.log("Encerrando...");
    clearAntiAfk();
    if (bot) {
        try {
            bot.end();
        } catch (_) {}
    }
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (err) => {
    console.log("Erro:", err.message);
});
