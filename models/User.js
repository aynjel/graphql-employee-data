export class UserModel {
	id;
	username;
	password;
	role;

	constructor({ id, username, password, role }) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.role = role;
	}

	toJSON() {
		return {
			id: this.id,
			username: this.username,
			role: this.role,
		};
	}
}
