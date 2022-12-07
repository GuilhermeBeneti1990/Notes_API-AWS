const { CognitoJwtVerifier } = require('aws-jwt-verify');

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_5WmlngYQt",
    tokenUse: "id",
    clientId: "5jl862hbnjs1kmlckvqi03ov50"
})

const generatePolicy = (principalId, effect, resource) => {
    var authResponse = {};

    authResponse.principalId = principalId;

    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: {
                Effect: effect,
                Resource: resource,
                Action: "execute-api:Invoke"
            }
        };

        authResponse.policyDocument = policyDocument;
    }

    authResponse.context = {
        foo: "bar"
    }

    console.log(JSON.stringify(authResponse));
    return authResponse;
}

exports.handler = async (event, context, callback) => {
    var token = event.authorizationToken;
    console.log(token);

    try {
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));

        callback(null, generatePolicy("user", "Allow", event.methodArn));
    } catch (error) {
        callback("Error: Invalid token")
    }

}

// https://notesproject.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=5jl862hbnjs1kmlckvqi03ov50&redirect_uri=http://localhost:3000