//backend/src/modules/records/contracts/list-records.dto.ts
import { z } from 'zod';
export const ListRecordsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(1000).default(20),
    sortBy: z.string().optional(),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
    filterField: z.string().optional(),
    filterValue: z.string().optional(),
    sprintId: z.string().optional(),
});
//# sourceMappingURL=list-records.dto.js.map