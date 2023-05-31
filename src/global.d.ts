declare module '*.md' {
  const mdHTMLString: string
  const assetURLs: string[]
  const metadata: {
    title?: string
    description: string
    date?: string
    cover?: string
    authors?: {
      name?: string
      avatar?: string
      url?: string
    }[]
    tags?: string[]
  }
  const toc: { label: string; level: number }[]
  export { assetURLs, metadata, toc }

  export default mdHTMLString
}
