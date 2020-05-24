// const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  if (phase ==="phase-development-server") {
    return {
        env: {
            APIendpoint: 'http://localhost:3000/api',
        },
    }
  }

  return {
    env: {
        APIendpoint: 'https://odrexpress-iota.now.sh/api',
    },
  }
}