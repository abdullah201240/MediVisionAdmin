// Test dashboard statistics
const testDashboardStats = async () => {
  console.log('Testing dashboard statistics...');
  
  try {
    // Test medicines endpoint
    const medicinesResponse = await fetch('http://localhost:3000/medicines?limit=1');
    const medicinesData = await medicinesResponse.json();
    console.log(`Total medicines: ${medicinesData.total || medicinesData.data?.length || 0}`);
    
    // Test users endpoint
    const usersResponse = await fetch('http://localhost:3000/users?page=1&limit=1', {
      headers: {
        'Cookie': 'connect.sid=s%3ATEST' // Mock cookie to bypass auth for testing
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`Total users: ${usersData.total || 0}`);
      
      // Test active users
      const activeUsersResponse = await fetch('http://localhost:3000/users?page=1&limit=1&role=user', {
        headers: {
          'Cookie': 'connect.sid=s%3ATEST'
        }
      });
      
      if (activeUsersResponse.ok) {
        const activeUsersData = await activeUsersResponse.json();
        console.log(`Active users: ${activeUsersData.total || 0}`);
      }
    } else {
      console.log('Users endpoint requires authentication');
    }
    
    console.log('Dashboard stats test completed');
  } catch (error) {
    console.error('Error testing dashboard stats:', error.message);
  }
};

testDashboardStats();