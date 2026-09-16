//frontend\src\types\api.ts
export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface AuthResponse {
    accessToken?: string;
    refreshToken?: string;
    requiresTwoFactor?: boolean;
    verificationToken?: string;
    message?: string;
    success?: boolean;
}

export interface Project {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Organization {
    id: string;
    name: string;
    role?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        workspaces: number;
        members: number;
    };
}

export interface Workspace {
    id: string;
    organizationId: string;
    name: string;
    role?: string;
    createdAt: string;
    updatedAt: string;
    organization?: { id: string; name: string };
    _count?: {
        projects: number;
        members: number;
    };
}
export interface DashboardForm {
    periodFrom: string;  // ISO дата "2026-01-01"
    periodTo: string;    // ISO дата "2026-01-31"

    adBudget: number;
    marketingCosts: number;
    revenue: number;
    grossProfit: number;
    impressions: number;
    clicks: number;
    leads: number;
    mql: number;
    sql: number;
    meetings: number;
    offers: number;
    deals: number;
    avgCheck: number;
    avgGrossMargin: number;
    avgLifetimeMonths: number;
    avgPurchaseFreq: number;
    avgRevenuePerClient: number;
    activeClients: number;
    repeatClients: number;
    retention: number;
    avgProductPrice: number;
    operationalCosts: number;
    organicVisits: number;
    totalVisits: number;
    bounces: number;
    newClients: number;
    tam: number;
    sam: number;
    som: number;
}

export interface MarketingMetrics {
    funnel: {
        ctr: number;
        crClickLead: number;
        crLeadMql: number;
        crMqlSql: number;
        crSqlMeeting: number;
        crMeetingOffer: number;
        crOfferDeal: number;
        crTotal: number;
    };
    costs: {
        cpc: number;
        cpm: number;
        cpl: number;
        cpql: number;
        cpsql: number;
        cac: number;
        cpo: number;
    };
    roi: {
        romi: number;
        roi: number;
        roas: number;
        roasFull: number;
        marketingShare: number;
    };
    ltv: {
        ltv: number;
        ltvCac: number;
        payback: number;
    };
    efficiency: {
        aov: number;
        retention: number;
        churn: number;
        bounceRate: number;
        organicShare: number;
        marketShare: number;
        samShare: number;
    };
    unit: {
        marginPerClient: number;
        profitPerClient: number;
        breakEven: number;
        revenuePerClient: number;
        profit: number;
    };
}