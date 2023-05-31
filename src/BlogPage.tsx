import { useState, useEffect } from 'react'
import styled from 'styled-components'
import moment from 'moment'

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.1);
`
const Main = styled.main`
  display: flex;
  max-width: 1140px;
  min-height: 440px;
  margin-top: 60px;
  margin-inline: auto;
  padding-block: 32px;
  padding-inline: 64px;
`
const Article = styled.article`
  flex-grow: 1;
  min-height: 200vh;
  margin-right: 32px;
  padding-block: 32px;
  padding-inline: 64px;
  background: #fff;
`
const Sidebar = styled.div`
  flex-shrink: 0;
  width: 250px;
`
const Placeholder = styled.div`
  height: 200px;
  margin-bottom: 32px;
  background: #efdbff;
`
const Navbar = styled.nav`
  position: sticky;
  top: calc(60px + 32px);
  min-height: 400px;
  background: #fff;
`

const BlogPage: React.FC = () => {
  const [data, setData] = useState<typeof import('*.md')>()

  useEffect(() => {
    import('./blog/index.md')
      .then(res => {
        setData(res)
      })
      .catch(e => {
        console.log(e)
      })
  }, [])

  useEffect(() => {
    // console.log(typeof(data?.metadata.cover))
    // console.log(typeof(data?.assetURLs[0]))
    // console.log(data?.coverURL)
  }, [data])

  return (
    <>
      <Header />
      <Main>
        <Article className="content">
          {data ? (
            <>
              <div>{moment(data.metadata.date).format('YYYY M DD')}</div>
              <div
                dangerouslySetInnerHTML={{ __html: data?.default || '' }}
              ></div>
            </>
          ) : (
            <h1>Loading...</h1>
          )}
        </Article>
        <Sidebar>
          <Placeholder />
          <Placeholder />
          <Navbar></Navbar>
        </Sidebar>
      </Main>
    </>
  )
}

export default BlogPage
