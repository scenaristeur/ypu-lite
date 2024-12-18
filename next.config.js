/** @type {import('next').NextConfig} */
module.exports = ({
    webpack(config) {
        config.externals.push({ '@lancedb/lancedb': '@lancedb/lancedb' })
        return config;
    }
    })
    