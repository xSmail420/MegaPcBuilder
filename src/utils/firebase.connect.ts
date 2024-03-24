import * as admin from 'firebase-admin'
import config from 'config'

async function firebaseSetup() {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(config.get<admin.ServiceAccount>('firebaseCredential')),
      databaseURL: config.get<string>('databaseURL')
    });

    const db = admin.firestore()
    return db
    
  } catch (error) {
    console.error(error)
    console.error('Could not connect to Firebase')
    process.exit(1)
  }
}

export default firebaseSetup
