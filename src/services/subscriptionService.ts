
import type { SubscriptionPlan, Coupon, User } from '../types';

const COUPONS_STORAGE_KEY = 'yt_macgyver_coupons';
const PLANS_STORAGE_KEY = 'yt_macgyver_plans';

// PortOne Global Declaration
declare global {
    interface Window {
        IMP: any;
    }
}

// Helper for safe JSON parsing
const safeParse = <T>(jsonString: string | null, fallback: T): T => {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Subscription Storage Parse Error", e);
        return fallback;
    }
};

const defaultPlans: SubscriptionPlan[] = [
    { 
        id: 'event_launch', 
        name: '🎉 오픈 특가 (1개월)', 
        price: 9900, 
        durationMonths: 1,
        description: '500명 인원한정! 한달 커피 두잔값으로 AI 기능을 무제한 체험해보세요.'
    },
    { 
        id: '1month', 
        name: '스타터 플랜 (1개월)', 
        price: 18900, 
        durationMonths: 1,
    },
    { 
        id: '3months', 
        name: '그로스 플랜 (3개월)', 
        price: 49900, 
        durationMonths: 3, 
        discount: 12,
    },
    { 
        id: '12months', 
        name: '프로 플랜 (1년)', 
        price: 169000, 
        durationMonths: 12, 
        discount: 25,
    },
];

// --- Plan Management ---

export const getSubscriptionPlans = (): SubscriptionPlan[] => {
    return safeParse<SubscriptionPlan[]>(localStorage.getItem(PLANS_STORAGE_KEY), defaultPlans);
};

export const updatePlanPrice = (planId: string, newPrice: number): SubscriptionPlan[] => {
    const plans = getSubscriptionPlans();
    const updatedPlans = plans.map(plan => 
        plan.id === planId ? { ...plan, price: newPrice } : plan
    );
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updatedPlans));
    return updatedPlans;
};

export const resetPlansToDefault = (): SubscriptionPlan[] => {
    localStorage.removeItem(PLANS_STORAGE_KEY);
    return defaultPlans;
};

// Exporting defaultPlans as subscriptionPlans for backward compatibility with imports,
// BUT components should prefer getSubscriptionPlans() for dynamic data.
export const subscriptionPlans = defaultPlans; 

export const getPlanLabel = (planId?: string): string => {
    // We need to look up dynamic names if possible, but for label generation, static mapping is often safer for UI consistency.
    // However, let's try to find it in current plans first.
    const plans = getSubscriptionPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan) return `${plan.name}`;

    switch (planId) {
        case 'event_launch': return '오픈 특가 (1개월)';
        case '1month': return '스타터 플랜 (1개월)';
        case '3months': return '그로스 플랜 (3개월)';
        case '12months': return '프로 플랜 (1년)';
        case 'trial': return '무료 체험 (2주)';
        case '6months': return '6개월권'; 
        default: return '무료 회원';
    }
};

// Real Payment Process via PortOne (Test Mode)
export const requestPayment = async (user: User, planId: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        if (!window.IMP) {
            reject(new Error("결제 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요."));
            return;
        }

        // Get the most up-to-date plan info (including updated price)
        const currentPlans = getSubscriptionPlans();
        const plan = currentPlans.find(p => p.id === planId);
        
        if (!plan) {
            reject(new Error('유효하지 않은 플랜입니다.'));
            return;
        }

        const { IMP } = window;
        // PortOne Test Identification Code
        IMP.init('imp19424728'); 

        const data = {
            pg: 'html5_inicis', // To use Toss Payments: change to 'tosspayments' (requires real Merchant ID setup)
            pay_method: 'card',
            merchant_uid: `mid_${new Date().getTime()}`,
            name: plan.name,
            amount: plan.price, // Use dynamic price
            buyer_email: user.email,
            buyer_name: user.name,
            buyer_tel: '010-0000-0000', 
            m_redirect_url: window.location.href, 
        };

        IMP.request_pay(data, (rsp: any) => {
            if (rsp.success) {
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(startDate.getMonth() + plan.durationMonths);

                const updatedUser: User = {
                    ...user,
                    subscription: {
                        plan: planId as any,
                        status: 'active',
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    }
                };
                resolve(updatedUser);
            } else {
                const msg = rsp.error_msg || '결제가 취소되었습니다.';
                reject(new Error(msg));
            }
        });
    });
};

// --- Coupon Management (Admin) ---

const generateRandomCode = (length: number = 12): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        if (i > 0 && i % 4 === 0) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const getCoupons = (): Coupon[] => {
    return safeParse<Coupon[]>(localStorage.getItem(COUPONS_STORAGE_KEY), []);
};

export const generateCoupons = (durationMonths: 0.5 | 1 | 3 | 6 | 12, count: number): Coupon[] => {
    const currentCoupons = getCoupons();
    const newCoupons: Coupon[] = [];

    for (let i = 0; i < count; i++) {
        let code;
        do {
            code = generateRandomCode();
        } while (currentCoupons.some(c => c.code === code) || newCoupons.some(c => c.code === code));

        newCoupons.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            code,
            durationMonths,
            isUsed: false,
            createdAt: new Date().toISOString()
        });
    }

    const updatedCoupons = [...newCoupons, ...currentCoupons];
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updatedCoupons));
    return newCoupons;
};

export const redeemCoupon = async (user: User, code: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const coupons = getCoupons();
            const couponIndex = coupons.findIndex(c => c.code === code);

            if (couponIndex === -1) {
                reject(new Error('유효하지 않은 쿠폰 코드입니다.'));
                return;
            }

            const coupon = coupons[couponIndex];

            if (coupon.isUsed) {
                reject(new Error('이미 사용된 쿠폰입니다. (중복 사용 불가)'));
                return;
            }

            // Update Coupon Status
            coupons[couponIndex] = {
                ...coupon,
                isUsed: true,
                usedBy: user.email,
                usedAt: new Date().toISOString(),
            };
            localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));

            // Update User Subscription
            const startDate = new Date();
            const endDate = new Date();
            
            if (coupon.durationMonths === 0.5) {
                endDate.setDate(startDate.getDate() + 14);
            } else {
                endDate.setMonth(startDate.getMonth() + coupon.durationMonths);
            }

            const planMap = {
                0.5: 'trial',
                1: '1month',
                3: '3months',
                6: '6months',
                12: '12months'
            };

            const updatedUser: User = {
                ...user,
                subscription: {
                    plan: planMap[coupon.durationMonths as keyof typeof planMap] as any || 'trial',
                    status: 'active',
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            };

            resolve(updatedUser);
        }, 1000);
    });
};
