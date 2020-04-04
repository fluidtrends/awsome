require = require('esm')(module)

const plugin_manager_1 = require("@aws-amplify/cli/lib/plugin-manager")
const context_manager_1 = require("@aws-amplify/cli/lib/context-manager")
const execution_manager_1 = require("@aws-amplify/cli/lib/execution-manager")

const path = require("path")

async function init(props) {
    try {
        const root = path.resolve(require.resolve("@aws-amplify/cli"), '../../../..')

        let pluginPlatform = await plugin_manager_1.getPluginPlatform()
        pluginPlatform.pluginDirectories.push(root)
        pluginPlatform = await plugin_manager_1.scan(pluginPlatform)

        const { env, accessKey, secretKey, region } = props
 
        const amplify = `{"envName": "${env}"}`
        const providers = `{"awscloudformation":{"configLevel":"project","useProfile":false,"accessKeyId":"${accessKey}","secretAccessKey":"${secretKey}","region":"${region}"}}`
        
        const input = {
            command: 'init',
            plugin: 'core',
            options: { 
                amplify,
                providers,                
                categories: {},
                yes: true 
            }
        }

        const context = context_manager_1.constructContext(pluginPlatform, input)
        await execution_manager_1.executeCommand(context)
        context_manager_1.persistContext(context)
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { init }