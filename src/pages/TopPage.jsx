import React, { useEffect, useState } from 'react';
import styles from './css/TopPage.module.css';
import Description from '../components/Description';
import Affiliation from '../components/Affiliation';
import { CircleIcon, DatabaseIcon, GithubIcon, GoogleScholarIcon, LighteningIcon, LinkIcon, SquareIcon, TriangleIcon } from '../assets/icons/svg_icons';
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
                    <p id={styles.title}>Zhejiang University Assistant Professor</p>
                    <div id={styles.websites}>
                        <a className={styles.website} href="https://scholar.google.co.uk/citations?user=lhtRAFcAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">
                            <GoogleScholarIcon />
                        </a>
                        <a className={styles.website} href="https://github.com/tangtan" target="_blank" rel="noopener noreferrer">
                            <GithubIcon />
                        </a>
                    </div>
                </div>

                {/* 描述部分 */}
                <div className={styles.descriptionContainer}>
                    <Description title="Current Affiliation" contentClassName={styles.description}>
                        <Affiliation lab="Lab of Art and Archaeology Image" school="School of Art and Archeaology, ZJU" href="http://www.soaa.zju.edu.cn/" positions={["Researcher", "Doctoral Supervisor"]} />
                        <Affiliation lab="Interactive Data Group" school="State Key Lab of CAD&CG, ZJU" href="https://zjuidg.org/" positions={["Researcher", "Doctoral Supervisor"]} />
                    </Description>

                    <Description title="Contact">
                        <p>No. 148 Tianmushan Road, Xixi Campus, Zhejiang University, Hangzhou, 310007, China</p>
                        <p>tangtan@zju.edu.cn</p>
                    </Description>

                    <Description title="Join Us !">
                        <p>I am actively looking for prospective <strong>Postgraduate Students, Undergraduate Students</strong> and <strong>PostDocs</strong> who are interested in joining or collaborating with us. Please feel free to <strong>send me an email</strong></p>
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
                            <p className={styles.sloganTitle}>Where Art Meets Open Possibilities</p>
                            <p className={styles.sloganText}>We're building bridges between art, science, and technology, where every mind can contribute and every voice can be heard.</p>
                        </div>

                        {/* 研究方向 */}
                        <div className={styles.researchDirectionContainer}>
                            <p className={`${styles.researchDirectionTitle} ${styles.sectionTitle}`}>Research Directions</p>
                            <LighteningIcon className={`${styles.researchDirectionIcon} ${styles.sectionTitleIcon}`} />
                            <div className={styles.researchDirectionContent}>
                                <div className={styles.researchDirectionItem}>
                                    <CircleIcon />
                                    <p className={styles.title}>Data Visualization</p>
                                    <p className={styles.text}>Studying how data being mapped to visual forms.</p>
                                </div>
                                <LinkIcon />
                                <div className={styles.researchDirectionItem}>
                                    <SquareIcon />
                                    <p className={styles.title}>AI+HCI</p>
                                    <p className={styles.text}>Understanding how AI fosters various design tasks.</p>
                                </div>
                                <LinkIcon />
                                <div className={styles.researchDirectionItem}>
                                    <TriangleIcon />
                                    <p className={styles.title}>Data Art</p>
                                    <p className={styles.text}>Exploring how data inspires creativity and innovations.</p>
                                </div>
                            </div>
                        </div>

                        {/* 研究项目 */}
                        <div className={styles.projectsContainer}>
                            <p className={`${styles.projectsTitle} ${styles.sectionTitle}`}>Pined Projects</p>
                            <DatabaseIcon className={`${styles.projectsIcon} ${styles.sectionTitleIcon}`} />
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
