# serverless-ngrok-tunnel
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

      # or if you are using `serverless-iot-offline` plugin, expose iot endpoint
      - port: 1884
        envProp: 'IOT_ENDPOINT'
        ws: true # optional. expose web-socket url
        path: '/mqqt' # optional. additional pat to url
        
      - port: 9000
        ngrokOptions: # optional. custom ngrok options
          authtoken: '12345'
          region: 'us',
          subdomain: 'my-subdomain'
          
```
For a list of available ngrok options checkout ngrok [documentation](https://github.com/bubenshchykov/ngrok#options).  

To start tunnel/s run `sls tunnel`.  
If you are using `serverless-offline` plugin, start offline with option flag: `sls offline start --tunnel=true`.

## Contributing

Yes, please. Checkout [contributing guidelines](./CONTRIBUTING.md).

##Licence

MIT