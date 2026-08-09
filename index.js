const mineflayer = require('mineflayer')

function criarBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: Number(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    version: '1.21.11'
  })

  bot.once('spawn', () => {
    console.log('Bot entrou no servidor!')
  })

  bot.on('chat', (username, message) => {
    console.log(`<${username}> ${message}`)
  })

  bot.on('kicked', (reason) => {
    console.log('Bot foi expulso:', reason)
  })

  bot.on('error', (err) => {
    console.log('Erro:', err.message)
  })

  bot.on('end', () => {
    console.log('Bot desconectou. Reconectando em 10 segundos...')
    setTimeout(criarBot, 10000)
  })
}

criarBot()
