const mineflayer = require('mineflayer')

const config = {
  host: 'World-of-Gods32.aternos.me:11978',
  port: 25565,
  username: 'NeguinDasAFK',
  version: '1.21.11'
}

function criarBot() {
  console.log('Conectando ao servidor...')

  const bot = mineflayer.createBot(config)

  bot.once('spawn', () => {
    console.log('================================')
    console.log('BOT ENTROU NO SERVIDOR!')
    console.log('================================')
  })

  bot.on('kicked', (reason) => {
    console.log('Bot foi kickado:', reason)
  })

  bot.on('error', (err) => {
    console.log('Erro:', err.message)
  })

  bot.on('end', () => {
    console.log('Bot desconectou.')
    console.log('Tentando reconectar em 10 segundos...')

    setTimeout(() => {
      criarBot()
    }, 10000)
  })
}

criarBot()
