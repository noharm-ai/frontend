type DataRow = Record<string, unknown> & { _index?: number; key?: string | number };

interface ColumnMeta {
    key: string;
    title: string;
    type: 'string' | 'number' | 'boolean' | 'object';
}

export const detectColumnType = (values: unknown[]): ColumnMeta['type'] => {
    const sample = values.slice(0, 100).filter(v => v !== null && v !== undefined && v !== '');
    if (sample.length === 0) return 'string';

    if (sample.every(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== ''))) {
        return 'number';
    }
    if (sample.every(v => typeof v === 'boolean' || v === 'true' || v === 'false')) {
        return 'boolean';
    }
    if (sample.every(v => typeof v === 'object')) {
        return 'object';
    }
    return 'string';
};

export const inferColumnsFromData = (data: DataRow[]): ColumnMeta[] => {
    if (data.length === 0) return [];

    const allKeys = new Set<string>();
    data.forEach(row => {
        Object.keys(row).forEach(key => {
            if (key !== '_index' && key !== 'key') allKeys.add(key);
        });
    });

    return Array.from(allKeys).map(key => {
        const values = data.map(row => row[key]);
        return {
            key,
            title: key,
            type: detectColumnType(values),
        };
    });
};

export const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
};

export const getTypeTagColor = (type: string): string => {
    switch (type) {
        case 'number': return 'cyan';
        case 'boolean': return 'green';
        case 'object': return 'purple';
        default: return 'default';
    }
};

export const getTypeTagLabel = (type: string): string => {
    switch (type) {
        case 'number': return 'Número';
        case 'boolean': return 'Sim/Não';
        case 'object': return 'Objeto';
        case 'string': return 'Texto';
        default: return 'Não identificado';
    }
};
