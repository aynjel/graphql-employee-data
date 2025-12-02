import DataLoader from 'dataloader';
import { employeeStore } from './store.js';

export const employeeLoader = new DataLoader(async (ids) => {
	return employeeStore.getByIds(ids);
});

export const clearEmployeeCache = () => {
	employeeLoader.clearAll();
};
