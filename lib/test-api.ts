// Simple test file to verify API connectivity
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const testApiConnectivity = async () => {
  try {
    // Test medicines endpoint (no auth required)
    const medicinesResponse = await axios.get(`${API_URL}/medicines`);
    console.log('Medicines API connected successfully');
    console.log(`Found ${medicinesResponse.data.total} medicines`);
    
    // Test ML server health
    const mlResponse = await axios.get('http://localhost:5000/health');
    console.log('ML Server connected successfully');
    console.log(`ML Model: ${mlResponse.data.model}`);
    
    return {
      medicines: medicinesResponse.data.total,
      mlServer: mlResponse.data.status,
      model: mlResponse.data.model
    };
  } catch (error) {
    console.error('API connectivity test failed:', error);
    return null;
  }
};

// Run the test if this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   testApiConnectivity().then(result => {
//     if (result) {
//       console.log('✅ All systems operational');
//     } else {
//       console.log('❌ Some systems not responding');
//     }
//   });
// }