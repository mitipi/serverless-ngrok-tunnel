# serverless-ngrok-tunnel
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm](https://img.shields.io/npm/v/serverless-ngrok-tunnel.svg)](https://www.npmjs.com/package/serverless-ngrok-tunnel)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

Serverless plugin that creates ngrok public tunnel on localhost.
Optionally, writes tunnels url to .env file and deletes them after session is over. Useful for when you want to expose url for other applications to use (for example mobile application).

## Installation

Add serverless-ngrok-tunnel to your project:
`npm install --save-dev serverless-ngrok-tunnel`

Then inside your `serverless.yml` file add following entry to the plugins section:
```yaml
plugins:
  - serverless-ngrok-tunnel
```

## Usage

First you will need to configure tunnels. In your `serverless.yml` file add:
```yaml
custom:
  ngrokTunnel:
    envPath: '../.env' # optional. Path to your .env file, relative to serverless.yml file
    tunnels: # required

      # if you are using `serverless-offline` plugin, expose api gateway
      - port: 8000 # required
        envProp: 'API_GATEWAY' # optional. property in .env file to assign url value to

      # or if you are using `serverless-iot-offline` plugin, expose IoT endpoint
      - port: 1884
        envProp: 'IOT_ENDPOINT'
        ws: true # expose web-socket url
        path: '/mqqt' # additional path to url

      - port: 9000
        ngrokOptions: # optional. custom ngrok options
          authtoken: '12345'
          region: 'us'
          subdomain: 'my-subdomain'

```
For a list of available ngrok options checkout ngrok [documentation](https://github.com/bubenshchykov/ngrok#options).

To start tunnel/s run `sls tunnel`.
If you are using `serverless-offline` plugin
  - v2: start offline with option flag: `sls offline start --tunnel=true`.
  - v3: start offline with option flag: `sls offline start --param="tunnel=true"`.

## Contributing

Yes, please. Checkout [contributing guidelines](./CONTRIBUTING.md).

## Licence

MIT
