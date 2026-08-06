const mc = require("minecraft-protocol");
const http = require("http");

const config = {
    host: process.env.HOST || "World-of-Gods32.aternos.me",
    port: Number(process.env.PORT_MC || 11978),
    username: process.env.USERNAME || "NeguinDasAFK",
    auth: "offline",
    version: false, // deixa detectar automático (mais seguro pra testar)
};

let bot = null;
let reconnecting = false;
let antiAfkInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 60000;

function log(msg) {
    const time = new Date().toLocaleString("pt-BR");
    console.log(`[${time}] ${msg}`);
}

function clearAntiAfk() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
    }
}

function getReconnectDelay() {
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
    log(`[${new Date().toLocaleTimeString()}] Conectando...`);

    try {
        bot = mc.createClient(config);
    } catch (err) {
        log(`Erro ao criar client: ${err.message}`);
        scheduleReconnect();
        return;
    }

    // ===== LOGS DE DEPURAÇÃO (muito importantes) =====
    bot.on("connect", () => {
        log("DEBUG → TCP conectado com sucesso");
    });

    bot.on("state", (newState, oldState) => {
        log(`DEBUG → Estado mudou: ${oldState} → ${newState}`);
    });

    bot.on("packet", (data, meta) => {
        // só mostra pacotes importantes pra não floodar
        if (["keep_alive", "login", "success", "disconnect", "kick_disconnect", "set_compression"].includes(meta.name)) {
            log(`DEBUG → Pacote recebido: ${meta.name}`);
        }
    });

    bot.on("login", () => {
        reconnecting = false;
        reconnectAttempts = 0;
        log("✅ Neguin das afk entrou no jogo!");
    });

    bot.on("spawn", () => {
        log("Neguin das afk comeu o frango dus kfc!");

        clearAntiAfk();

        antiAfkInterval = setInterval(() => {
            if (!bot || bot.state !== mc.states.PLAY) return;

            try {
                bot.write("look", {
                    yaw: Math.random() * Math.PI * 2,
                    pitch: (Math.random() - 0.5) * 0.5,
                    onGround: true
                });

                if (Math.random() < 0.3) {
                    bot.write("arm_animation", { hand: 0 });
                }
            } catch (_) {}
        }, 45000);
    });

    bot.on("chat", (packet) => {
        log(`[CHAT] ${packet.message}`);
    });

    bot.on("kick_disconnect", (reason) => {
        log(`❌ Neguin das afk foi molestado: ${JSON.stringify(reason)}`);
    });

    bot.on("disconnect", (packet) => {
        log(`DEBUG → Pacote disconnect: ${JSON.stringify(packet)}`);
    });

    bot.on("error", (err) => {
        log(`Erro: ${err.message || err}`);
    });

    bot.on("end", (reason) => {
        log(`🔄 Neguin das afk saiu do jogo. Motivo: ${reason || "desconhecido"}`);
        clearAntiAfk();
        scheduleReconnect();
    });
}

function scheduleReconnect() {
    if (reconnecting) return;
    reconnecting = true;

    const delay = getReconnectDelay();
    log(`Reconectando em ${Math.round(delay / 1000)}s...`);

    setTimeout(() => {
        log("Tentando des-assar o cu do Neguin das afk...");
        reconnecting = false;
        connect();
    }, delay);
}

// ===== HTTP pro Render =====
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Neguin das afk tá online e comendo frango 🍗");
}).listen(PORT, () => {
    log(`HTTP rodando na porta ${PORT} (só pra Render não chorar)`);
});

// ===== Inicia =====
connect();

// ===== Shutdown limpo =====
function shutdown() {
    log("Encerrando...");
    clearAntiAfk();
    if (bot) {
        try { bot.end(); } catch (_) {}
    }
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", (err) => {
    log(`uncaughtException: ${err.message}`);
});

process.on("unhandledRejection", (err) => {
    log(`unhandledRejection: ${err}`);
});
