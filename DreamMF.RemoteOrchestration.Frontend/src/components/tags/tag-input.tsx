import { useState } from 'react';
import { Select, Tag as AntDTag, Tooltip, Input } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { useTags, useCreateTag, useTagsByHost, useTagsByRemote, useRemoveTagAssociation, useAddTagToEntity, type Tag } from '@/hooks/useTags';

interface TagInputProps {
    entityType: 'host' | 'remote';
    entityId: number;
}

export const TagInput: React.FC<TagInputProps> = ({ entityType, entityId }) => {
    const [inputVisible, setInputVisible] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState<number>();
    const [tagKey, setTagKey] = useState<string>('');
    const [tagValue, setTagValue] = useState<string>('');

    const { data: allTags = [] } = useTags();
    const { data: hostTags = [] } = useTagsByHost(entityType === 'host' ? entityId : 0);
    const { data: remoteTags = [] } = useTagsByRemote(entityType === 'remote' ? entityId : 0);
    const createTag = useCreateTag();
    const removeTagAssociation = useRemoveTagAssociation();
    const addTag = useAddTagToEntity();

    const tags = entityType === 'host' ? hostTags : remoteTags;
    const selectedTag = allTags?.find(t => t.tag_ID === selectedTagId);

    const handleClose = async (removedTag: Tag) => {
        try {
            await removeTagAssociation.mutateAsync({
                tagId: removedTag.tag_ID,
                itemId: entityId,
                type: entityType
            });
        } catch (error) {
            console.error('Failed to remove tag:', error);
        }
    };

    const handleTagSelect = (values: string[]) => {
        const value = values[values.length - 1] || '';
        const existingTag = allTags?.find(t => t.key === value);
        if (existingTag) {
            setSelectedTagId(existingTag.tag_ID);
        }
        setTagKey(value);
    };

    const handleAdd = async () => {
        if (!tagKey || !tagValue) return;

        try {
            let tagId: number;
            
            if (selectedTag) {
                tagId = selectedTag.tag_ID;
            } else {
                // Create new tag first
                const newTag = await createTag.mutateAsync({
                    key: tagKey,
                    display_Name: tagKey
                });
                tagId = newTag.tag_ID;
            }

            // Attach the tag to the entity
            await addTag.mutateAsync({
                entityType,
                entityId,
                tagId,
                value: tagValue
            });

            setSelectedTagId(undefined);
            setTagKey('');
            setTagValue('');
            setInputVisible(false);
        } catch (error) {
            console.error('Failed to add tag:', error);
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
                            color="purple"
                            style={{ padding: '5px 10px' }}
                            onClose={() => handleClose(tag)}
                            className="flex items-center gap-1"
                        >
                            <TagOutlined className="mr-1" />
                            <span>{tag.key}</span>
                            {tag.value && (
                                <span className="ml-1 text-gray-500">
                                 {tag.value}
                                </span>
                            )}
                        </AntDTag>
                    );
                    return tag.value ? (
                        <Tooltip key={tag.tag_ID} title={`Value: ${tag.value}`}>
                            {tagElement}
                        </Tooltip>
                    ) : (
                        tagElement
                    );
                })}
            </div>

            {inputVisible ? (
                <div className="flex gap-2">
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
                    <Input
                        value={tagValue}
                        onChange={(e) => setTagValue(e.target.value)}
                        placeholder="Enter value"
                        onPressEnter={handleAdd}
                    />
                    <button
                        onClick={handleAdd}
                        type="button"
                        className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                    <button
                        onClick={() => {
                            setInputVisible(false);
                            setTagKey('');
                            setTagValue('');
                        }}
                        className="px-4 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/90"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setInputVisible(true)}
                    className="px-3 py-1 border border-dashed border-gray-300 rounded hover:border-blue-500 hover:text-blue-500"
                >
                    + New Tag
                </button>
            )}
        </div>
    );
};
