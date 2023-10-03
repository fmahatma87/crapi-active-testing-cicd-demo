import { faker } from '@faker-js/faker'
import config from './config.js'
import createUser from './user.js'
import * as crapi from './crapi.js'
import * as mailhog from './mailhog.js'
import { PromisePool } from '@supercharge/promise-pool'

const janeDoe = {
  name: 'Jane Doe',
  email: 'jane.doe@fake.com',
  password: 'crapiNoname!',
  number: '5555555555',
  userAgent: faker.internet.userAgent(),
  avatar: faker.internet.avatar(),
}

const johnSmith = {
  name: 'John Smith',
  email: 'john.smith@fake.com',
  password: 'crapiNoname!',
  number: '5555555556',
  userAgent: faker.internet.userAgent(),
  avatar: faker.internet.avatar(),
}

const user1 = {
  name: 'John Smith',
  email: 'crapi_user1@nonamesec.com',
  password: 'Aa123456!@',
  number: '5555555557',
  userAgent: faker.internet.userAgent(),
  avatar: faker.internet.avatar(),
}

const user2 = {
  name: 'Jane Doe',
  email: 'crapi_user2@nonamesec.com',
  password: 'Aa123456!@',
  number: '5555555558',
  userAgent: faker.internet.userAgent(),
  avatar: faker.internet.avatar(),
}

const baselineUser = async (user, orderQuantity) => {
  try {
    if (!user) user = createUser()
    //register user
    await crapi.register(user)
    //login user
    const loginData = await crapi.login(user)
    user.token = loginData.data.token
    if (!user.token) return
    //simulate same API behavior that web UI generates
    await crapi.dashboard(user)
    await crapi.getVehicles(user)

    //baseline the mailhog UI functionality that users will be accessing later
    await mailhog.getEmails(50)

    //search for our user's registration email in order to get the vin
    const emailSearchResult = await mailhog.searchEmails(user.email)
    const ourEmail = emailSearchResult.data.items[0].ID
    const email = await mailhog.getEmail(ourEmail)
    const emailContent = email.data.Content.Body
    //parse the VIN.. crAPI doesn't produce valid VINs :( just a 17 digit alphanumeric
    const vinMatch = emailContent.match(config.vinRegex)
    const vin = vinMatch[0]
    //parse the pincode
    const pinMatch = emailContent.match(config.pinRegex)
    const pin = pinMatch[1]

    //add our vehicle
    await crapi.addVehicle(user, vin, pin)
  } catch (err) {
    if (user) console.log(`Error running baseline for ${user.email} / ${user.name}`)
    console.log(err)
  } //just keep going
}

console.log('Baseline started')
const users = [...Array(config.usersToSimulate)]
await PromisePool.withConcurrency(config.batchSize).for(users).process(baselineUser)
console.log('Baseline complete')

await baselineUser(janeDoe, -999999999)
await baselineUser(johnSmith, -999999999)
await baselineUser(user1, -999999999)
await baselineUser(user2, -999999999)
