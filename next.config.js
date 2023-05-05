module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/templates/index.html',
                permanent: true,
            },
        ]
    },
}
