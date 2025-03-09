import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input, Card, List, Tag, Empty, Spin, Typography, Badge, Row, Col, Divider, Button } from 'antd';
import { TagOutlined, LinkOutlined, EnvironmentOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useSearch, Tag as TagType } from '@/hooks/useSearch';
import { Link, useSearchParams } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Helmet } from 'react-helmet';

const { Text } = Typography;

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState(searchParams.get('q') || '');
    const [debouncedSearchText, setDebouncedSearchText] = useState(searchParams.get('q') || '');
    const searchInputRef = useRef<any>(null);
    // Removed tag values state as we're handling search differently now
    const { data: results, isLoading } = useSearch(debouncedSearchText, []);

    // Create a memoized debounced handler to prevent recreation on each render
    const debouncedHandler = useMemo(() => {
        return debounce((text: string) => {
            setDebouncedSearchText(text);
            
            const params: Record<string, string> = {};
            if (text) {
                params.q = text;
            }
            
            if (Object.keys(params).length > 0) {
                setSearchParams(params);
            } else {
                setSearchParams({});
            }
        }, 300);
    }, [setSearchParams]);

    // Apply the debounced handler when search inputs change
    useEffect(() => {
        debouncedHandler(searchText);
        return () => debouncedHandler.cancel();
    }, [searchText, debouncedHandler]);
    
    // No longer initializing tag values from URL params

    // Using the Tag type from useSearch.ts
    
    const renderTags = useCallback((tags: TagType[]) => {
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
                                <span 
                                    style={{ color: '#722ED1', opacity: 0.8, cursor: 'pointer' }}
                                    onClick={() => {
                                        // Add key:value to search text
                                        const valueToAdd = values[0];
                                        if (valueToAdd) {
                                            setSearchText(`${key}:${valueToAdd}`);
                                        }
                                    }}
                                >
                                    {values.join(', ')}
                                </span>
                            </>
                        )}
                    </Tag>
                ))}
            </div>
        );
    }, [setSearchText]);
    
    // No longer extracting tag values for dropdown

    const renderResultsCount = useCallback(() => {
        if (!results || (!results.hosts.length && !results.remotes.length)) {
            if (searchText.trim()) {
                return (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Text type="secondary" className="block dark:text-gray-400">
                            No results found {searchText.trim() ? `for "${searchText}"` : ''}
                        </Text>
                    </div>
                );
            }
            return null;
        }
        
        const total = (results.hosts?.length || 0) + (results.remotes?.length || 0);
        return (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Text strong className="block dark:text-white">
                    Found {total} result{total !== 1 ? 's' : ''}
                </Text>
                <div className="mt-1 flex gap-2">
                    {results.hosts.length > 0 && (
                        <Badge count={results.hosts.length} showZero style={{ backgroundColor: '#722ED1' }} />
                    )}
                    {results.hosts.length > 0 && (
                        <Text type="secondary" className="dark:text-gray-400">
                            {results.hosts.length} host{results.hosts.length !== 1 ? 's' : ''}
                        </Text>
                    )}
                    {results.remotes.length > 0 && (
                        <Badge count={results.remotes.length} showZero style={{ backgroundColor: '#1890ff' }} />
                    )}
                    {results.remotes.length > 0 && (
                        <Text type="secondary" className="dark:text-gray-400">
                            {results.remotes.length} remote{results.remotes.length !== 1 ? 's' : ''}
                        </Text>
                    )}
                </div>
            </div>
        );
    }, [results, searchText]);

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
                    <Card className="search-card shadow-md border-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="w-full md:w-2/3">
                                    <Input.Search
                                        ref={searchInputRef}
                                        size="large"
                                        placeholder="Search hosts and remotes..."
                                        value={searchText}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                                        className="search-input w-full dark:bg-gray-800 dark:border-gray-700"
                                        enterButton
                                        allowClear
                                    />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Button 
                                            type="link" 
                                            size="small"
                                            onClick={() => {
                                                // Check if text already contains a filter
                                                const text = searchText.includes(':') ? '' : searchText;
                                                setSearchText(`description:${text}`);
                                                // Focus on the search input after setting the text
                                                setTimeout(() => {
                                                    searchInputRef.current?.focus();
                                                }, 0);
                                            }}
                                            className="text-xs px-2 py-0"
                                        >
                                            <SearchOutlined className="mr-1" />Find by description
                                        </Button>
                                        <Button 
                                            type="link" 
                                            size="small"
                                            onClick={() => {
                                                // Check if text already contains a filter
                                                const text = searchText.includes(':') ? '' : searchText;
                                                setSearchText(`name:${text}`);
                                                // Focus on the search input after setting the text
                                                setTimeout(() => {
                                                    searchInputRef.current?.focus();
                                                }, 0);
                                            }}
                                            className="text-xs px-2 py-0"
                                        >
                                            <SearchOutlined className="mr-1" />Find by name
                                        </Button>
                                        <Button 
                                            type="link" 
                                            size="small"
                                            onClick={() => {
                                                // Check if text already contains a filter
                                                const text = searchText.includes(':') ? '' : searchText;
                                                setSearchText(`tag:${text}`);
                                                // Focus on the search input after setting the text
                                                setTimeout(() => {
                                                    searchInputRef.current?.focus();
                                                }, 0);
                                            }}
                                            className="text-xs px-2 py-0"
                                        >
                                            <TagOutlined className="mr-1" />Find by tag
                                        </Button>
                                        <Button 
                                            type="link" 
                                            size="small"
                                            onClick={() => {
                                                // Check if text already contains a filter
                                                const text = searchText.includes(':') ? '' : searchText;
                                                setSearchText(`module:${text}`);
                                                // Focus on the search input after setting the text
                                                setTimeout(() => {
                                                    searchInputRef.current?.focus();
                                                }, 0);
                                            }}
                                            className="text-xs px-2 py-0"
                                        >
                                            <SearchOutlined className="mr-1" />Find by module
                                        </Button>
                                    </div>
                                </div>
                                {/* Removed Project Name and Module buttons */}
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Text type="secondary" className="text-xs dark:text-gray-500">
                                        Examples: "name:dashboard", "description:dream", "Project Name:dream"
                                    </Text>
                                </div>
                                {searchText.trim() && (
                                    <Badge count={results ? (results.hosts.length + results.remotes.length) : 0} 
                                           showZero 
                                           style={{ backgroundColor: results && (results.hosts.length + results.remotes.length) > 0 ? '#722ED1' : '#ccc' }} />
                                )}
                            </div>
                        </div>
                    </Card>
                    <div className="mt-4">
                        {renderResultsCount()}
                        {/* Removed tag filters section */}
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
                                                renderItem={(host: any) => (
                                                    <List.Item className="dark:border-gray-700">
                                                        <List.Item.Meta
                                                            title={
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Link to={`/hosts/${host.id}`} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                                                                            {host.name}
                                                                        </Link>
                                                                        {host.environment && (
                                                                            <Tag color="blue" className="dark:bg-blue-900 dark:text-blue-100">
                                                                                <EnvironmentOutlined /> {host.environment}
                                                                            </Tag>
                                                                        )}
                                                                    </div>
                                                                    {renderTags(host.tags || [])}
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
                                                renderItem={(remote: any) => (
                                                    <List.Item className="dark:border-gray-700">
                                                        <List.Item.Meta
                                                            title={
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <Link to={`/remotes/${remote.id}`} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                                                                        {remote.name}
                                                                    </Link>
                                                                    {renderTags(remote.tags || [])}
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
