/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.1775gaming.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
  },
  exclude: ['/api/*'],
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
}
