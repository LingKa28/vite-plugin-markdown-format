import { PluginOption } from 'vite'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import YAML from 'yaml'
import moment, { Moment } from 'moment'
import type {
  Root as MDAstRoot,
  Heading,
  Text as MDAstText,
  YAML as YAMLNode,
} from 'mdast'
import type { Root as HTMLAstRoot, Element, Text as HTMLAstText } from 'hast'

const fileRegex = /\.(md)$/

function randomString(len: number) {
  len = len || 32
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

interface Metadata {
  title?: string
  description: string
  date?: Moment
  cover?: string
  authors?: {
    name?: string
    avatar?: string
    url?: string
  }[]
  tags?: string[]
}

interface Headings {
  label: string
  level: number
}

const compileMDToTS = (src: string) => {
  // console.log(id)
  const urlMap = new Map<string, string>()
  const pathSet = new Set<string>()
  const randomSet = new Set<string>()
  let metadata = {}
  const headings: Headings[] = []

  const remarkGetMetadata = () => (node: MDAstRoot) => {
    let _metadata: Metadata
    const { type, value } = node.children[0] as YAMLNode
    if (type === 'yaml') {
      _metadata = YAML.parse(value)
      // console.info(_metadata)
      Object.keys(_metadata).forEach(key => {
        if (key === 'date') {
          _metadata[key] = moment(_metadata[key], 'YYYY-MM-DD')
        }
        // console.info(_metadata)
        if (key === 'cover') {
          const originUrl = _metadata[key]
          if (!originUrl.startsWith('http') && !originUrl.startsWith('data:')) {
            if (!pathSet.has(originUrl)) {
              const url = '_' + randomString(29)
              urlMap.set(originUrl, url)
              urlMap.set(url, originUrl)
              pathSet.add(originUrl)
              randomSet.add(url)
              _metadata[key] = url
            }
          }
        }
        // console.info(_metadata)
        if (key === 'authors') {
          _metadata['authors'].forEach(({ avatar }, index) => {
            if (
              avatar &&
              !avatar.startsWith('http') &&
              !avatar.startsWith('data:')
            ) {
              if (!pathSet.has(avatar)) {
                const url = '_' + randomString(29)
                urlMap.set(url, avatar)
                urlMap.set(avatar, url)
                pathSet.add(avatar)
                randomSet.add(url)
                _metadata['authors'][index].avatar = url
              }
            }
          })
        }
        // console.info(_metadata)
      })
      metadata = _metadata
    }
    // console.log(metadata)
  }

  const remarkGetHeading = () => (node: MDAstRoot) => {
    node.children.forEach((line: Heading) => {
      if (line.type === 'heading') {
        // console.info(line)
        if (
          line.depth === 1 ||
          line.depth === 2 ||
          line.depth === 3 ||
          line.depth === 4 ||
          line.depth === 5 ||
          line.depth === 6
        ) {
          headings.push({
            label: (line.children[0] as MDAstText).value,
            level: line.depth,
          })
        }
      }
    })
  }

  const rehypeAddIdToHeading = () => (node: HTMLAstRoot) => {
    // console.info(node)
    node.children.forEach((element: Element) => {
      // console.info(element)
      if (
        element.tagName === 'h1' ||
        element.tagName === 'h2' ||
        element.tagName === 'h3' ||
        element.tagName === 'h4' ||
        element.tagName === 'h5' ||
        element.tagName === 'h6'
      ) {
        element.properties['id'] = (element.children[0] as HTMLAstText).value
          .split(' ')
          .join('-')
          .toLowerCase()
      }
    })
  }

  const rehypeTransImageUrl = () => (node: Element) => {
    // console.log(node)
    const transURL = (node: Element) => {
      if (!node) return
      const src = node?.properties?.src as string | undefined
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        let s: string
        if (!pathSet.has(src)) {
          s = '_' + randomString(29)
          urlMap.set(s, src)
          urlMap.set(src, s)
          pathSet.add(src)
          randomSet.add(s)
        } else {
          s = urlMap.get(src) || ''
        }
        node.properties = {
          ...node.properties,
          src: s,
        }
      }
      if (node?.children?.length)
        node.children.forEach((v: Element) => transURL(v))
    }
    transURL(node)
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGetMetadata)
    .use(remarkGetHeading)
    .use(remarkRehype)
    .use(rehypeRaw)
    .use(rehypeHighlight)
    .use(rehypeAddIdToHeading)
    .use(rehypeTransImageUrl)
    .use(rehypeStringify)

  let tsxString = processor.processSync(src).toString()

  const randomStrings = Array.from(randomSet)
  // console.log(randomStrings)

  const importStrings = randomStrings.map(
    v => `import ${v} from "${urlMap.get(v)}";`,
  )
  // console.log(importStrings)

  let metadataString = JSON.stringify(metadata)

  randomStrings.forEach(s => {
    metadataString = metadataString.replaceAll(`"${s}"`, `\`\${${s}}\``)
    tsxString = tsxString.replaceAll(`"${s}"`, `"\${${s}}"`)
  })

  const result = `
import Second from ./second
${importStrings.join('\n')}
const metadata=${metadataString};
const headings=${JSON.stringify(headings)}
export {
  metadata,
  headings
}
export default \`${tsxString.replace('`', '\\`')}\`
  `

  console.log(result)
  return result
}

export default function vitePluginMDFormat(): PluginOption {
  return {
    name: 'vite-plugin-md-format',
    enforce: 'pre',
    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileMDToTS(src),
          map: null, // 如果可行将提供 source map
        }
      }
    },
  }
}
