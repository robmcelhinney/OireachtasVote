/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  siteMetadata: {
    title: `Oireachtas Vote`,
    siteUrl: `https://robmcelhinney.com/OireachtasVote/`,
    description: `Static ReactJS site to view Irish lower house of legislator, Oireachtas, Dáil Éireann's, politicians voting records.`,
  },
  plugins: [`gatsby-plugin-react-helmet`]  
}
