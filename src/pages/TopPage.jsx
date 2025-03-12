import React, { useEffect, useState } from 'react';
import styles from './css/TopPage.module.css';
import Description from '../components/Description';
import Affiliation from '../components/Affiliation';
import { CircleIcon, DatabaseIcon, LighteningIcon, LinkIcon, SquareIcon, TriangleIcon } from '../assets/icons/svg_icons';
import photo from '../assets/images/tangtanPhoto_x215.png';
import Thumbnail from '../components/Thumbnail';
import Card from '../components/Card';
// import githubIcon from '../assets/images/icons/github.svg';
// import googleScholarIcon from '../assets/images/icons/googleScholar.svg';
// import dblpIcon from '../assets/images/icons/dblp.svg';
// import orcidIcon from '../assets/images/icons/orcid.svg';

const TopPage = () => {
    const [selectedMenu, setSelectedMenu] = useState('Home');
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
            highlight: publication.highlight || false,
            // 可以添加其他需要的属性映射
        };
    };

    return (
        <div className={styles.topPage}>
            {/* 背景装饰点 */}
            <div className={`${styles.glowPoint}`} id={styles.point1}></div>
            <div className={`${styles.glowPoint}`} id={styles.point2}></div>

            {/* 左侧Profile */}
            <div className={styles.profile}>
                {/* 名片部分 */}
                <div className={styles.namecard}>
                    <img
                        src={photo}
                        className={styles.avatar}
                        alt="用户头像"
                    />
                    <p id={styles.englishName}>Tan Tang</p>
                    <p id={styles.chineseName}>唐谈</p>
                    <p id={styles.title}>Zhejiang University 100 Young Professor</p>
                    <div id={styles.websites}>
                        <a href="https://github.com/tangtan" target="_blank" rel="noopener noreferrer" className={styles.website}>
                            {/* <img src={githubIcon} alt="GitHub" /> */}
                        </a>
                        <a href="https://scholar.google.com/citations?user=YOUR_ID" target="_blank" rel="noopener noreferrer" className={styles.website}>
                            {/* <img src={googleScholarIcon} alt="Google Scholar" /> */}
                        </a>
                        <a href="https://dblp.org/pid/YOUR_ID" target="_blank" rel="noopener noreferrer" className={styles.website}>
                            {/* <img src={dblpIcon} alt="DBLP" /> */}
                        </a>
                        <a href="https://orcid.org/YOUR_ID" target="_blank" rel="noopener noreferrer" className={styles.website}>
                            {/* <img src={orcidIcon} alt="ORCID" /> */}
                        </a>
                    </div>
                </div>

                {/* 描述部分 */}
                <div className={styles.descriptionContainer}>
                    <Description title="Current Affiliation" contentClassName={styles.description}>
                        <Affiliation lab="Lab Of Art And Archaeology Image, ZJU" school="School of Art and Archeaology" positions={["Researcher", "Doctoral Supervisor"]} />
                        <Affiliation lab="State Key Lab of CAD&CG, ZJU" school="College of Computer Science And Technology" positions={["Researcher", "Doctoral Supervisor"]} />
                    </Description>

                    <Description title="Contact">
                        <p>No. 148 Tianmushan Road, Xixi Campus, ZJU, Hangzhou, 310007, China</p>
                        <p>tangtan@zju.edu.cn</p>
                    </Description>

                    <Description title="Join Us !">
                        <p>I am actively looking for prospective <strong>Postgraduate students, doctoral students</strong> and <strong>PostDocs</strong> who are interested in joining or collaborating with us, across disciplines. If you are interested, please feel free to <strong>send me an email</strong></p>
                    </Description>
                </div>
            </div>

            {/* 右侧主要内容区域 */}
            <div className={styles.mainContent}>
                {/* 菜单部分 */}
                <div className={styles.menu}>
                    <p
                        className={`${selectedMenu === 'Home' ? styles.menuItemSelected : styles.menuItem}`}
                        onClick={() => setSelectedMenu('Home')}
                    >
                        Home
                        {selectedMenu === 'Home' && <div className={styles.menuItemSelectedUnderline} />}
                    </p>
                    <p
                        className={`${selectedMenu === 'Publications' ? styles.menuItemSelected : styles.menuItem}`}
                        onClick={() => setSelectedMenu('Publications')}
                    >
                        Publications
                        {selectedMenu === 'Publications' && <div className={styles.menuItemSelectedUnderline} style={{ width: '162px' }} />}
                    </p>
                </div>

                {selectedMenu === 'Home' && (
                    <>
                        {/* 标语部分 */}
                        <div className={styles.sloganContainer}>
                            <p className={styles.sloganTitle}>Innovating Human-Computer Interaction</p>
                            <p className={styles.sloganText}>Exploring new frontiers in cross-disciplinary research between art and technology</p>
                        </div>

                        {/* 研究方向 */}
                        <div className={styles.researchDirectionContainer}>
                            <p className={styles.researchDirectionTitle}>Research Directions</p>
                            <div className={styles.researchDirectionContent}>
                                <div className={styles.researchDirectionItem}>
                                    <CircleIcon />
                                    <p className={styles.title}>艺术x科技</p>
                                    <p className={styles.text}>探索人工智能在艺术设计中扮演的角色，探究人工智能与人类智慧在设计创作中的协同机制</p>
                                </div>
                                <LinkIcon />
                                <div className={styles.researchDirectionItem}>
                                    <SquareIcon />
                                    <p className={styles.title}>大数据x人文艺术</p>
                                    <p className={styles.text}>利用大数据+软件工程的方法来促进普通人对于人文艺术的理解、分析与"再"创作。</p>
                                </div>
                                <LinkIcon />
                                <div className={styles.researchDirectionItem}>
                                    <TriangleIcon />
                                    <p className={styles.title}>人工智能x扩展现实</p>
                                    <p className={styles.text}>探索如何利用AI技术增强XR体验，以实现更智能化、沉浸式的虚拟现实应用。</p>
                                </div>
                            </div>
                        </div>

                        {/* 研究项目 */}
                        <div className={styles.projectsContainer}>
                            <p className={styles.projectsTitle}>Projects</p>
                            <div className={styles.projectsContent}>
                                {loading ? (
                                    <p>Loading highlights...</p>
                                ) : error ? (
                                    <p>Error loading highlights: {error}</p>
                                ) : publications.filter(pub => pub.highlight).length === 0 ? (
                                    <p>No featured projects currently</p>
                                ) : (
                                    publications
                                        .filter(pub => pub.highlight)
                                        .map((publication) => (
                                            <Thumbnail
                                                key={publication.id}
                                                title={publication.title}
                                                imageSrc={publication.thumbnails?.[0]}
                                                onClick={() => window.open(publication.resources?.official, '_blank')}
                                            />
                                        ))
                                )}
                            </div>
                        </div>
                    </>
                )}
                {selectedMenu === 'Publications' && (
                    /* Publications页内容 */
                    <div className={styles.publicationsContainer}>
                        {loading ? (
                            <p>加载中...</p>
                        ) : error ? (
                            <p>错误: {error}</p>
                        ) : (
                            publications.map((pub) => (
                                <Card
                                    key={pub.id}
                                    {...mapPublicationToCardProps(pub)}
                                    className={styles.publicationCard}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopPage;
