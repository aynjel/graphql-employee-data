import type { PaginationResult, SortOrder } from '../types/index.js';

export const paginationUtils = {
	paginate<T>(array: T[], page: number = 1, limit: number = 10): PaginationResult<T> {
		const offset = (page - 1) * limit;
		const total = array.length;
		const totalPages = Math.ceil(total / limit);
		const data = array.slice(offset, offset + limit);

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		};
	},

	sort<T extends Record<string, any>>(array: T[], sortBy: string = 'id', sortOrder: SortOrder = 'ASC'): T[] {
		const sorted = [...array];
		const order = sortOrder.toUpperCase() === 'DESC' ? -1 : 1;

		sorted.sort((a, b) => {
			let aVal: any = a[sortBy];
			let bVal: any = b[sortBy];

			if (sortBy.includes('.')) {
				const keys = sortBy.split('.');
				aVal = keys.reduce((obj: any, key) => obj?.[key], a);
				bVal = keys.reduce((obj: any, key) => obj?.[key], b);
			}

			if (typeof aVal === 'string') {
				return aVal.localeCompare(bVal) * order;
			}
			if (typeof aVal === 'number') {
				return (aVal - bVal) * order;
			}
			return 0;
		});

		return sorted;
	},
};
