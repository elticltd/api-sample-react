# api-sample-react
Sample React script to demonstrate how to implement the ELTic API

**Refer to the API document to get the details of the API.  This details the example implementation scripts.**

## Note:
### Request your account by emailing your details to hello@eltic.io
- account_token = "Email hello@eltic.io to get your token"
- secret_key = "Email hello@eltic.io to get your secret key"
- vanity_name = "Choose a linkedin vanity name to test with"*

*See section below explaining the vanity name

## Files
- App.js contains the functions as examples.
- .env contains the token and secret key.

## Sequence of function calls in the application
1. Authenticate with the authenticate function.
2. Send a refresh request using send_refresh_request.
3. Check periodically if the data is ready using check_if_data_ready.
4. Once data is ready, retrieve it using retrieve_data.

## 1. authenticate()

**Purpose:**  
This function is utilized to authenticate against the API in a React application. It sends `accountToken` and `secretKey`, typically stored in environment variables, to the API's login endpoint.

**How it works:**

- The function makes a POST request to the API's login endpoint with the account token and secret key.
- It reads the account token and secret key from environment variables.
- Upon successful authentication, the API returns a response header containing a `statetokenkey`, necessary for subsequent API requests.
- This `statetokenkey` is extracted from the response headers and stored in the component's state for future use.
- The function handles various response status codes to determine the success or failure of the authentication request.
- In case of an error during the request, the error message is logged.

**Usage in a React Component:**

In a React component, this function is typically used to initiate authentication when the component mounts or in response to user input. Upon successful authentication, the `statetokenkey` is stored in the component's state, making it available for other API requests. Error handling ensures that any issues during the authentication process are appropriately managed.

## 2. refreshCandidateInfo()

**Purpose:**  
This function handles the process of refreshing candidate information in a React application. It uses the `stateTokenKey` to authenticate the request and `vanityName` to specify the candidate's LinkedIn vanity name.

**How it works:**

- The function first checks if `stateTokenKey` is available, indicating that the user has been authenticated.
- It sets the loading state to true, indicating that a network request is in progress.
- The `send_refresh_request` function is called with `stateTokenKey` and `vanityName`, and it returns a `retrieveToken` upon success.
- If `retrieveToken` is not received, an error is thrown.
- A recursive function, `waitForDataReady`, is used to repeatedly check if the candidate data is ready using `check_if_data_ready`. It waits for 2 seconds between checks if the data is not ready.
- Once the data is ready, `retrieve_data` is called with `stateTokenKey` and `retrieveToken` to fetch the detailed candidate data.
- The retrieved data is then stored in the component's state, and the loading state is set to false.
- The function handles any errors during the process and logs them appropriately.

**Usage in a React Component:**

In a React component, this function can be triggered by a user action, such as clicking a button. It manages the entire flow of refreshing candidate information, from initiating the request to processing the received data. The loading state can be used to display a loading indicator in the UI, and the retrieved data can be displayed or further processed as required.

## 3. perform_bulk_search()

**Purpose:**  
This function is designed to perform a bulk search in a React application. It requires the user to be authenticated and utilizes the `stateTokenKey` for the API request.

**How it works:**

- The function first checks if `stateTokenKey` is available, indicating that the user has been authenticated.
- The loading state is set to true to indicate the commencement of a network operation.
- A `data` object is constructed with various search parameters such as `jobTitle`, `profession`, `skill`, `countryCode`, `location`, `openToWork`, `hasEmail`, `dateLastUpdated`, and `noOfRecordsRequested`. Each parameter is included only if it has a value.
- The `send_bulk_search_request` function is then called with `stateTokenKey` and the constructed `data` object.
- Upon successful request, a `retrieveToken` is obtained. If not, an error is thrown.
- The `retrieve_data` function is then called with `stateTokenKey` and `retrieveToken` to fetch the search results.
- The retrieved data is stored in the component's state, and the loading state is reset to false.
- The function includes error handling to catch and log any issues that occur during the process.

**Usage in a React Component:**

In a React component, this function is typically triggered by a user action, such as a button click, to initiate a bulk search. It handles the entire process from building the search query, sending the request, to processing and storing the received data. The component can utilize the loading state to display a loading indicator during the operation and display the results once the data is retrieved.


## Note:

- **The state_token_key obtained from authentication is crucial and used in all subsequent API requests.**
- Handle exceptions at each stage to ensure robust error handling.
- Ensure you have proper sleep or wait times in the check_if_data_ready function to avoid excessive API calls.
- This sequence provides a complete workflow for interacting with the API, from authentication to data retrieval.

## vanity name

A "vanity name" on LinkedIn refers to a customizable part of your LinkedIn profile URL, usually representing your name or a variation of it, making it easy to remember and share. 

This personalized URL typically follows the format of **linkedin.com/in/[vanityname]**.

### Short Description:

A LinkedIn vanity name is a user-defined, unique identifier in your LinkedIn profile URL.
It helps create a more professional and memorable LinkedIn URL instead of a URL with a series of random numbers and letters.
It's often used for personal branding and makes it easier for others to find and connect with you on LinkedIn.


### Example of a Vanity Name:

Suppose your name is John Doe. A LinkedIn profile URL with a vanity name could be:

  https://www.linkedin.com/in/johndoe

  https://www.linkedin.com/in/john-doe

In this case, "johndoe" or "john-doe" is the vanity name. It's a simple, professional way to represent yourself on LinkedIn.

## Disclaimer
Please use this responsibly.  This is not inteded to be production ready or secure to be used on a production environment.  The purpose is to provide an example of how these calls works using React.