const ngrok = require('ngrok')
const envFile = require('envfile')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

/**
 * Creates public tunnels for provided ports on localhost. Also, writes tunnels url to .env file and deletes them after session is over.
 */
class ServerlessTunnel {
  constructor (serverless, options) {
    this.serverless = serverless
    this.log = serverless.cli.log.bind(serverless.cli)
    this.slsOptions = options
    this.reconnectTried = false
    this.noEnvFile = true

    this.commands = {
      tunnel: {
        lifecycleEvents: ['init']
      }
    }

    // Run tunnels after serverless-offline
    this.hooks = {
      'tunnel:init': this.runServer.bind(this, true),
      'before:offline:start:init': this.runServer.bind(this)
    }
  }

  async runTunnel ({port, envProp, ws, path, ngrokOptions}) {
    try {
      const url = await ngrok.connect({
        addr: port,
        proto: 'http',
        region: 'eu',
        ...(ngrokOptions || {})
      })
      this.onConnect(url, envProp, ws, path)
    } catch (e) {
      this.errorHandler(e)
    }
  }

  onConnect (url, envProp, ws, path) {
    const tunnel = ws ? url.replace('http', 'ws') : url
    if (envProp) {
      this.envContent[envProp] = `${tunnel}${path || ''}`
      this.log(`${envProp} available at: ${this.envContent[envProp]}`)
    } else {
      this.log(`Tunnel created at ${tunnel}${path || ''}`)
    }
    this.writeToEnv()
  }

  errorHandler (e) {
    this.log(`Tunnels error: ${e.message}. Trying to reconnect in 5 seconds...`)
    this.tryReconnect()
  }

  onTunnelClose () {
    this.log('Closing tunnels...')
  }

  runServer (selfInit) {
    this.options = _.get(this.serverless, 'service.custom.ngrokTunnel', {})

    if (this.options.envPath) {
      this.noEnvFile = false
      this.envPath = path.resolve(process.cwd(), this.options.envPath)

      try {
        this.envContent = envFile.parseFileSync(this.envPath)
      } catch (e) {
        this.envContent = {}
        this.noEnvFile = true
      }
    }
    if (this.slsOptions.tunnel === 'true' || selfInit) {
      if (this.options.tunnels && this.options.tunnels.length) {
        this.log('Starting tunnels...')
        this.options.tunnels.forEach((opt) => this.runTunnel(opt))
        process.on('SIGINT', () => this.stopTunnel())
      } else {
        this.log('Tunnels are not configured. Skipping...')
      }
    }
  }

  stopTunnel () {
    ngrok.kill()
    if (!this.noEnvFile) {
      (this.options.tunnels || []).forEach(({envProp}) => {
        delete this.envContent[envProp]
      })
      this.writeToEnv()
    }
  }

  tryReconnect () {
    if (!this.reconnectTried) {
      setTimeout(() => {
        (this.options.tunnels || []).forEach((opt) => this.runTunnel(opt))
      }, 5000)
      this.reconnectTried = true
    }
  }

  writeToEnv () {
    if (!this.noEnvFile) {
      fs.writeFileSync(this.envPath, envFile.stringifySync(this.envContent))
    }
  }
}

module.exports = ServerlessTunnel
