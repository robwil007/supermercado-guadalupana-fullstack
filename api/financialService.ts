import { Expense, Return, Order, StockMovement, Product } from '../types';

const FAKE_DB_EXPENSES_KEY = 'guadalupana_expenses';
const FAKE_DB_RETURNS_KEY = 'guadalupana_returns';

// =============================================
// Expenses Management
// =============================================

const getExpensesFromStorage = (): Expense[] => {
    const data = localStorage.getItem(FAKE_DB_EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
};

const saveExpensesToStorage = (expenses: Expense[]) => {
    localStorage.setItem(FAKE_DB_EXPENSES_KEY, JSON.stringify(expenses));
};

export const getExpenses = (): Promise<Expense[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getExpensesFromStorage());
        }, 100);
    });
};

export const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const expenses = getExpensesFromStorage();
            const newExpense: Expense = {
                ...expenseData,
                id: `exp_${Date.now()}`,
                date: new Date().toISOString(),
            };
            expenses.unshift(newExpense);
            saveExpensesToStorage(expenses);
            resolve(newExpense);
        }, 200);
    });
};

// =============================================
// Returns Management
// =============================================

const getReturnsFromStorage = (): Return[] => {
    const data = localStorage.getItem(FAKE_DB_RETURNS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveReturnsToStorage = (returns: Return[]) => {
    localStorage.setItem(FAKE_DB_RETURNS_KEY, JSON.stringify(returns));
};

export const getReturns = (): Promise<Return[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getReturnsFromStorage());
        }, 100);
    });
};

export const createReturn = (returnData: Omit<Return, 'id' | 'date'>): Promise<Return> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const returns = getReturnsFromStorage();
            const newReturn: Return = {
                ...returnData,
                id: `ret_${Date.now()}`,
                date: new Date().toISOString(),
            };
            returns.unshift(newReturn);
            saveReturnsToStorage(returns);
            resolve(newReturn);
        }, 200);
    });
};


// =============================================
// Financial Aggregation (Moved from client)
// =============================================
export interface FinancialSummary {
    totalRevenue: number;
    totalCostOfGoods: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
}
export const getFinancialSummary = (orders: Order[], expenses: Expense[]): Promise<FinancialSummary> => {
    return new Promise(resolve => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalCostOfGoods = orders.flatMap(o => o.items).reduce((sum, item) => sum + (item.cost * item.quantity), 0);
        const grossProfit = totalRevenue - totalCostOfGoods;
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netProfit = grossProfit - totalExpenses;
        
        resolve({ totalRevenue, totalCostOfGoods, grossProfit, totalExpenses, netProfit });
    });
}

export interface SpoilageReport {
    totalSpoilageCost: number;
    spoilageDetails: (StockMovement & { cost: number; productName: string })[];
}
export const getSpoilageReport = (stockMovements: StockMovement[], allProducts: Product[]): Promise<SpoilageReport> => {
    return new Promise(resolve => {
        const adjustmentMovements = stockMovements.filter(m => m.type === 'adjustment' && m.quantity < 0);
        let totalSpoilageCost = 0;
        const spoilageDetails: (StockMovement & { cost: number; productName: string })[] = [];

        adjustmentMovements.forEach(movement => {
            const product = allProducts.find(p => p.id === movement.productId);
            if(product) {
                const cost = Math.abs(movement.quantity) * (product.cost || 0);
                totalSpoilageCost += cost;
                spoilageDetails.push({ ...movement, cost, productName: product.name });
            }
        });

        resolve({ totalSpoilageCost, spoilageDetails });
    });
};
