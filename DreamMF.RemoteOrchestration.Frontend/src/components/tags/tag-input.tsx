import React, { useState, useEffect } from 'react';
import { Select, Tag, Tooltip } from 'antd';
import { TagOutlined } from '@ant-design/icons';

export interface TagItem {
    key: string;
    value: string;
}

interface TagInputProps {
    tags: TagItem[];
    onChange: (tags: TagItem[]) => void;
    existingTags?: TagItem[]; // For tag suggestions
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, existingTags = [] }) => {
    const [inputVisible, setInputVisible] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<string>('');

    // Get unique keys from existing tags for suggestions
    const uniqueKeys = Array.from(new Set(existingTags.map(tag => tag.key)));

    const handleClose = (removedTag: TagItem) => {
        onChange(tags.filter(tag => !(tag.key === removedTag.key && tag.value === removedTag.value)));
    };

    const handleAdd = () => {
        if (selectedKey && selectedValue) {
            const newTag = { key: selectedKey, value: selectedValue };
            onChange([...tags, newTag]);
            setSelectedKey('');
            setSelectedValue('');
            setInputVisible(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {tags && tags.map((tag) => {
                    const tagElement = (
                        <Tag
                            key={`${tag.key}:${tag.value}`}
                            closable
                            onClose={() => handleClose(tag)}
                            className="flex items-center gap-1"
                        >
                            <span className="font-medium">{tag.key}</span>
                            <span className="text-muted-foreground">:</span>
                            <span>{tag.value}</span>
                        </Tag>
                    );
                    return (
                        <Tooltip key={`${tag.key}:${tag.value}`} title={`${tag.key}: ${tag.value}`}>
                            {tagElement}
                        </Tooltip>
                    );
                })}
                {!inputVisible && (
                    <Tag
                        className="bg-transparent border-dashed cursor-pointer hover:border-primary"
                        onClick={() => setInputVisible(true)}
                    >
                        <TagOutlined /> Add Tag
                    </Tag>
                )}
            </div>
            
            {inputVisible && (
                <div className="flex gap-2 items-start">
                    <div className="flex-1">
                        <Select
                            className="w-full"
                            placeholder="Key"
                            value={selectedKey}
                            onChange={setSelectedKey}
                            showSearch
                            allowClear
                        >
                            {uniqueKeys.map(key => (
                                <Select.Option key={key} value={key}>
                                    {key}
                                </Select.Option>
                            ))}
                            <Select.Option value={selectedKey} disabled={uniqueKeys.includes(selectedKey)}>
                                Add new key: {selectedKey}
                            </Select.Option>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Select
                            className="w-full"
                            placeholder="Value"
                            value={selectedValue}
                            onChange={setSelectedValue}
                            showSearch
                            allowClear
                            disabled={!selectedKey}
                        >
                            {existingTags
                                .filter(tag => tag.key === selectedKey)
                                .map(tag => (
                                    <Select.Option key={tag.value} value={tag.value}>
                                        {tag.value}
                                    </Select.Option>
                                ))}
                            <Select.Option 
                                value={selectedValue} 
                                disabled={existingTags.some(t => t.key === selectedKey && t.value === selectedValue)}
                            >
                                Add new value: {selectedValue}
                            </Select.Option>
                        </Select>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!selectedKey || !selectedValue}
                        className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                    <button
                        onClick={() => {
                            setInputVisible(false);
                            setSelectedKey('');
                            setSelectedValue('');
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
