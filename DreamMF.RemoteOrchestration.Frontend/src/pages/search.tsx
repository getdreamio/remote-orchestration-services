import { useState } from 'react';
import { Search as SearchIcon, Server, Database } from 'lucide-react';
import { TagInput } from '../components/tags/tag-input';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Helmet } from 'react-helmet';

const Search = () => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleSearch = () => {
        // TODO: Implement search functionality
        console.log('Searching for tags:', selectedTags);
    };

    return (
        <div>
            <Helmet>
                <title>[ROS] | Search</title>
                <meta name="description" content="Dream.mf [ROS] | Search Page" />
            </Helmet>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Searching by Tags</h1>
            </div>

            {/* Main Content */}
            <div className="mx-auto">
                <div className="flex flex-col space-y-8">
                    {/* Search Card */}
                    <Card className="p-6 shadow-lg border-2 border-muted/30">
                        <div className="flex flex-col space-y-6">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Search by Tags</label>
                                <TagInput
                                    selectedTags={selectedTags}
                                    onTagsChange={setSelectedTags}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleSearch}
                                    size="lg"
                                    className="w-full sm:w-auto transition-all hover:scale-105"
                                    disabled={selectedTags.length === 0}
                                >
                                    <SearchIcon className="w-5 h-5 mr-2" />
                                    Search Resources
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Results Section */}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Results</h2>
                            <p className="text-sm text-muted-foreground">
                                {selectedTags.length > 0 ? `${selectedTags.length} tags selected` : 'No tags selected'}
                            </p>
                        </div>
                        
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Example Result Cards - To be replaced with actual results */}
                            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-muted/30">
                                <div className="flex items-start space-x-4">
                                    <Server className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">Example Host</h3>
                                        <p className="text-sm text-muted-foreground">Host Description</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                example-tag
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-muted/30">
                                <div className="flex items-start space-x-4">
                                    <Database className="w-8 h-8 text-green-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">Example Remote</h3>
                                        <p className="text-sm text-muted-foreground">Remote Description</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                example-tag
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
