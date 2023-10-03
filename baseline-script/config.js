export default {
  crapi: 'localhost:80',
  mailhog: 'localhost:8025',
  vinRegex: /\b[(A-Z|0-9)]{17}\b/gm,
  pinRegex: />(\d{4})<\/font>/,
  usersToSimulate: parseInt(process.env.USERS_TO_SIMULATE ?? 100),
  batchSize: 10,
}
