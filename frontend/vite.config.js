import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig((env) => {
  // https://medium.com/@ctrlaltmonique/setting-up-an-express-typescript-server-with-vue-vite-9d415a51facc
  const envars = loadEnv(env.mode, './');
  const serverURL = envars.VITE_SERVER_URL ?? '';

  return {
    // make the API URL globally available in the client
    define: {
      __API_URL__: JSON.stringify(serverURL),
    },
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        // proxy requests with the API path to the server
        // <http://localhost:5173/api> -> <http://backend:3000/api>
        '/api': 'http://backend:3000',
      },
    },
  };
});
