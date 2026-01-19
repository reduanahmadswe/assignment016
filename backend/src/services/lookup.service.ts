import prisma from '../config/db.js';

class LookupService {
    private cache: Map<string, Map<string, number>> = new Map();

    async getUserRoleId(code: string): Promise<number> {
        return this.getLookupId('userRole', 'user_roles', code);
    }

    async getAuthProviderId(code: string): Promise<number> {
        return this.getLookupId('authProvider', 'auth_providers', code);
    }

    async getEventTypeId(code: string): Promise<number> {
        return this.getLookupId('eventType', 'event_types', code);
    }

    async getEventModeId(code: string): Promise<number> {
        return this.getLookupId('eventMode', 'event_modes', code);
    }

    async getEventStatusId(code: string): Promise<number> {
        return this.getLookupId('eventStatus', 'event_statuses', code);
    }

    async getRegistrationStatusId(code: string): Promise<number> {
        return this.getLookupId('registrationStatus', 'registration_statuses', code);
    }

    async getEventRegistrationStatusId(code: string): Promise<number> {
        return this.getLookupId('eventRegistrationStatus', 'event_registration_statuses', code);
    }

    async getPaymentStatusId(code: string): Promise<number> {
        return this.getLookupId('paymentStatus', 'payment_statuses', code);
    }

    async getPaymentGatewayId(code: string): Promise<number> {
        return this.getLookupId('paymentGateway', 'payment_gateways', code);
    }

    async getBlogStatusId(code: string): Promise<number> {
        return this.getLookupId('blogStatus', 'blog_statuses', code);
    }

    async getOpportunityStatusId(code: string): Promise<number> {
        return this.getLookupId('opportunityStatus', 'opportunity_statuses', code);
    }

    async getOpportunityTypeId(code: string): Promise<number> {
        return this.getLookupId('opportunityType', 'opportunity_types', code);
    }

    async getApplicationStatusId(code: string): Promise<number> {
        return this.getLookupId('applicationStatus', 'application_statuses', code);
    }

    async getOtpTypeId(code: string): Promise<number> {
        return this.getLookupId('otpType', 'otp_types', code);
    }

    async getHostRoleId(code: string): Promise<number> {
        return this.getLookupId('hostRole', 'host_roles', code);
    }

    async getOnlinePlatformId(code: string | null): Promise<number | null> {
        if (!code) return null;
        return this.getLookupId('onlinePlatform', 'online_platforms', code);
    }

    private async getLookupId(model: string, table: string, code: string): Promise<number> {
        // Check cache first
        if (!this.cache.has(table)) {
            this.cache.set(table, new Map());
        }

        const tableCache = this.cache.get(table)!;
        if (tableCache.has(code)) {
            return tableCache.get(code)!;
        }

        // Fetch from database
        const record = await (prisma as any)[model].findUnique({
            where: { code },
            select: { id: true }
        });

        if (!record) {
            throw new Error(`${model} with code '${code}' not found`);
        }

        tableCache.set(code, record.id);
        return record.id;
    }

    clearCache() {
        this.cache.clear();
    }
}

export const lookupService = new LookupService();
