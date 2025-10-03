import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        host: true, // Or specify '0.0.0.0' to listen on all addresses
        allowedHosts: true
    }
})