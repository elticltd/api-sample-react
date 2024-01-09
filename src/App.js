import React, { useState } from 'react';

function send_refresh_request(lStateTokenKey, vanityName) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.eltic.io/api/refresh?vanityName=${vanityName}`, {
      method: "GET",
      headers: {
        charset: "UTF-8",
        "content-type": "application/json",
        accept: "application/json",
        statetokenkey: lStateTokenKey,
      },
    })
    .then(response => {
      return response.json().then(data => {
        console.log("data:", data)
        if (response.ok) {
          return data[0].RetrieveToken;
        } else {
          throw new Error(`API Error: ${response.statusText}`);
        }
      });
    })
    .then(retrieveToken => {
      resolve(retrieveToken);
    })
    .catch(err => {
      console.error(err.message);
      reject(err);
    });
  });
}

function check_if_data_ready(lStateTokenKey, retrieveToken) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.eltic.io/api/available?retrievetoken=${retrieveToken}`, {
      method: "GET",
      headers: {
        charset: "UTF-8",
        "content-type": "application/json",
        accept: "application/json",
        statetokenkey: lStateTokenKey,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json().then(data => {
        if (data[0].IsJsonReady === 1) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    })
    .catch(err => {
      console.error(err.message);
      reject(err);
    });
  });
}

function retrieve_data(lStateTokenKey, retrieveToken) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.eltic.io/api/retrieve?retrievetoken=${retrieveToken}`, {
      method: "GET",
      headers: {
        charset: "UTF-8",
        "content-type": "application/json",
        accept: "application/json",
        statetokenkey: lStateTokenKey,
      },
    })
    .then(response => {
      if (response.status === 204) {
        throw new Error("Not enough credit to retrieve the data. Buy more credit and then attempt the retrieve again.");
      }
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("response", data);
      resolve(data[0]); 
    })
    .catch(err => {
      console.error(err.message);
      reject(err);
    });
  });
}

function send_bulk_search_request(lStateTokenKey, data) {
  return new Promise((resolve, reject) => {
    fetch("https://api.eltic.io/api/bulksearch", {
      method: "POST",
      headers: {
        charset: "UTF-8",
        "content-type": "application/json",
        accept: "application/json",
        statetokenkey: lStateTokenKey,
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      return response.json().then(data => {
        if (response.ok) {
          return data[0].RetrieveToken;
        } else {
          throw new Error(`API Error: ${response.statusText}`);
        }
      });
    })
    .then(retrieveToken => {
      resolve(retrieveToken);
    })
    .catch(err => {
      console.error(err.message);
      reject(err);
    });
  });
}


function App() {
  const [stateTokenKey, setStateTokenKey] = useState('');
  const [vanityName, setVanityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  const [jobTitle, setJobTitle] = useState('');
  const [profession, setProfession] = useState('');
  const [skill, setSkill] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [location, setLocation] = useState('');
  const [openToWork, setOpenToWork] = useState('');
  const [hasEmail, setHasEmail] = useState('');
  const [dateLastUpdated, setDateLastUpdated] = useState('');
  const [noOfRecordsRequested, setNoOfRecordsRequested] = useState('');


  const authenticate = async () => {
    const accountTokenValue = process.env.REACT_APP_ACCOUNT_TOKEN;
    const secretKeyValue = process.env.REACT_APP_SECRET_KEY;

    setLoading(true);
    try {
      let responseStatusCode = 0;
      let lSTK = "";
      let localstateTokenKey = "";

      const formData = { accountToken: accountTokenValue, secretKey: secretKeyValue };
      fetch("https://api.eltic.io/api/accountlogin", {
        method: "POST",
        headers: {
          charset: "UTF-8",
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          for (var pair of response.headers.entries()) {
            if (pair[0] === "statetokenkey") {
              if (pair[1] !== localstateTokenKey) {
                lSTK = pair[1];
                if (Array.isArray(lSTK)) localstateTokenKey = lSTK[0];
                else localstateTokenKey = lSTK;
                console.log("localstateTokenKey: ",localstateTokenKey)
                setStateTokenKey(localstateTokenKey);
              }
            }
          }
          responseStatusCode = response.status;
          return response.json();
        })
        .then((response) => {
          // responseStatusCode: 200 = Success
          //                     202 = Account token or secret key not long enough
          //                     204 = Problem with account information
          if (responseStatusCode === 200 || responseStatusCode === 201) {
            // alert("logged in")

          } else {
            console.log(responseStatusCode)
          }
        })
        .catch((err) => {
          if (err !== undefined) {
            console.log(err.message);
          }
        });

    } catch (error) {
      console.error('Error during authentication:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCandidateInfo = () => {
    if (!stateTokenKey) {
      alert('Please authenticate first');
      return;
    }
    setLoading(true);
  
    send_refresh_request(stateTokenKey, vanityName)
      .then(retrieveToken => {
        if (!retrieveToken) {
          throw new Error('Failed to get retrieveToken');
        }
        console.log("retrieveToken", retrieveToken)
        // Function to recursively check if data is ready
        const waitForDataReady = (resolve, reject, retrieveToken) => {
          console.log("enter")
          check_if_data_ready(stateTokenKey, retrieveToken)
            .then(dataReady => {
              if (dataReady) {
                console.log("resolve retrieveToken")
                resolve(retrieveToken); // Data is ready, resolve with retrieveToken
              } else {
                console.log("Data not ready, waiting for 2 seconds...");
                setTimeout(() => waitForDataReady(resolve, reject, retrieveToken), 2000); // Wait for 2 seconds and check again
              }
            })
            .catch(error => {
              console.log("error:", error)
              reject(error); // Propagate error
            });
        };
        return new Promise((resolve, reject) => {
          waitForDataReady(resolve, reject, retrieveToken);
        });
      })
      .then(retrieveToken => {
        // Data is ready, retrieve the data
        console.log("retrieving data")
        return retrieve_data(stateTokenKey, retrieveToken);
      })
      .then(retrievedData => {
        console.log("retrievedData:", retrievedData)
        // Process the retrieved data
        setData(retrievedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error during data refresh:', error);
        setLoading(false);
      });
  };
  
  const perform_bulk_search = () => {
    if (!stateTokenKey) {
      alert('Please authenticate first');
      return;
    }
    setLoading(true);

    const data = {
      ...(jobTitle && { jobTitleList: jobTitle }),
      ...(profession && { professionList: profession }),
      ...(skill && { skillList: skill }),
      ...(countryCode && { countryCode }),
      ...(location && { locationList: location }),
      ...(openToWork && { openToWork: parseInt(openToWork) }),
      ...(hasEmail && { hasEmail: parseInt(hasEmail) }),
      ...(dateLastUpdated && { dateLastUpdated }),
      ...(noOfRecordsRequested && { noOfRecordsRequested: parseInt(noOfRecordsRequested) }),
    };
  
    send_bulk_search_request(stateTokenKey, data)
      .then(retrieveToken => {
        if (!retrieveToken) {
          throw new Error('Failed to get retrieveToken');
        }
        console.log("retrieveToken", retrieveToken)
        return retrieveToken; 
      })
      .then(retrieveToken => {
        // Data is ready, retrieve the data
        console.log("retrieving data: ", retrieveToken)
        return retrieve_data(stateTokenKey, retrieveToken);
      })
      .then(retrievedData => {
        console.log("retrievedData:", retrievedData)
        // Process the retrieved data
        setData(retrievedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error during data refresh:', error);
        setLoading(false);
      });
  };
  

  // Render your component with input fields and buttons to trigger these functions
  return (
    <div>
      <img src="https://www.eltic.io/logo.png" alt="Eltic Logo" width="300px" ></img>
      <h1>ELTic Data API Sample Implementation</h1>

      {!stateTokenKey && <div>
        <div>
          <button onClick={() => authenticate()} disabled={loading}>
            Authenticate
          </button>
        </div>
      </div>
      }

      {stateTokenKey && <div>
        <div>
          <h2>Search by vanity name</h2>
          <div>
            <input
              type="text"
              value={vanityName}
              onChange={(e) => setVanityName(e.target.value)}
              placeholder="Enter LinkedIn Vanity Name"
            />
          </div>
          <button onClick={(e) => refreshCandidateInfo()} disabled={loading}>
            Refresh Candidate Info
          </button>
        </div>
        <div>
            <br />
        </div>
        <div>
          <h2>Bulk Search by combination of fields</h2>
          <div>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Enter Job Title"
            />
          </div>
          <div>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Enter profession"
            />
          </div>
          <div>
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Enter skill"
            />
          </div>
          <div>
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="Enter country code"
            />
          </div>
          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          <div>
            <input
              type="text"
              value={openToWork}
              onChange={(e) => setOpenToWork(e.target.value)}
              placeholder="Enter openToWork (1/0)"
            />
          </div>
          <div>
            <input
              type="text"
              value={hasEmail}
              onChange={(e) => setHasEmail(e.target.value)}
              placeholder="Enter hasEmail (1/0)"
            />
          </div>
          <div>
            <input
              type="text"
              value={dateLastUpdated}
              onChange={(e) => setDateLastUpdated(e.target.value)}
              placeholder="Enter dateLastUpdated (2000-01-01 00:00:00)"
            />
          </div>
          <div>
            <input
              type="text"
              value={noOfRecordsRequested}
              onChange={(e) => setNoOfRecordsRequested(e.target.value)}
              placeholder="Enter noOfRecordsRequested (10)"
            />
          </div>
          <div>        
            <button onClick={perform_bulk_search} disabled={loading}>
              Perform Bulk Search
            </button>
          </div>

        </div>

        {loading && <p>Loading...</p>}

        {data && (
          <div>
            <div>
              <h2>Results:</h2>
              <pre>{JSON.stringify(data, null, 4)}</pre>
            </div>
            <div>
              <h3>Candidate(s):</h3>
              {data.jsonResult && (
                <>
                  <pre>{JSON.stringify(JSON.parse(data.jsonResult), null, 4)}</pre>
                  
                  <div>
                    <h3>Experience Info:</h3>
                    {data.jsonResult && JSON.parse(data.jsonResult)[0].experienceInfo ? (
                      <pre>
                        {JSON.stringify(
                          JSON.parse(JSON.parse(data.jsonResult)[0].experienceInfo),
                          null,
                          4
                        )}
                      </pre>
                    ) : (
                      <p>No Skills Info available.</p>
                    )}
                  </div>

                  <div>
                    <h3>Skills LinkedIn Info:</h3>
                    {data.jsonResult && JSON.parse(data.jsonResult)[0].skillLinkedInInfo ? (
                      <pre>
                        {JSON.stringify(
                          JSON.parse(JSON.parse(data.jsonResult)[0].skillLinkedInInfo),
                          null,
                          4
                        )}
                      </pre>
                    ) : (
                      <p>No Skills Info available.</p>
                    )}
                  </div>

                  <div>
                    <h3>Education Info:</h3>
                    {data.jsonResult && JSON.parse(data.jsonResult)[0].educationInfo ? (
                      <pre>
                        {JSON.stringify(
                          JSON.parse(JSON.parse(data.jsonResult)[0].educationInfo),
                          null,
                          4
                        )}
                      </pre>
                    ) : (
                      <p>No Education Info available.</p>
                    )}
                  </div>

                  <div>
                    <h3>Recommendation Info:</h3>
                    {data.jsonResult && JSON.parse(data.jsonResult)[0].recommendationInfo ? (
                      <pre>
                        {JSON.stringify(
                          JSON.parse(JSON.parse(data.jsonResult)[0].recommendationInfo),
                          null,
                          4
                        )}
                      </pre>
                    ) : (
                      <p>No Recommendation Info available.</p>
                    )}
                  </div>

                </>
              )}
            </div>
          </div>
        )}

      </div>}

    </div>
  );
}

export default App;