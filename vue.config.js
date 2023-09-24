const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: process.env.NODE_ENV != "production",
    productionSourceMap: process.env.NODE_ENV != "production",
    publicPath: process.env.NODE_ENV === "production" ? "/qpack_viewer/" : "/",
})
