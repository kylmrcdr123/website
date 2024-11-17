const prod = {
    url: {
      API_URL: 'https://myapp.osdapp.com',
      API_URL_USERS: 'https://myapp.osdapp.com/users',
    },
  };
  
  const dev = {
    url: {
      API_URL: 'http://localhost:8080/user/login',
    },
  };
  
  
  export const config = process.env.NODE_ENV === 'development' ? dev : prod;