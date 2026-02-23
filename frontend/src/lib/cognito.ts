import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || ''
const appClientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID || ''
const region = import.meta.env.VITE_COGNITO_REGION || ''

if (!userPoolId || !appClientId || !region) {
  console.error('Missing Cognito configuration. Please check your .env file.')
}

export const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: appClientId,
})

export interface SignUpParams {
  email: string
  password: string
}

export interface SignInParams {
  email: string
  password: string
}

export const signUp = (params: SignUpParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: params.email,
      }),
    ]

    userPool.signUp(
      params.email,
      params.password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          reject(err)
          return
        }
        resolve(result?.userSub || '')
      }
    )
  })
}

export const signIn = (params: SignInParams): Promise<CognitoUser> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: params.email,
      Password: params.password,
    })

    const cognitoUser = new CognitoUser({
      Username: params.email,
      Pool: userPool,
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: () => {
        resolve(cognitoUser)
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const signOut = (): void => {
  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser) {
    cognitoUser.signOut()
  }
}

export const getCurrentUser = (): CognitoUser | null => {
  return userPool.getCurrentUser()
}

export const getSession = (): Promise<CognitoUser | null> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()
    if (!cognitoUser) {
      resolve(null)
      return
    }

    cognitoUser.getSession((err: Error | null) => {
      if (err) {
        reject(err)
        return
      }
      resolve(cognitoUser)
    })
  })
}

export const getJwtToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()
    if (!cognitoUser) {
      reject(new Error('No current user'))
      return
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        reject(err)
        return
      }

      if (!session || !session.isValid()) {
        reject(new Error('Session is invalid or expired'))
        return
      }

      const idToken = session.getIdToken()
      if (idToken) {
        resolve(idToken.getJwtToken())
      } else {
        reject(new Error('No ID token found'))
      }
    })
  })
}
