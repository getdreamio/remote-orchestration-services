import { useState } from 'react';
import { Select, Tag as AntDTag, Tooltip, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useTags, useCreateTag, type Tag, type TagRequest } from '@/hooks/useTags';
import { config } from '@/config/env';

interface TagInputProps {
    value?: Tag[];
    onChange?: (tags: Tag[]) => void;
    entityType: 'host' | 'remote';
    entityId: number;
}

export const TagInput: React.FC<TagInputProps> = ({ value: tags = [], onChange = () => {}, entityType, entityId }) => {
    const [inputVisible, setInputVisible] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<number>();
    const [tagKey, setTagKey] = useState<string>('');
    const [tagValue, setTagValue] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');

    const { data: allTags } = useTags();
    const createTag = useCreateTag();

    const selectedTag = allTags?.find(t => t.tag_ID === selectedTagId);

    const handleClose = (removedTag: Tag) => {
        onChange(tags.filter(tag => tag !== removedTag));
    };

    const handleTagSelect = (values: string[]) => {
        const value = values[values.length - 1] || '';
        const existingTag = allTags?.find(t => t.key === value);
        if (existingTag) {
            setSelectedTagId(existingTag.tag_ID);
        }
        setTagKey(value);
    };

    const attachTagToEntity = async (entityType: string, entityId: number, tagId: number, value: string) => {
        const response = await fetch(`${config.backendUrl}/api/tags/add-to-entity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entityType,
                entityId,
                tagId: tagId.toString(),
                value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to attach tag to entity');
        }
    };

    const handleAdd = async () => {
        if (!tagKey || !tagValue) return;

        try {
            let tagToAdd: Tag;
            let tagId: number;
            
            if (selectedTag) {
                tagId = selectedTag.tag_ID;
                tagToAdd = {
                    ...selectedTag,
                    value: tagValue
                };
            } else {
                // Create new tag first
                const newTag = await createTag.mutateAsync({
                    key: tagKey
                });
                tagId = newTag.tag_ID;
                tagToAdd = {
                    ...newTag,
                    value: tagValue
                };
            }

            // Attach the tag to the entity
            await attachTagToEntity(entityType, entityId, tagId, tagValue);

            onChange([...tags, tagToAdd]);
            setSelectedTagId(undefined);
            setTagKey('');
            setTagValue('');
            setDisplayName('');
            setInputVisible(false);
        } catch (error) {
            console.error('Failed to add tag:', error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div className="space-y-2 max-w-[600px]">
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
                            <span>{tag.value}</span>
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
                            placeholder="Select or enter tag"
                            value={tagKey ? [tagKey] : []}
                            onChange={handleTagSelect}
                            mode="tags"
                            showSearch
                            allowClear
                            maxTagCount={1}
                            options={allTags?.map(tag => ({
                                value: tag.key,
                                label: tag.key
                            }))}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="Enter value"
                            value={tagValue}
                            onChange={(e) => setTagValue(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!tagKey || !tagValue}
                        className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setInputVisible(false);
                            setSelectedTagId(undefined);
                            setTagKey('');
                            setTagValue('');
                            setDisplayName('');
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
