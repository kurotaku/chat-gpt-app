import axios from 'axios';

async function fetchCurrentUser() {
  try {
    const response = await axios.get('/api/users/current-user');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
  }
}

export default fetchCurrentUser;
