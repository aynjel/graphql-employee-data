import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee.js';
import { UserModel } from '../models/User.js';
import type { EmployeeFilters, EmployeeInput } from '../types/index.js';

let employees: Employee[] = [
	new Employee({
		id: '1',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
	new Employee({
		id: '2',
		name: 'Jane Smith',
		age: 28,
		class: '11th',
		subjects: ['History', 'Geography'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'present' },
		],
	}),
	new Employee({
		id: '3',
		name: 'Bob Johnson',
		age: 30,
		class: '12th',
		subjects: ['Physics', 'Chemistry'],
		attendance: [
			{ date: '2024-01-15', status: 'absent' },
			{ date: '2024-01-16', status: 'present' },
		],
	}),
	new Employee({
		id: '4',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
	new Employee({
		id: '5',
		name: 'Jane Smith',
		age: 28,
		class: '11th',
		subjects: ['History', 'Geography'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'present' },
		],
	}),
	new Employee({
		id: '6',
		name: 'Bob Johnson',
		age: 30,
		class: '12th',
		subjects: ['Physics', 'Chemistry'],
		attendance: [
			{ date: '2024-01-15', status: 'absent' },
			{ date: '2024-01-16', status: 'present' },
		],
	}),
	new Employee({
		id: '7',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
	new Employee({
		id: '8',
		name: 'Jane Smith',
		age: 28,
		class: '11th',
		subjects: ['History', 'Geography'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'present' },
		],
	}),
	new Employee({
		id: '9',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
	new Employee({
		id: '10',
		name: 'Jane Smith',
		age: 28,
		class: '11th',
		subjects: ['History', 'Geography'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'present' },
		],
	}),
	new Employee({
		id: '11',
		name: 'Bob Johnson',
		age: 30,
		class: '12th',
		subjects: ['Physics', 'Chemistry'],
		attendance: [
			{ date: '2024-01-15', status: 'absent' },
			{ date: '2024-01-16', status: 'present' },
		],
	}),
	new Employee({
		id: '12',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
	new Employee({
		id: '13',
		name: 'Jane Smith',
		age: 28,
		class: '11th',
		subjects: ['History', 'Geography'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'present' },
		],
	}),
	new Employee({
		id: '14',
		name: 'Bob Johnson',
		age: 30,
		class: '12th',
		subjects: ['Physics', 'Chemistry'],
		attendance: [
			{ date: '2024-01-15', status: 'absent' },
			{ date: '2024-01-16', status: 'present' },
		],
	}),
	new Employee({
		id: '15',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
	new Employee({
		id: '16',
		name: 'Jane Smith',
		age: 28,
		class: '11th',
		subjects: ['History', 'Geography'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'present' },
		],
	}),
	new Employee({
		id: '17',
		name: 'Bob Johnson',
		age: 30,
		class: '12th',
		subjects: ['Physics', 'Chemistry'],
		attendance: [
			{ date: '2024-01-15', status: 'absent' },
			{ date: '2024-01-16', status: 'present' },
		],
	}),
	new Employee({
		id: '18',
		name: 'John Doe',
		age: 25,
		class: '10th',
		subjects: ['Math', 'Science', 'English'],
		attendance: [
			{ date: '2024-01-15', status: 'present' },
			{ date: '2024-01-16', status: 'present' },
			{ date: '2024-01-17', status: 'absent' },
		],
	}),
];

let nextEmployeeId = 4;

const users: UserModel[] = [
	new UserModel({
		id: '1',
		username: 'admin',
		password: bcrypt.hashSync('admin123', 10),
		role: 'admin',
	}),
	new UserModel({
		id: '2',
		username: 'employee',
		password: bcrypt.hashSync('emp123', 10),
		role: 'employee',
	}),
];

export const employeeStore = {
	getAll(filters: EmployeeFilters = {}): Employee[] {
		let result = [...employees];

		if (filters.name) {
			result = result.filter((emp) => emp.name.toLowerCase().includes(filters.name!.toLowerCase()));
		}
		if (filters.age !== undefined) {
			result = result.filter((emp) => emp.age === filters.age);
		}
		if (filters.class) {
			result = result.filter((emp) => emp.class === filters.class);
		}
		if (filters.subject) {
			result = result.filter((emp) => emp.subjects.includes(filters.subject!));
		}

		return result;
	},

	getById(id: string): Employee | null {
		return employees.find((emp) => emp.id === id) || null;
	},

	getByIds(ids: readonly string[]): (Employee | null)[] {
		return ids.map((id) => employees.find((emp) => emp.id === id) || null);
	},

	add(employeeData: EmployeeInput): Employee {
		const newEmployee = new Employee({
			id: String(nextEmployeeId++),
			...employeeData,
		});
		employees.push(newEmployee);
		return newEmployee;
	},

	update(id: string, employeeData: Partial<EmployeeInput>): Employee | null {
		const index = employees.findIndex((emp) => emp.id === id);
		if (index === -1) {
			return null;
		}
		const updated = new Employee({
			...employees[index],
			...employeeData,
			id,
		});
		employees[index] = updated;
		return updated;
	},

	getCount(filters: EmployeeFilters = {}): number {
		return this.getAll(filters).length;
	},
};

export const userStore = {
	findByUsername(username: string): UserModel | null {
		return users.find((user) => user.username === username) || null;
	},

	findById(id: string): UserModel | null {
		return users.find((user) => user.id === id) || null;
	},

	verifyPassword(user: UserModel, password: string): boolean {
		return bcrypt.compareSync(password, user.password);
	},
};
