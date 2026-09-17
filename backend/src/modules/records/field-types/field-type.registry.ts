//backend/src/modules/records/field-types/field-type.registry.ts
import { z } from 'zod';

export interface FieldTypeDefinition {
    key: string;
    label: string;
    validate: (value: unknown, options?: unknown) => unknown;
    supportsFiltering: boolean;
    supportsSorting: boolean;
    supportsAggregation: boolean;
}

const TextField: FieldTypeDefinition = {
    key: 'text',
    label: 'Текст',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined) return value;
        return z.string().parse(value);
    },
};

const NumberField: FieldTypeDefinition = {
    key: 'number',
    label: 'Число',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: true,
    validate: (value) => {
        if (value === null || value === undefined) return value;
        return z.number().parse(value);
    },
};

const DateField: FieldTypeDefinition = {
    key: 'date',
    label: 'Дата',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined) return value;
        return z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).parse(value);
    },
};

const BooleanField: FieldTypeDefinition = {
    key: 'boolean',
    label: 'Да/Нет',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined) return value;
        return z.boolean().parse(value);
    },
};

const SelectField: FieldTypeDefinition = {
    key: 'select',
    label: 'Список',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value, options) => {
        if (value === null || value === undefined) return value;
        const str = z.string().parse(value);

        if (options && typeof options === 'object' && 'choices' in options) {
            const choices = (options as { choices?: string[] }).choices;
            if (Array.isArray(choices) && !choices.includes(str)) {
                throw new Error(`Value "${str}" is not in allowed choices`);
            }
        }

        return str;
    },
};

const UserField: FieldTypeDefinition = {
    key: 'user',
    label: 'Пользователь',
    supportsFiltering: true,
    supportsSorting: false,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined) return value;
        return z.string().cuid().parse(value);
    },
};

const Registry: Record<string, FieldTypeDefinition> = {
    text: TextField,
    number: NumberField,
    date: DateField,
    boolean: BooleanField,
    select: SelectField,
    user: UserField,
};

export class FieldTypeRegistry {
    static get(key: string): FieldTypeDefinition | undefined {
        return Registry[key];
    }

    static has(key: string): boolean {
        return key in Registry;
    }

    static list(): FieldTypeDefinition[] {
        return Object.values(Registry);
    }

    static keys(): string[] {
        return Object.keys(Registry);
    }
}