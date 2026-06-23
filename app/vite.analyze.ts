import { defineConfig } from 'vite';
import baseConfig from './vite.config';

export default defineConfig(async () => {
  const { visualizer } = await import('rollup-plugin-visualizer');
  const base = typeof baseConfig === 'function' ? await baseConfig({} as any, {} as any) : baseConfig;
  return {
    ...base,
    plugins: [
      ...(base.plugins ?? []),
      visualizer({ open: true, gzipSize: true, filename: 'dist/stats.html' }),
    ],
  };
});
