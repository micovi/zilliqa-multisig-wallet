module.exports = {
    chainWebpack: config => {
        config.module
            .rule('raw')
            .test(/\.scilla$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
    },
}