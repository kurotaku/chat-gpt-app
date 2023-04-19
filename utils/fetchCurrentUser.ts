import axios from 'axios';

async function fetchCurrentUser(session) {
  try {
    const response = await axios.get('/api/users/current-user', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
  }
}

export default fetchCurrentUser;
