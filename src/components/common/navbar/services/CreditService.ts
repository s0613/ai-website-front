import apiClient from '@/lib/api/apiClient';

interface CreditsRequest {
    amount: number;
    operation: 'ADD' | 'SUBTRACT';
}

interface CreditsResponse {
    userId: number;
    email: string;
    credits: number;
    message: string;
}

class CreditService {
    private static instance: CreditService;
    private readonly baseUrl = '/credits';

    private constructor() { }

    public static getInstance(): CreditService {
        if (!CreditService.instance) {
            CreditService.instance = new CreditService();
        }
        return CreditService.instance;
    }

    public async getMyCredits(): Promise<CreditsResponse> {
        try {
            console.log('크레딧 조회 요청 시작');
            const response = await apiClient.get<CreditsResponse>(this.baseUrl);
            console.log('크레딧 조회 응답:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('크레딧 조회 에러:', error);
            if (error.response?.data) {
                return error.response.data;
            }
            throw new Error('크레딧 조회에 실패했습니다.');
        }
    }

    public async adjustCredits(amount: number, operation: 'ADD' | 'SUBTRACT'): Promise<CreditsResponse> {
        try {
            console.log('크레딧 조정 요청 시작:', { amount, operation });
            const request: CreditsRequest = { amount, operation };
            const response = await apiClient.post<CreditsResponse>(`${this.baseUrl}/adjust`, request);
            console.log('크레딧 조정 응답:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('크레딧 조정 에러:', error);
            if (error.response?.data) {
                return error.response.data;
            }
            throw new Error('크레딧 조정에 실패했습니다.');
        }
    }
}

export default CreditService;
