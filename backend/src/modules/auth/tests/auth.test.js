import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AuthService from '../services/auth.service.js';
import User from '../models/User.js';
import Token from '../models/Token.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Auth Module Unit Tests...');
  
  // 1. Connect to database
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  console.log(`Connecting to: ${uri}`);
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    // Clean up previous test users
    const testEmail = 'test_user_unique_123@example.com';
    await User.deleteMany({ email: testEmail });
    console.log('🧹 Cleaned up old test users.');

    // 2. Test Registration
    console.log('\n📝 Testing Registration...');
    const registerData = {
      name: 'Test Tester',
      email: testEmail,
      password: 'securePassword123',
      role: 'SALES'
    };
    
    const registeredUser = await AuthService.registerUser(registerData);
    console.log('✅ Registration logic passed.');
    console.log('User created:', {
      id: registeredUser._id,
      name: registeredUser.name,
      email: registeredUser.email,
      role: registeredUser.role
    });

    // 3. Test Double Registration (Should fail)
    console.log('\n📝 Testing Duplicate Registration Restriction...');
    try {
      await AuthService.registerUser(registerData);
      console.error('❌ Error: Registered duplicate user!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Duplicate registration correctly rejected:', err.message);
    }

    // 4. Test Login (Success Case)
    console.log('\n🔐 Testing Login (Success Case)...');
    const loginResult = await AuthService.loginUser(testEmail, 'securePassword123');
    console.log('✅ Login successful.');
    console.log('Access Token:', loginResult.accessToken.substring(0, 30) + '...');
    console.log('Refresh Token:', loginResult.refreshToken.substring(0, 30) + '...');
    
    // Check if refresh token is in DB
    const tokenInDb = await Token.findOne({ token: loginResult.refreshToken });
    if (tokenInDb) {
      console.log('✅ Refresh token correctly saved to MongoDB.');
    } else {
      console.error('❌ Error: Refresh token not found in MongoDB!');
      process.exit(1);
    }

    // 5. Test Login (Failure Case - Wrong Password)
    console.log('\n🔐 Testing Login (Failure Case - Wrong Password)...');
    try {
      await AuthService.loginUser(testEmail, 'wrongPassword');
      console.error('❌ Error: Logged in with wrong password!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Wrong password correctly rejected:', err.message);
    }

    // 6. Test Token Refresh (Rotation)
    console.log('\n🔄 Testing Access Token Refresh (Token Rotation)...');
    const refreshResult = await AuthService.refreshAccessToken(loginResult.refreshToken);
    console.log('✅ Token refresh successful.');
    console.log('New Access Token:', refreshResult.accessToken.substring(0, 30) + '...');
    console.log('New Refresh Token:', refreshResult.refreshToken.substring(0, 30) + '...');

    // Verify old refresh token is deleted from DB
    const oldTokenInDb = await Token.findOne({ token: loginResult.refreshToken });
    if (!oldTokenInDb) {
      console.log('✅ Old refresh token correctly invalidated (deleted from DB).');
    } else {
      console.error('❌ Error: Old refresh token still exists in DB!');
      process.exit(1);
    }

    // Verify new refresh token is saved to DB
    const newTokenInDb = await Token.findOne({ token: refreshResult.refreshToken });
    if (newTokenInDb) {
      console.log('✅ New refresh token correctly saved to DB.');
    } else {
      console.error('❌ Error: New refresh token not found in DB!');
      process.exit(1);
    }

    // 7. Test Token Reuse Attack Protection
    console.log('\n🛡️ Testing Security: Token Reuse Attack Protection...');
    try {
      // Try to reuse the old refresh token (which has already been used and rotated)
      await AuthService.refreshAccessToken(loginResult.refreshToken);
      console.error('❌ Error: Server allowed reuse of an old refresh token!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Token reuse attack detected and blocked:', err.message);
      
      // Verify that all refresh tokens for this user have been cleared (revoked session)
      const userTokensCount = await Token.countDocuments({ userId: registeredUser._id });
      if (userTokensCount === 0) {
        console.log('✅ Security measure active: All sessions/tokens for this user have been revoked.');
      } else {
        console.error('❌ Error: Refresh tokens were not deleted upon reuse detection!');
        process.exit(1);
      }
    }

    // Clean up test users
    await User.deleteMany({ email: testEmail });
    console.log('\n🧹 Cleaned up test user.');
    console.log('\n🎉 ALL AUTHENTICATION MODULE BACKEND TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
