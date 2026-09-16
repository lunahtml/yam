//backend\src\modules\marketing-dashboard\contracts\create-dashboard.dto.ts
import { z } from 'zod';

export const CreateDashboardSchema = z.object({
    periodFrom: z.string(),      // ← принимает ЛЮБУЮ строку
    periodTo: z.string(),

    adBudget: z.number().min(0),
    marketingCosts: z.number().min(0),
    revenue: z.number().min(0),
    grossProfit: z.number(),

    impressions: z.number().min(0),
    clicks: z.number().min(0),
    leads: z.number().min(0),
    mql: z.number().min(0),
    sql: z.number().min(0),
    meetings: z.number().min(0),
    offers: z.number().min(0),
    deals: z.number().min(0),

    avgCheck: z.number().min(0),
    avgGrossMargin: z.number().min(0).max(1),
    avgLifetimeMonths: z.number().min(0),
    avgPurchaseFreq: z.number().min(0),
    avgRevenuePerClient: z.number().min(0),
    activeClients: z.number().min(0),
    repeatClients: z.number().min(0),
    retention: z.number().min(0).max(100),

    avgProductPrice: z.number().min(0),
    operationalCosts: z.number().min(0),
    organicVisits: z.number().min(0),
    totalVisits: z.number().min(0),
    bounces: z.number().min(0),
    newClients: z.number().min(0),
    tam: z.number().min(0),
    sam: z.number().min(0),
    som: z.number().min(0),
});

export type CreateDashboardDto = z.infer<typeof CreateDashboardSchema>;