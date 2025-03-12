import { useEffect, useState } from 'react';
import './App.css';
import Description from './components/Description';
import Thumbnail from './components/Thumbnail';
import Card from './components/Card';

function App() {
  // 存储论文索引数据
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 在组件挂载时加载论文索引数据
  useEffect(() => {
    const fetchPaperIndex = async () => {
      try {
        const response = await fetch('/repository/paper_index.json');
        if (!response.ok) {
          throw new Error('无法加载论文索引数据');
        }
        const data = await response.json();
        setPublications(data.publications || []);
        setLoading(false);
      } catch (err) {
        console.error('加载论文索引时出错:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPaperIndex();
  }, []);

  // 将论文元数据转换为Card组件所需格式的函数
  const mapPublicationToCardProps = (publication) => {
    return {
      title: publication.title,
      authors: publication.authors.join(', '),
      backgroundImage: publication.thumbnails && publication.thumbnails.length > 0 
        ? publication.thumbnails[0] 
        : null,
      publishTitle: publication.publishTitle,
      officialLink: publication.resources?.official || '',
      pdf: publication.resources?.pdf || '',
      video: publication.resources?.video || '',
      prototype: publication.resources?.prototype || '',
      // 可以添加其他需要的属性映射
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <Description title="Contact" >
          <p>No. 148 Tianmushan Road, Xixi Campus, ZJU, Hangzhou, 310007, China</p>
          <p>tangtan@zju.edu.cn</p>
        </Description>
        <Description title="Join Us !" className="joinUs" >
          <p>I am actively looking for prospective Postgraduate students, doctoral students and PostDocs who are interested in joining or collaborating with us, across disciplines. If you are interested, please feel free to send me an email</p>
        </Description>

        <Thumbnail title="Join Us !" className="joinUs" />
        
        {/* 显示论文卡片 */}
        {loading ? (
          <p>加载中...</p>
        ) : error ? (
          <p>错误: {error}</p>
        ) : (
          <div className="publications-container">
            {publications.map((pub) => (
              <Card 
                className="publication"
                key={pub.id}
                {...mapPublicationToCardProps(pub)}
              />
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
