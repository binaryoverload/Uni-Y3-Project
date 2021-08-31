import config from "../../config"

function login(username, password) {
    return fetch(config.apiUrl + "/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        mode: 'cors',
        body: JSON.stringify({
          username,
          password
        })
      })
      .then(processResponse)
      .then(data => {
          return {...data, username}
      })
      .then(data => {
          if (data.token) {
              localStorage.setItem('user', JSON.stringify(data))
          }
          return data;
      });
}

function logout() {
    localStorage.removeItem('user');
}

function processResponse(response) {
    return response.text().then(text => {
        const data = text ? JSON.parse(text) : null
        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }

            const error = data != null ? data.message : response.statusText;
            return Promise.reject(error);
        }

        return data
    });
}

export default { login, logout }