import { useState } from 'react';
import { Select, Tag as AntDTag, Tooltip } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useTags, type Tag } from '@/hooks/useTags';


interface TagInputProps {
    value?: Tag[];
    onChange?: (tags: Tag[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ value: tags, onChange}) => {
    const [inputVisible, setInputVisible] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<number>();

    const { data: allTags } = useTags();

    const selectedTag = allTags?.find(t => t.tag_ID === selectedTagId);

    const handleClose = (removedTag: Tag) => {
        onChange(tags.filter(tag => tag !== removedTag));
    };

    const handleAdd = () => {
        if (selectedTag) {
            onChange([...tags, selectedTag]);
            setSelectedTagId(undefined);
            setInputVisible(false);
        }
    };
 
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => {
                    const tagElement = (
                        <AntDTag
                            key={`${tag.tag_ID}`}
                            closable
                            onClose={() => handleClose(tag)}
                            className="flex items-center gap-1"
                        >
                            <span className="font-medium">{tag.key}</span>
                            <span className="text-muted-foreground">:</span>
                            <span>{tag.display_Name}</span>
                        </AntDTag>
                    );
                    return (
                        <Tooltip key={`${tag.key}:${tag.display_Name}`} title={`${tag.key}: ${tag.display_Name}`}>
                            {tagElement}
                        </Tooltip>
                    );
                })}
                {!inputVisible && (
                    <AntDTag
                        className="bg-transparent border-dashed cursor-pointer hover:border-primary"
                        onClick={() => setInputVisible(true)}
                    >
                        <TagOutlined /> Add Tag
                    </AntDTag>
                )}
            </div>

            {inputVisible && (
                <div className="flex gap-2 items-start">
                    <div className="flex-1">
                        <Select
                            className="w-full"
                            placeholder="Key"
                            value={selectedTagId}
                            onChange={setSelectedTagId}
                            showSearch
                            allowClear
                        >
                            {allTags?.map(tag => (
                                <Select.Option key={tag.tag_ID} value={tag.tag_ID}>
                                    {tag.display_Name}
                                </Select.Option>
                            ))}
                            <Select.Option value={selectedTagId} disabled={selectedTag}>
                                {selectedTag?.display_Name}
                            </Select.Option>
                        </Select>
                    </div>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!selectedTagId}
                        className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setInputVisible(false);
                            setSelectedTagId(undefined);
                        }}
                        className="px-4 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/90"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};
