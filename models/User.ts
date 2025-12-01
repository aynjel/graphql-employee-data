import type { User, UserPayload } from '../types/index.js';

export class UserModel implements User {
	public id: string;
	public username: string;
	public password: string;
	public role: 'admin' | 'employee';

	constructor({ id, username, password, role }: User) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.role = role;
	}

	public toJSON(): UserPayload {
		return {
			id: this.id,
			username: this.username,
			role: this.role,
		};
	}
}
