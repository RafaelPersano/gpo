import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Cria um objeto para definir as constantes globais. Isso irá substituir
  // as ocorrências de `process.env.KEY` pelo valor correspondente.
  const processEnvDefinitions = Object.keys(env).reduce((prev, key) => {
    prev[`process.env.${key}`] = JSON.stringify(env[key]);
    return prev;
  }, {} as Record<string, any>);

  return {
    plugins: [react()],
    // Este método é mais seguro do que substituir o objeto 'process.env' inteiro,
    // pois preserva outras variáveis de ambiente (ex: NODE_ENV) que podem ser
    // usadas por bibliotecas durante o build.
    define: processEnvDefinitions,
  }
})