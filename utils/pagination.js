export const applyPagination = (items, page = 1, limit = 10) => {
	const pageNum = Math.max(1, parseInt(page) || 1);
	const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items per page

	const startIndex = (pageNum - 1) * limitNum;
	const endIndex = startIndex + limitNum;

	const paginatedItems = items.slice(startIndex, endIndex);
	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / limitNum);

	return {
		items: paginatedItems,
		pageInfo: {
			currentPage: pageNum,
			perPage: limitNum,
			totalItems,
			totalPages,
			hasNextPage: endIndex < totalItems,
			hasPreviousPage: pageNum > 1,
		},
	};
};

export const applySorting = (items, sortBy, sortOrder = 'ASC') => {
	if (!sortBy) {
		return items;
	}

	const order = sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
	const sorted = [...items].sort((a, b) => {
		let aVal = a[sortBy];
		let bVal = b[sortBy];

		// Handle nested properties
		if (sortBy.includes('.')) {
			const parts = sortBy.split('.');
			aVal = parts.reduce((obj, part) => obj?.[part], a);
			bVal = parts.reduce((obj, part) => obj?.[part], b);
		}

		// Handle different data types
		if (typeof aVal === 'string' && typeof bVal === 'string') {
			return aVal.localeCompare(bVal) * order;
		}
		if (typeof aVal === 'number' && typeof bVal === 'number') {
			return (aVal - bVal) * order;
		}

		// Handle null/undefined
		if (aVal == null) return 1 * order;
		if (bVal == null) return -1 * order;

		return (aVal > bVal ? 1 : -1) * order;
	});

	return sorted;
};
