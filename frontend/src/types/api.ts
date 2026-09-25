//frontend/src/types/api.ts

// ═══════════════════════════════════════════════════════════════
// USERS / AUTH
// ═══════════════════════════════════════════════════════════════

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatarUrl?: string | null;
    status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    createdAt?: string;
}

export interface AuthResponse {
    accessToken?: string;
    refreshToken?: string;
    requiresTwoFactor?: boolean;
    verificationToken?: string;
    message?: string;
    success?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// TENANT
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// MARKETING DASHBOARD
// ═══════════════════════════════════════════════════════════════

export interface DashboardForm {
    periodFrom: string;
    periodTo: string;

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

export interface DashboardHistoryItem {
    id: string;
    periodFrom: string;
    periodTo: string;
    revenue: number;
    adBudget: number;
    createdAt: string;
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

// ═══════════════════════════════════════════════════════════════
// ARTIFACTS
// ═══════════════════════════════════════════════════════════════

export type ArtifactType =
    | 'WEBSITE'
    | 'SOCIAL'
    | 'DOCUMENT'
    | 'DASHBOARD'
    | 'VIDEO'
    | 'FILE'
    | 'OFFLINE'
    | 'CUSTOM';

export interface Artifact {
    id: string;
    projectId: string;
    type: ArtifactType;
    name: string;
    url: string | null;
    description: string | null;
    metadata: Record<string, unknown> | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// UTM
// ═══════════════════════════════════════════════════════════════

export interface UtmSource {
    id: string;
    projectId: string;
    name: string;
    label: string;
    icon: string | null;
    isSystem: boolean;
    createdAt: string;
}

export interface UtmMedium {
    id: string;
    projectId: string;
    name: string;
    label: string;
    isSystem: boolean;
    createdAt: string;
}

export interface UtmCampaign {
    id: string;
    projectId: string;
    name: string;
    label: string;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { utmLinks: number };
}

export interface UtmRuleCondition {
    field: string;
    operator: 'eq' | 'ne' | 'contains' | 'startsWith' | 'endsWith' | 'in';
    value: string | string[];
}

export interface UtmRule {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    priority: number;
    isActive: boolean;
    conditions: UtmRuleCondition[];
    sourceTemplate: string;
    mediumTemplate: string;
    campaignTemplate: string | null;
    contentTemplate: string | null;
    termTemplate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UtmLink {
    id: string;
    projectId: string;
    artifactId: string | null;
    campaignId: string | null;
    source: string;
    medium: string;
    campaign: string | null;
    content: string | null;
    term: string | null;
    baseUrl: string;
    fullUrl: string;
    label: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    artifact?: { id: string; name: string; type: ArtifactType };
    campaignRef?: { id: string; name: string; label: string };
    createdBy?: { id: string; email: string; name: string | null };
}

// ═══════════════════════════════════════════════════════════════
// ENTITIES
// ═══════════════════════════════════════════════════════════════

export interface Entity {
    id: string;
    projectId: string;
    moduleId: string | null;
    name: string;
    label: string;
    icon: string | null;
    color: string | null;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        fields: number;
        records: number;
    };
    fields?: Field[];
}

// ═══════════════════════════════════════════════════════════════
// FIELDS
// ═══════════════════════════════════════════════════════════════

export type FieldType =
    | 'text'
    | 'number'
    | 'date'
    | 'boolean'
    | 'select'
    | 'user'
    | 'tags'
    | 'checklist'
    | 'user-list';

export interface Field {
    id: string;
    entityId: string;
    name: string;
    label: string;
    type: FieldType;
    options: Record<string, unknown> | null;
    isRequired: boolean;
    defaultValue: unknown;
    createdAt: string;
    updatedAt: string;
}

export interface FieldTypeInfo {
    key: FieldType;
    label: string;
    supportsFiltering: boolean;
    supportsSorting: boolean;
    supportsAggregation: boolean;
}

// ═══════════════════════════════════════════════════════════════
// RECORDS
// ═══════════════════════════════════════════════════════════════

export interface EntityRecord {
    id: string;
    entityId: string;
    projectId: string;
    sprintId: string | null;
    data: Record<string, unknown>;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    creator?: {
        id: string;
        email: string;
        name: string | null;
    };
    entity?: {
        id: string;
        name: string;
        label: string;
        fields: Field[];
    };
    sprint?: {
        id: string;
        name: string;
        number: number;
    } | null;
}

export interface RecordsResponse {
    records: EntityRecord[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface ListRecordsQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    filterField?: string;
    filterValue?: string;
    sprintId?: string;
}


// ═══════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════

export type ViewType = 'TABLE' | 'KANBAN' | 'CALENDAR' | 'LIST';

export interface View {
    id: string;
    entityId: string;
    projectId: string;
    name: string;
    type: ViewType;
    config: Record<string, unknown>;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════════════════════════

export interface Workflow {
    id: string;
    projectId: string;
    entityId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    steps?: WorkflowStep[];
}

export interface WorkflowStep {
    id: string;
    workflowId: string;
    name: string;
    order: number;
    color: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EntityTemplateField {
    name: string;
    label: string;
    type: string;
    isRequired?: boolean;
    options?: Record<string, unknown>;
}

export interface EntityTemplate {
    key: string;
    label: string;
    description: string;
    icon: string;
    entity: { name: string; label: string; icon: string };
    fields: EntityTemplateField[];
    defaultView: {
        name: string;
        type: 'KANBAN' | 'TABLE' | 'LIST' | 'CALENDAR';
        config: Record<string, unknown>;
    };
}

export interface Sprint {
    id: string;
    projectId: string;
    epicId: string | null;
    number: number;
    name: string;
    goal: string | null;
    description: string | null;
    startDate: string;
    endDate: string;
    status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    epic?: { id: string; name: string; color: string | null } | null;
    metrics?: SprintMetric[];
    events?: SprintEvent[];
    increments?: Increment[];
    _count?: {
        increments: number;
        metrics: number;
        events: number;
        records?: number;
    };
}

export interface SprintMetric {
    id: string;
    sprintId: string;
    key: string;
    label: string;
    metricType: 'INCREASE' | 'DECREASE' | 'TARGET';
    targetValue: number;
    actualValue: number | null;
    unit: string | null;
    xpReward: number;
    isAchieved: boolean;
}

export interface SprintEvent {
    id: string;
    sprintId: string;
    type: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE' | 'PIVOT' | 'PAUSE' | 'BREAKTHROUGH';
    title: string;
    body: string | null;
    xp: number;
    createdById: string;
    createdAt: string;
    createdBy?: { id: string; email: string; name: string | null };
}

export interface Increment {
    id: string;
    sprintId: string;
    projectId: string;
    name: string;
    description: string | null;
    icon: string | null;
    xp: number;
    createdById: string;
    createdAt: string;
    createdBy?: { id: string; email: string; name: string | null };
}
// ═══════════════════════════════════════════════════════════════
// EPICS
// ═══════════════════════════════════════════════════════════════

export type EpicStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface Epic {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    color: string | null;
    status: EpicStatus;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
}
// ═══════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════

export type CategoryScope = 'PROJECT' | 'TASK' | 'TAG' | 'SKILL';

export interface Category {
    id: string;
    organizationId: string;
    parentId: string | null;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    scope: CategoryScope;
    createdAt: string;
    updatedAt: string;
    _count?: {
        children: number;
        tags: number;
        skills: number;
    };
}

// ═══════════════════════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════════════════════

export interface Tag {
    id: string;
    organizationId: string;
    name: string;
    label: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    categoryId: string | null;
    skillId: string | null;
    createdById: string | null;
    createdAt: string;
    category?: { id: string; name: string; slug: string };
    skill?: { id: string; name: string; label: string; type: 'HARD' | 'SOFT' };
}

// ═══════════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════════

export type SkillType = 'HARD' | 'SOFT';

export interface Skill {
    id: string;
    organizationId: string;
    name: string;
    label: string;
    description: string | null;
    type: SkillType;
    categoryId: string | null;
    createdAt: string;
    updatedAt: string;
    category?: { id: string; name: string; slug: string } | null;
}

export type EvidenceType =
    | 'TASK_COMPLETED'
    | 'INTERNAL_EXAM'
    | 'EXTERNAL_EDUCATION'
    | 'IMPLEMENTATION'
    | 'HELPED_COLLEAGUE'
    | 'MANUAL_GRANT'
    | 'FACILITATION';

export interface SkillEvidence {
    id: string;
    userSkillId: string;
    type: EvidenceType;
    sourceId: string | null;
    sourceType: string | null;
    weight: number;
    comment: string | null;
    createdById: string | null;
    createdAt: string;
    createdBy?: {
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
    } | null;
}

export interface UserSkill {
    id: string;
    userId: string;
    skillId: string;
    organizationId: string;
    level: number;
    levelLabel: string | null;
    contextId: string | null;
    contextType: string | null;
    practiceCount: number;
    evidenceCount: number;
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
    // skill?: Skill;
    // context?: { id: string; name: string; slug: string } | null;
    // evidences?: SkillEvidence[];
    skill?: Skill;
    context?: { id: string; name: string; slug: string } | null;
    evidences?: SkillEvidence[];
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        status?: string;
    };
    skills?: {
        id: string;
        level: number;
        levelLabel: string | null;
        skill: { id: string; name: string; label: string; type: 'HARD' | 'SOFT' };
    }[];
}

export interface Invitation {
    id: string;
    projectId: string;
    email: string;
    role: string;
    token: string;
    invitedById: string;
    expiresAt: string;
    acceptedAt: string | null;
    createdAt: string;
    project?: { id: string; name: string; workspaceId: string };
    invitedBy?: {
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
    };
}

