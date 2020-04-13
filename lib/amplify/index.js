require = require('esm')(module)

const pluginManager = require("@aws-amplify/cli/lib/plugin-manager")
const contextManager = require("@aws-amplify/cli/lib/context-manager")
const executionManager = require("@aws-amplify/cli/lib/execution-manager")

const path = require("path")
const fs = require("fs-extra")
const shortid = require("shortid")

function _getInput(props, code) {
    const { id, env, key, secret, region, command, plugin } = props
    
    const amplify = `{"envName":"${env}", "projectName":"carmel-${id}"}`
    const providers = `{"awscloudformation":{"configLevel":"project","useProfile":false,"accessKeyId":"${key}","secretAccessKey":"${secret}","region":"${region}"}}`
    const codegen = `{"generateCode":true,"codeLanguage":"javascript","fileNamePattern":"src/graphql/**/*.js","generatedFileName":"API","generateDocs":true}`
    const categories = `{}`

    return Object.assign({}, {
        command,
        plugin,
        options: { amplify, providers, categories, yes: true }
    }, code && { codegen })
}

async function _setup(input) {
    process.stdout.write = Function.prototype
    const root = path.resolve(require.resolve("@aws-amplify/cli"), '../../../..')

    let pluginPlatform = await pluginManager.getPluginPlatform()
    pluginPlatform.pluginDirectories.includes(root) || pluginPlatform.pluginDirectories.push(root)

    pluginPlatform = await pluginManager.scan(pluginPlatform)

    return contextManager.constructContext(pluginPlatform, input)
}

async function _exec(context) {
    return executionManager.executeCommand(context)
}

function _cleanup(context, stdout) {
    contextManager.persistContext(context)        
    process.stdout.write = stdout
}

async function _run(input) {
    // Capture the log
    const stdout = process.stdout.write

    try {
        // Setup the executor
        const context = await _setup(input) 

        fs.existsSync('.app') || fs.mkdirSync('.app')
        process.chdir('.app')

        // Execute the command
        await _exec(context)
 
        // Clean up execution
        _cleanup(context, stdout)
    }
    catch (e) {
        process.stdout.write = stdout
    }
}

async function _init(props) {
    const id = shortid.generate()
    console.log("*****", id, "*****")
    _run(_getInput(Object.assign({}, props, { id, plugin: "core", command: "init" })))
}

async function _status(props) {
    const input = _getInput(Object.assign({}, props, { plugin: "core", command: "status" }))
    return _run(input)
}

async function _push(props) {
    const input = _getInput(Object.assign({}, props, { plugin: "core", command: "push" }), true)
    return _run(input)
}

module.exports = { 
    init: (props) => _init(props), 
    status: (props) => _status(props),
    push: (props) => _push(props)
}