import React from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useHosts } from '@/hooks/useHosts';
import { formatDate } from '@/lib/date-utils';

interface Host {
    id: number;
    name: string;
    description: string;
    url: string;
    environment: string;
    updated_Date: string;
}

interface HostSelectionTableProps {
    selectedHostIds: number[];
    onSelectionChange: (selectedIds: number[]) => void;
}

const environmentColors = {
    Development: 'blue',
    Staging: 'orange',
    Production: 'green',
};

export function HostSelectionTable({ selectedHostIds, onSelectionChange }: HostSelectionTableProps) {
    const { data: hosts, isLoading } = useHosts();

    const columns: TableProps<Host>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            ellipsis: true,
        },
        {
            title: 'Environment',
            dataIndex: 'environment',
            key: 'environment',
            render: (env: keyof typeof environmentColors) => (
                <Tag color={environmentColors[env] || 'default'}>{env}</Tag>
            ),
            filters: [
                { text: 'Development', value: 'Development' },
                { text: 'Staging', value: 'Staging' },
                { text: 'Production', value: 'Production' },
            ],
            onFilter: (value, record) => record.environment === value,
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_Date',
            key: 'updated_Date',
            render: (date: string) => formatDate(date),
            sorter: (a, b) => new Date(a.updated_Date).getTime() - new Date(b.updated_Date).getTime(),
        },
    ];

    const rowSelection = {
        selectedRowKeys: selectedHostIds,
        onChange: (selectedRowKeys: React.Key[]) => {
            onSelectionChange(selectedRowKeys as number[]);
        },
    };

    return (
        <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={hosts}
            rowKey="id"
            loading={isLoading}
            size="middle"
            pagination={{ pageSize: 5 }}
            scroll={{ y: 300 }}
        />
    );
}
