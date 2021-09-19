const DEFAULT_API_URL = "http://localhost:8081"

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: ''},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "~plugins/vue-tailwind"
  ],

  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || DEFAULT_API_URL
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.API_URL || DEFAULT_API_URL
  },

  auth: {
    strategies: {
      local: {
        token: {
          global: true,
        },
        user: {
          property: false
        },
        endpoints: {
          login: {url: '/auth/login', method: 'post'},
          logout: {},
          user: {url: '/auth/user', method: 'get'}
        },
      }
    },
    resetOnError: true
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
}
