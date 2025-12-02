import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';

const typeDefs = `
	type Query {
        employees: [Employee]
    }
    type Employee {
        id: ID!
        name: String!
        age: Int!
        class: String!
        subjects: [String]
        attendance: [Attendance]
    }

    type Attendance {
        date: String!
        status: String!
    }
`;

const resolvers = {
	Query: {
		employees: () => [
			{
				id: 1,
				name: 'John Doe',
				age: 20,
				class: '10th',
				subjects: ['Math', 'Science', 'English'],
				attendance: [
					{ date: '2025-01-01', status: 'Present' },
					{ date: '2025-01-02', status: 'Absent' },
				],
			},
		],
	},
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
});

export default async (req, res) => {
	const { query, variables, operationName } = req.body;
	try {
		const result = await graphql({ schema, source: query, variables, operationName });
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
