// List of projects/orgs using your project for the users page.
const siteConfig = {
  title: 'NOCUST.Client', // Title for your website.
  tagline: 'Seamless interactions with NOCUST operators',
  url: 'https://liquidity-network.github.io', // Your website URL
  baseUrl: '/nocust-client-library/', // Base URL for your project */

  // Used for publishing and more
  projectName: 'nocust-client-library',
  organizationName: 'liquidity-network',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'intro', label: 'Docs' },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/liquidity-logo.svg',
  footerIcon: 'img/liquidity-logo.svg',
  favicon: 'img/liquidity-logo.svg',

  /* Colors for website */
  colors: {
    primaryColor: '#382194',
    secondaryColor: '#5436cd',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Liquidity.Network`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/liquidity-logo.svg',
  twitterImage: 'img/liquidity-logo.svg',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
}

module.exports = siteConfig
