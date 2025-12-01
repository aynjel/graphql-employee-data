import type { Attendance, EmployeeData, EmployeeInput } from '../types/index.js';

export class Employee {
	public id: string;
	public name: string;
	public age: number;
	public class: string;
	public subjects: string[];
	public attendance: Attendance[];

	constructor({
		id,
		name,
		age,
		class: className,
		subjects = [],
		attendance = [],
	}: EmployeeInput & { id: string }) {
		this.id = id;
		this.name = name;
		this.age = age;
		this.class = className;
		this.subjects = Array.isArray(subjects) ? subjects : [];
		this.attendance = Array.isArray(attendance) ? attendance : [];
	}

	public toJSON(): EmployeeData {
		return {
			id: this.id,
			name: this.name,
			age: this.age,
			class: this.class,
			subjects: this.subjects,
			attendance: this.attendance,
		};
	}
}
