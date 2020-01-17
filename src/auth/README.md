
# Ouath2

This doc: http://www.bubblecode.net/en/2016/01/22/understanding-oauth2/
suggests that we should be using the "Implicit Grant" flow.
   * response_type should be "token"


This article: https://auth0.com/docs/api-auth/which-oauth-flow-to-use
says that we should use either:
* Authorization Code Grant with PKCE (better), OR
* Implicit Grant (not so good)


PKCE = Proof Key for Code Exchange by OAuth Public Clients, see https://tools.ietf.org/html/rfc7636

ACG/PKCE is as follows:

1. Generate code_verifier and code_challenge

2. Authorization Code Request (from Javascript Application to Authorization Server)
   * Modelled here as the /authorize endpoint that redirects to the Authorization Server
   * response_type should be "code"
   * should include code_challenge

3. User authenticates to Authorization Server (if necessary)

4. User gives consent

5. Authorization Server stores the code_challenge and redirects the user back to the application with an authorization code.

6. Javascript Application sends this code and the code_verifier to the Authorization Server

7. Authorization Server verifies the code_challenge and code_verifier, and responds with an ID Token and Access Token (and optionally, a Refresh Token).


getCryptoString(64) returns
"cZQJeoU7kP03Lwgg2xVz_-ehaXtlSggC9cdeYbxacregpihLi5sOJLDbyAHGwgWHTj4VE2b9cKWvpc0YOUTuRg"

In Browser:
encodeSHA256() -> Uint8Array(32) [136, 104, 179, 45, 224, 158, 244, 215, 249, 244, 231, 200, 248, 158, 19, 137, 197, 3, 72, 102, 29, 186, 182, 76, 227, 154, 210, 71, 192, 234, 145, 222]

encodeURLSafeBase64() ->
"iGizLeCe9Nf59OfI-J4TicUDSGYdurZM45rSR8Dqkd4"

In Node:

