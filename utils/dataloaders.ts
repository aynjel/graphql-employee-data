import DataLoader from 'dataloader';
import { employeeStore } from '../data/store.js';
import type { Employee } from '../models/Employee.js';

export const employeeLoader = new DataLoader<string, Employee | null>(
	async (ids: readonly string[]): Promise<(Employee | null)[]> => {
		return employeeStore.getByIds(ids);
	}
);

export const clearEmployeeCache = (): void => {
	employeeLoader.clearAll();
};
