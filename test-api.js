// Simple test script for the GraphQL API
// Run with: node test-api.js

const API_URL = process.env.API_URL || 'http://localhost:3000/api/graphql';

async function makeRequest(query, variables = null, token = null) {
	const headers = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(API_URL, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	const data = await response.json();
	return data;
}

async function testAPI() {
	console.log('🧪 Testing GraphQL API...\n');

	try {
		// Test 1: Login as admin
		console.log('1️⃣ Testing login (admin)...');
		const loginResult = await makeRequest(`
			mutation {
				login(username: "admin", password: "admin123") {
					token
					user {
						id
						username
						role
					}
				}
			}
		`);

		if (loginResult.errors) {
			console.error('❌ Login failed:', loginResult.errors);
			return;
		}

		const adminToken = loginResult.data.login.token;
		console.log('✅ Login successful!');
		console.log('   User:', loginResult.data.login.user);
		console.log('   Token:', adminToken.substring(0, 20) + '...\n');

		// Test 2: Get all employees
		console.log('2️⃣ Testing get all employees...');
		const employeesResult = await makeRequest(
			`
			query {
				employees {
					id
					name
					age
					class
				}
			}
		`,
			null,
			adminToken
		);

		if (employeesResult.errors) {
			console.error('❌ Get employees failed:', employeesResult.errors);
		} else {
			console.log('✅ Employees retrieved:', employeesResult.data.employees.length);
			console.log('   First employee:', employeesResult.data.employees[0], '\n');
		}

		// Test 3: Get single employee
		console.log('3️⃣ Testing get single employee...');
		const employeeResult = await makeRequest(
			`
			query {
				employee(id: "1") {
					id
					name
					age
					class
					subjects
				}
			}
		`,
			null,
			adminToken
		);

		if (employeeResult.errors) {
			console.error('❌ Get employee failed:', employeeResult.errors);
		} else {
			console.log('✅ Employee retrieved:', employeeResult.data.employee, '\n');
		}

		// Test 4: Get employees with pagination
		console.log('4️⃣ Testing pagination...');
		const paginatedResult = await makeRequest(
			`
			query {
				employeesPaginated(page: 1, limit: 2) {
					totalCount
					edges {
						node {
							id
							name
						}
					}
					pageInfo {
						currentPage
						perPage
						totalPages
						hasNextPage
					}
				}
			}
		`,
			null,
			adminToken
		);

		if (paginatedResult.errors) {
			console.error('❌ Pagination failed:', paginatedResult.errors);
		} else {
			console.log('✅ Pagination works!');
			console.log('   Total:', paginatedResult.data.employeesPaginated.totalCount);
			console.log('   Page info:', paginatedResult.data.employeesPaginated.pageInfo, '\n');
		}

		// Test 5: Add employee (admin only)
		console.log('5️⃣ Testing add employee (admin)...');
		const addResult = await makeRequest(
			`
			mutation {
				addEmployee(input: {
					name: "Test Employee"
					age: 25
					class: "10th"
					subjects: ["Math", "Science"]
				}) {
					id
					name
					age
				}
			}
		`,
			null,
			adminToken
		);

		if (addResult.errors) {
			console.error('❌ Add employee failed:', addResult.errors);
		} else {
			console.log('✅ Employee added:', addResult.data.addEmployee, '\n');
		}

		// Test 6: Login as employee
		console.log('6️⃣ Testing login (employee)...');
		const empLoginResult = await makeRequest(`
			mutation {
				login(username: "employee", password: "emp123") {
					token
					user {
						role
					}
				}
			}
		`);

		if (empLoginResult.errors) {
			console.error('❌ Employee login failed:', empLoginResult.errors);
		} else {
			const empToken = empLoginResult.data.login.token;
			console.log('✅ Employee login successful!\n');

			// Test 7: Try to add employee as regular employee (should fail)
			console.log('7️⃣ Testing add employee (employee - should fail)...');
			const addAsEmployeeResult = await makeRequest(
				`
				mutation {
					addEmployee(input: {
						name: "Should Fail"
						age: 20
						class: "9th"
					}) {
						id
					}
				}
			`,
				null,
				empToken
			);

			if (addAsEmployeeResult.errors) {
				console.log('✅ Correctly blocked employee from adding (expected error)');
				console.log('   Error:', addAsEmployeeResult.errors[0].message, '\n');
			} else {
				console.log('⚠️  Employee was able to add (unexpected!)');
			}
		}

		console.log('✨ All tests completed!');
	} catch (error) {
		console.error('❌ Test failed:', error.message);
		console.error('   Make sure the server is running: npm run dev');
	}
}

testAPI();
