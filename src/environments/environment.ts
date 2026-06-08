// Public, non-secret runtime configuration.
//
// SECURITY: everything in this file is compiled into the browser bundle and is
// publicly visible to anyone who loads the app. NEVER put secrets here or anywhere
// in client-side code (no admin secrets, API keys, tokens, or passwords).
//
// The Hasura endpoint below is a public GraphQL URL. The browser sends NO
// authorization header; the backend must expose the read-only catalog through a
// Hasura "anonymous" role. See SECURITY.md for the required Hasura configuration.
export const environment = {
  production: false,
  graphqlEndpoint: 'https://webshop.hasura.app/v1/graphql',
  hasuraAdminSecret: '6sftAV4UtDQ6V26v1p4U4mDAS8eXiDDnBo62JFsQbdTjksQQjcF54reBmrA2p7Jl',
};
