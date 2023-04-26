import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * {
  box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
      sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
    background: #f0f0f0;
  }

  .content {
    img {
      display: block;
      max-width: 556px;
      margin-inline: auto;
    }
  }
`

export default GlobalStyle
