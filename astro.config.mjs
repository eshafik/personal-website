// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

// GitHub Pages: the deploy workflow sets SITE and BASE from actions/configure-pages.
// - user site (USERNAME.github.io repo)  -> BASE=/
// - project site (any other repo name)   -> BASE=/repo-name
// - custom domain                         -> SITE=https://your.domain, BASE=/
const site = process.env.SITE ?? 'https://example.github.io';
const base = process.env.BASE ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  devToolbar: { enabled: false }, // dev-only overlay; hidden so local previews match production
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'vitesse-dark' },
      defaultColor: false,
      wrap: false,
    },
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
  },
});
