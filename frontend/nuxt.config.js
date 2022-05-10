const DEFAULT_API_URL = "http://localhost:8080";

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "nuxt",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/assets/css/main.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{ src: "~/plugins/vue-tailwind" }],

  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.PUBLIC_API_URL || DEFAULT_API_URL,
      baseURL: process.env.API_URL || DEFAULT_API_URL,
    }
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    "@nuxtjs/eslint-module",
    "@nuxt/postcss8",
    "@nuxtjs/fontawesome",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    "@nuxtjs/axios",
    "@nuxtjs/auth-next",
    ["nuxt-rfg-icon", { masterPicture: "static/favicon.png" }],
    "@nuxtjs/manifest",
    "vue-sweetalert2/nuxt"
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  auth: {
    plugins: ["~/plugins/axios-error-interceptor"],
    strategies: {
      local: {
        scheme: "refresh",
        token: {
          property: "data.access_token",
          global: true,
          maxAge: process.env.JWT_ACCESS_VALID_DURATION || 60 * 30, // 30 Minutes
        },
        refreshToken: {
          property: "data.refresh_token",
          data: "refresh_token",
          maxAge: process.env.JWT_REFRESH_VALID_DURATION || 60 * 60 * 24 * 30, // 30 Days
          required: true,
        },
        user: {
          property: "data",
          autoFetch: true,
        },
        endpoints: {
          login: { url: "/auth/login", method: "post" },
          refresh: { url: "/auth/refresh", method: "post" },
          logout: false,
          user: { url: "/users/@me", method: "get" },
        },
      },
    },
    cookie: {
      prefix: "auth.",
      options: {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      },
    },
    resetOnError: true,
    redirect: {
      login: "/login",
      logout: "/login",
      home: "/",
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },

  sweetalert: {
    heightAuto: false,
    confirmButtonColor: "#6d28d9",
    cancelButtonColor: "#94a3b8"
  },

  fontawesome: {
    icons: {
      solid: [
        "faArrowLeft",
        "faArrowRight",
        "faAsterisk",
        "faBoxOpen",
        "faCheck",
        "faCopy",
        "faDesktop",
        "faDownload",
        "faExclamation",
        "faExclamationTriangle",
        "faFile",
        "faKey",
        "faMinus",
        "faPlus",
        "faQuestion",
        "faScroll",
        "faSearch",
        "faSignOutAlt",
        "faSync",
        "faTerminal",
        "faTicketAlt",
        "faTimes",
        "faTimesCircle",
        "faTrash",
        "faUser",
        "faStar"
      ],
    },
  },

  eslint: {
    cache: false,
  },
};
