import axios from 'axios';

const api = axios.create({
    baseURL: 'http://agroplan/api/v1',  // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
