import { useState, useEffect } from 'react';
import { Input, Card, List, Tag, Empty, Spin, Typography, Badge, Row, Col, Space, Divider } from 'antd';
import { SearchOutlined, TagOutlined, LinkOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSearch } from '@/hooks/useSearch';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Helmet } from 'react-helmet';

const { Title, Text } = Typography;

const Search = () => {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const { data: results, isLoading } = useSearch(debouncedSearchText);

    // Debounce search input to reduce API calls
    useEffect(() => {
        const handler = debounce(() => {
            setDebouncedSearchText(searchText);
        }, 300);

        handler();
        return () => handler.cancel();
    }, [searchText]);

    const renderTags = (tags: any[]) => {
        if (!tags?.length) return null;
        
        // Group tags by key for better organization
        const groupedTags = tags.reduce((acc, tag) => {
            if (!acc[tag.key]) {
                acc[tag.key] = [];
            }
            if (tag.value) {
                acc[tag.key].push(tag.value);
            }
            return acc;
        }, {} as Record<string, string[]>);

        return (
            <div className="flex flex-wrap gap-2">
                {Object.entries(groupedTags).map(([key, values]) => (
                    <Tag 
                        key={key}
                        className="!m-0 dark:border-purple-700"
                        style={{ 
                            background: 'rgba(114, 46, 209, 0.05)',
                            border: '1px solid #722ED1',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <TagOutlined style={{ color: '#722ED1', fontSize: '12px' }} />
                        <span style={{ color: '#722ED1', fontWeight: 500 }}>{key}</span>
                        {values.length > 0 && (
                            <>
                                <Divider type="vertical" style={{ margin: '0 4px', borderColor: 'rgba(114, 46, 209, 0.4)' }} />
                                <span style={{ color: '#722ED1', opacity: 0.8 }}>
                                    {values.join(', ')}
                                </span>
                            </>
                        )}
                    </Tag>
                ))}
            </div>
        );
    };

    const renderResultsCount = () => {
        if (!results || (!results.hosts.length && !results.remotes.length)) return null;
        const total = (results.hosts?.length || 0) + (results.remotes?.length || 0);
        return (
            <Text type="secondary" className="mb-4 block dark:text-gray-400">
                Found {total} result{total !== 1 ? 's' : ''}
                {results.hosts.length > 0 && ` • ${results.hosts.length} host${results.hosts.length !== 1 ? 's' : ''}`}
                {results.remotes.length > 0 && ` • ${results.remotes.length} remote${results.remotes.length !== 1 ? 's' : ''}`}
            </Text>
        );
    };

    return (
        <>
            <Helmet>
                <title>[ROS] | Search</title>
                <meta name="description" content="Dream.mf [ROS] | Search Page" />
            </Helmet>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Search</h1>
            </div>
            <>
                <div className="mb-8">
                    <Input.Search
                        size="large"
                        placeholder="Search hosts and remotes..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input max-w-[600px] dark:bg-gray-800 dark:border-gray-700"
                        enterButton
                    />
                    <div className="mt-4">
                        {renderResultsCount()}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={[24, 24]}>
                        {(!results?.hosts.length && !results?.remotes.length) ? (
                            <Col span={24}>
                                <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
                                    <Empty
                                        description={
                                            searchText ? (
                                                <Text type="secondary" className="dark:text-gray-400">No results found for "{searchText}"</Text>
                                            ) : (
                                                <Text type="secondary" className="dark:text-gray-400">Enter a search term to begin</Text>
                                            )
                                        }
                                    />
                                </Card>
                            </Col>
                        ) : (
                            <>
                                {results?.hosts.length > 0 && (
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span>Hosts</span>
                                                    <Badge 
                                                        count={results.hosts.length} 
                                                        style={{ 
                                                            backgroundColor: 'transparent',
                                                            color: '#722ED1',
                                                            border: '1px solid #722ED1',
                                                            borderRadius: '10px',
                                                            padding: '0 8px',
                                                            fontSize: '12px',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </div>
                                            }
                                            className="h-full dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            <List
                                                dataSource={results.hosts}
                                                renderItem={(host) => (
                                                    <List.Item className="dark:border-gray-700">
                                                        <List.Item.Meta
                                                            title={
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Link to={`/hosts/edit/${host.host_ID}`} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                                                                            {host.name}
                                                                        </Link>
                                                                        {host.environment && (
                                                                            <Tag color="blue" className="dark:bg-blue-900 dark:text-blue-100">
                                                                                <EnvironmentOutlined /> {host.environment}
                                                                            </Tag>
                                                                        )}
                                                                    </div>
                                                                    {renderTags(host.tags)}
                                                                </div>
                                                            }
                                                            description={
                                                                <div className="space-y-2 mt-2">
                                                                    {host.description && (
                                                                        <Text type="secondary" className="block dark:text-gray-400">
                                                                            {host.description}
                                                                        </Text>
                                                                    )}
                                                                    {host.url && (
                                                                        <div>
                                                                            <Link to={host.url} className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300 text-sm">
                                                                                <LinkOutlined className="mr-1" />
                                                                                {host.url}
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </Card>
                                    </Col>
                                )}

                                {results?.remotes.length > 0 && (
                                    <Col xs={24} lg={12}>
                                        <Card 
                                            title={
                                                <div className="flex justify-between items-center">
                                                    <span>Remotes</span>
                                                    <Badge 
                                                        count={results.remotes.length} 
                                                        style={{ 
                                                            backgroundColor: 'transparent',
                                                            color: '#722ED1',
                                                            border: '1px solid #722ED1',
                                                            borderRadius: '10px',
                                                            padding: '0 8px',
                                                            fontSize: '12px',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </div>
                                            }
                                            className="h-full dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            <List
                                                dataSource={results.remotes}
                                                renderItem={(remote) => (
                                                    <List.Item className="dark:border-gray-700">
                                                        <List.Item.Meta
                                                            title={
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <Link to={`/remotes/edit/${remote.remote_ID}`} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                                                                        {remote.name}
                                                                    </Link>
                                                                    {renderTags(remote.tags)}
                                                                </div>
                                                            }
                                                            description={
                                                                <div className="space-y-2 mt-2">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                                        <ClockCircleOutlined />
                                                                        <Text type="secondary" className="dark:text-gray-400">
                                                                            Key: {remote.key}
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </Card>
                                    </Col>
                                )}
                            </>
                        )}
                    </Row>
                )}
            </>
        </>
    );
};

export default Search;
