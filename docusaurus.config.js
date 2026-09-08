// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DevOps Handbook',
  tagline: 'Git, GitHub, CI/CD, SSH & YAML Master Guide (Roman Urdu & English)',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://Zoha-Khan123.github.io/DevOps-Book/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/DevOps-Book/',

  // GitHub pages deployment config.
  organizationName: 'Zoha-Khan123',
  projectName: 'devops-book',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '🚀 DevOps Handbook',
        logo: {
          alt: 'DevOps Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '📖 Complete Guide',
          },
          {
            to: '/docs/git-and-github-commands-cheatsheet',
            label: '⚡ Cheat Sheet',
            position: 'left',
          },
          {
            href: 'https://github.com',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Chapters',
            items: [
              {
                label: '1. Git & GitHub Basics',
                to: '/docs/git-and-github-fundamentals',
              },
              {
                label: '2. CI/CD Concepts',
                to: '/docs/cicd-concepts-and-pipeline-flow',
              },
              {
                label: '3. GitHub Actions Deep Dive',
                to: '/docs/github-actions-yaml-deep-dive',
              },
              {
                label: '4. SSH Deployment Setup',
                to: '/docs/ssh-key-setup-and-server-deployment',
              },
            ],
          },
          {
            title: 'Cheat Sheets & Templates',
            items: [
              {
                label: '5. Git & GitHub Commands',
                to: '/docs/git-and-github-commands-cheatsheet',
              },
              {
                label: '6. SSH, SCP & Rsync Guide',
                to: '/docs/ssh-scp-and-rsync-complete-guide',
              },
              {
                label: '7. YAML Pipeline Templates',
                to: '/docs/yaml-and-production-actions-templates',
              },
            ],
          },
          {
            title: 'Start Here',
            items: [
              {
                label: 'Introduction & Course Map',
                to: '/docs/intro',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} DevOps Handbook. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
