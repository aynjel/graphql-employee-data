export class Employee {
	id;
	name;
	age;
	class;
	subjects;
	attendance;

	constructor({ id, name, age, class: className, subjects = [], attendance = [] }) {
		this.id = id;
		this.name = name;
		this.age = age;
		this.class = className;
		this.subjects = Array.isArray(subjects) ? subjects : [];
		this.attendance = Array.isArray(attendance) ? attendance : [];
	}

	toJSON() {
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
