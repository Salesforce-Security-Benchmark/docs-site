import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  title: "SBS",
  description: "Security Benchmark for Salesforce",
  appearance: 'dark',
  head: [
    [
      'link',
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600&display=swap' }
    ],
    ['link', { rel: 'icon', href: '/fav_sbs.png' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/sbs_logo.svg',
    outline: [2, 3], // Show h2 and h3 in the right sidebar
    
    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },
    
    nav: [
      { text: 'Home', link: 'https://www.securitybenchmark.org/' },
      { text: 'Documentation', link: '/' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Controls At-a-Glance', link: '/controls-at-a-glance' },
          { text: 'For Security Vendors', link: '/for-vendors' },
          { text: 'Contributing', link: '/CONTRIBUTING' },
          { text: 'About', link: '/about' }
        ]
      },
      {
        text: 'Benchmark',
        items: [
          { text: 'Foundations', link: '/benchmark/foundations' },
          { text: 'OAuth Security', link: '/benchmark/oauth-security' },
          { text: 'Integrations', link: '/benchmark/integrations' },
          { text: 'Access Controls', link: '/benchmark/access-controls' },
          { text: 'Authentication', link: '/benchmark/authentication' },
          { text: 'Code Security', link: '/benchmark/code-security' },
          { text: 'Data Security', link: '/benchmark/data-security' },
          { text: 'Deployments', link: '/benchmark/deployments' },
          { text: 'Security Configuration', link: '/benchmark/security-configuration' },
        ]
      },

    ]
  }
})
