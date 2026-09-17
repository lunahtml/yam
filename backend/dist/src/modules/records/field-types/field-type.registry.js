//backend/src/modules/records/field-types/field-type.registry.ts
import { z } from 'zod';
const TextField = {
    key: 'text',
    label: 'Текст',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    // validate: (value) => {
    //     if (value === null || value === undefined) return value;
    //     return z.string().parse(value);
    // },
    validate: (value) => {
        if (value === null || value === undefined)
            return value;
        return z.string().max(10000).parse(value);
    },
};
const NumberField = {
    key: 'number',
    label: 'Число',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: true,
    validate: (value) => {
        if (value === null || value === undefined)
            return value;
        return z.number().parse(value);
    },
};
const DateField = {
    key: 'date',
    label: 'Дата',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined)
            return value;
        return z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).parse(value);
    },
};
const BooleanField = {
    key: 'boolean',
    label: 'Да/Нет',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined)
            return value;
        return z.boolean().parse(value);
    },
};
const SelectField = {
    key: 'select',
    label: 'Список',
    supportsFiltering: true,
    supportsSorting: true,
    supportsAggregation: false,
    validate: (value, options) => {
        // if (value === null || value === undefined) return value;
        // const str = z.string().parse(value);
        if (value === null || value === undefined)
            return value;
        const str = z.string().max(500).parse(value);
        if (options && typeof options === 'object' && 'choices' in options) {
            const choices = options.choices;
            if (Array.isArray(choices) && !choices.includes(str)) {
                throw new Error(`Value "${str}" is not in allowed choices`);
            }
        }
        return str;
    },
};
const UserField = {
    key: 'user',
    label: 'Пользователь',
    supportsFiltering: true,
    supportsSorting: false,
    supportsAggregation: false,
    validate: (value) => {
        if (value === null || value === undefined)
            return value;
        return z.string().cuid().parse(value);
    },
};
const Registry = {
    text: TextField,
    number: NumberField,
    date: DateField,
    boolean: BooleanField,
    select: SelectField,
    user: UserField,
};
export class FieldTypeRegistry {
    static get(key) {
        return Registry[key];
    }
    static has(key) {
        return key in Registry;
    }
    static list() {
        return Object.values(Registry);
    }
    static keys() {
        return Object.keys(Registry);
    }
}
//# sourceMappingURL=field-type.registry.js.map