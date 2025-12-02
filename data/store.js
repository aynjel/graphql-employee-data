import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee.js';
import { UserModel } from '../models/User.js';

let employees = [
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
];

let nextEmployeeId = 4;

const users = [
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
	getAll(filters = {}) {
		let result = [...employees];

		if (filters.name) {
			result = result.filter((emp) => emp.name.toLowerCase().includes(filters.name.toLowerCase()));
		}
		if (filters.age !== undefined) {
			result = result.filter((emp) => emp.age === filters.age);
		}
		if (filters.class) {
			result = result.filter((emp) => emp.class === filters.class);
		}
		if (filters.subject) {
			result = result.filter((emp) => emp.subjects.includes(filters.subject));
		}
		if (filters.minAge !== undefined) {
			result = result.filter((emp) => emp.age >= filters.minAge);
		}
		if (filters.maxAge !== undefined) {
			result = result.filter((emp) => emp.age <= filters.maxAge);
		}

		return result;
	},

	getById(id) {
		return employees.find((emp) => emp.id === id) || null;
	},

	getByIds(ids) {
		return ids.map((id) => employees.find((emp) => emp.id === id) || null);
	},

	add(employeeData) {
		const newEmployee = new Employee({
			id: String(nextEmployeeId++),
			...employeeData,
		});
		employees.push(newEmployee);
		return newEmployee;
	},

	update(id, employeeData) {
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

	getCount(filters = {}) {
		return this.getAll(filters).length;
	},
};

export const userStore = {
	findByUsername(username) {
		return users.find((user) => user.username === username) || null;
	},

	findById(id) {
		return users.find((user) => user.id === id) || null;
	},

	verifyPassword(user, password) {
		return bcrypt.compareSync(password, user.password);
	},
};
