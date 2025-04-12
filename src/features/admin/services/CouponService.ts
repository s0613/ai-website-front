import apiClient from '@/lib/api/apiClient';

export interface CouponRequest {
    code: string;
    creditAmount: number;
    expiresAt: string;
}

export interface CouponResponse {
    id: string;
    code: string;
    creditAmount: number;
    isActive: boolean;
    expiresAt: string;
    createdAt: string;
}

export class CouponService {
    private static BASE_URL = '/coupons';

    // 쿠폰 등록
    static async registerCoupon(request: CouponRequest): Promise<void> {
        await apiClient.post(this.BASE_URL, request);
    }

    // 쿠폰 사용
    static async useCoupon(code: string): Promise<void> {
        await apiClient.post(`${this.BASE_URL}/use`, { code });
    }

    // 쿠폰 해제
    static async releaseCoupon(code: string): Promise<void> {
        await apiClient.post(`${this.BASE_URL}/release`, { code });
    }

    // 쿠폰 목록 조회
    static async getCoupons(): Promise<CouponResponse[]> {
        const { data } = await apiClient.get<CouponResponse[]>(this.BASE_URL);
        return data;
    }
}
