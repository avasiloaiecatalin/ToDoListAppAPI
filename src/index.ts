import 'dotenv-safe/config'
import { ApolloServer } from "apollo-server-express"
import express from "express"
import session from "express-session"
import path from "path"
import { createConnection } from "typeorm"
import { COOKIE_NAME, __prod__ } from './utils/constants'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { buildSchema } from 'type-graphql'
import { createUserLoader } from "./utils/loaders/createUserLoader"
import { Todo } from "./entities/Todo"
import { User } from "./entities/User"
import { UserResolver } from "./resolvers/user"
import { UserAction } from './entities/UserAction'
import { TodoResolver } from './resolvers/todo'

const main = async() => {
    await createConnection({ 
        type: 'mysql',
        url: process.env.DATABASE_URL,
        logging: false,
        synchronize: true,
        entities: [User, UserAction, Todo], 
        migrations: [path.join(__dirname, './migrations/*')]
    })

    const app = express()

    app.use(
        session({
          name: COOKIE_NAME,
          cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365, // 10 years
            httpOnly: true,
            sameSite: "lax", // csrf
            secure: __prod__ // cookie only works in https
          },
          saveUninitialized: false,
          secret: process.env.SESSION_SECRET,
          resave: false,
        })
      )

      const apolloServer = new ApolloServer({
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground(),
        ],
        schema: await buildSchema({
            resolvers: [UserResolver, TodoResolver],
            validate: false
        }),
        context: ({req, res}) => ({ req, res, userLoader: createUserLoader() })
    })

    await apolloServer.start()
    apolloServer.applyMiddleware({app, cors: false})

    app.listen(process.env.PORT, () => {
        console.log("API Server started on port", process.env.PORT)
    })
}

main().catch((err) => { 
    console.error(err);
});