export const typeDefs = `#graphql
  type Query {
    listEmployees(
      name: String
      age: Int
      class: String
      subject: String
      sortBy: String
      sortOrder: SortOrder
    ): [Employee!]!
    
    getEmployee(id: ID!): Employee
    
    listEmployeesPaginated(
      page: Int
      limit: Int
      name: String
      age: Int
      class: String
      subject: String
      sortBy: String
      sortOrder: SortOrder
    ): EmployeePaginatedResponse!
    
    login(username: String!, password: String!): AuthResponse!
  }

  type Mutation {
    addEmployee(input: EmployeeInput!): Employee!
    
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
  }

  type Employee {
    id: ID!
    name: String!
    age: Int!
    class: String!
    subjects: [String!]!
    attendance: [Attendance!]!
  }

  type Attendance {
    date: String!
    status: String!
  }

  input EmployeeInput {
    name: String!
    age: Int!
    class: String!
    subjects: [String!]!
    attendance: [AttendanceInput!]
  }

  input AttendanceInput {
    date: String!
    status: String!
  }

  type EmployeePaginatedResponse {
    data: [Employee!]!
    pagination: PaginationInfo!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    username: String!
    role: String!
  }

  enum SortOrder {
    ASC
    DESC
  }
`;
