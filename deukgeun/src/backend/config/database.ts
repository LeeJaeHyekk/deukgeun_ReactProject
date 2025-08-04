import { createConnection } from "typeorm";
import { config } from "./env";
import { Post } from "../entities/Post";
import { Gym } from "../entities/Gym";
import { User } from "../entities/User";

// TypeORM database connection configuration
export const connectDatabase = async () => {
  const connection = await createConnection({
    // Database type configuration
    type: "mysql",

    // Database host address
    host: config.DB_HOST,

    // Database port number
    port: config.DB_PORT,

    // Database username
    username: config.DB_USERNAME,

    // Database password
    password: config.DB_PASSWORD,

    // Database name
    database: config.DB_NAME,

    // Auto-sync schema only in development environment
    // Set to false in production to prevent data loss
    synchronize: false,

    // Enable SQL query logging only in development environment
    // Used for debugging purposes
    logging: config.NODE_ENV === "development",

    // Entity class list
    // Classes that map to database tables managed by TypeORM
    entities: [Post, Gym, User],

    // Subscriber list (currently not used)
    subscribers: [],

    // Migration list (currently not used)
    migrations: [],
  });

  return connection; // Return the established connection object
};

// Re-export for convenience
export { createConnection };
