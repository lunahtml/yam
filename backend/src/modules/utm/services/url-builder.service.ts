//backend/src/modules/utm/services/url-builder.service.ts
import { Injectable } from '@nestjs/common';

export interface UtmParams {
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    term?: string;
}

@Injectable()
export class UrlBuilderService {
    build(baseUrl: string, params: UtmParams): string {
        const url = new URL(baseUrl);

        url.searchParams.set('utm_source', params.source);
        url.searchParams.set('utm_medium', params.medium);

        if (params.campaign) {
            url.searchParams.set('utm_campaign', params.campaign);
        }
        if (params.content) {
            url.searchParams.set('utm_content', params.content);
        }
        if (params.term) {
            url.searchParams.set('utm_term', params.term);
        }

        return url.toString();
    }

    /**
     * Подставляет переменные в шаблон.
     * Поддерживает: {{source}}, {{medium}}, {{campaign}}, {{index}},
     * {{artifact.name}}, {{artifact.type}}, {{date}}
     */
    renderTemplate(
        template: string,
        vars: Record<string, string | number | undefined>,
    ): string {
        return template.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
            const trimmed = String(key).trim();
            const value = vars[trimmed];
            return value !== undefined ? String(value) : '';
        });
    }
}