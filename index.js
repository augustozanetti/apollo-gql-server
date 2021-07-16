const { ApolloServer, gql } = require('apollo-server');

const source = require('./source')

const typeDefs = gql`
    enum CustomerRole {
        ADMIN
        USER
    }

    type Customer {
        id: ID
        name: String!
        role: CustomerRole!
        addresses: [Address]!
    }

    type Address {
        street: String!
        number: Int!
        comp: String
        customer: Customer!
    }

    type Query {
        customers: [Customer]
    }

    type Mutation {
        addCustomer(name: String!, role: CustomerRole!): Customer
    }
`;

const resolvers = {
    Query: {
        customers: (parent, args, { dataSources }, info) => {
            return dataSources.customers.getCustomers()
        }
    },
    Mutation: {
        addCustomer: (_, {name, role}) => {
            const length = source.customers.length;
            const customer = {
                id: Math.random().toFixed(4).slice(2, 5),
                name,
                role,
            }
            source.customers[length] = customer
            return customer
        }
    },
    Customer: {
        addresses: (parent) => source.addresses.filter(address => address.customer_id === parent.id)
    },
    Address: {
        customer: (parent) => source.customers.find(customer => customer.id === parent.customer_id)
    }
}

const server = new ApolloServer({ 
    typeDefs,
    resolvers,
    dataSources: () => ({
        customers: {
            getCustomers: () => source.customers
        }
    })
});

server.listen().then(({ url }) => {
    console.log(`🚀  Server listening at ${url}`);
});