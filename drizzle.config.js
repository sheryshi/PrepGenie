/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url:'postgresql://neon_db_owner:ozr34YNCyBXJ@ep-polished-boat-a5hkjuk1.us-east-2.aws.neon.tech/neon_db?sslmode=require' ,
  }
};