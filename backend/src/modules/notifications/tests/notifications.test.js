import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import NotificationService from '../services/notification.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Notifications Module Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const fakeUserId1 = new mongoose.Types.ObjectId();
    const fakeUserId2 = new mongoose.Types.ObjectId();

    // 0. Clean up previous test seed records
    console.log('\n🧹 Cleaning up old test notification documents...');
    await Notification.deleteMany({ title: 'Test Direct Notification' });
    await Notification.deleteMany({ title: 'Test Role-based Notification' });

    // 1. Create a direct notification
    console.log('\n📝 Testing direct notification creation...');
    const directNote = await NotificationService.createNotification({
      userId: fakeUserId1,
      title: 'Test Direct Notification',
      message: 'Hello, this is a target alert specifically for User 1.',
      type: 'INFO'
    });
    console.log('✅ Created Notification 1 (Direct):', directNote.title);

    // 2. Create a role-based notification
    console.log('📝 Testing role-based notification creation...');
    const roleNote = await NotificationService.createNotification({
      roles: ['MANAGER', 'ADMIN'],
      title: 'Test Role-based Notification',
      message: 'Attention Managers and Administrators, a system sync has run.',
      type: 'WARNING'
    });
    console.log('✅ Created Notification 2 (Role):', roleNote.title);

    // 3. Fetch notifications for User 1 (who has role: MANAGER)
    console.log('\n🔍 Querying combined feed for User 1 (MANAGER)...');
    const user1Feed = await NotificationService.getUserNotifications(fakeUserId1, 'MANAGER');
    console.log(`- Retrieved ${user1Feed.length} notifications.`);
    
    const hasDirect = user1Feed.some(n => n.title === 'Test Direct Notification');
    const hasRole = user1Feed.some(n => n.title === 'Test Role-based Notification');

    console.log('- Contains targeted direct notification:', hasDirect);
    console.log('- Contains role-based manager notification:', hasRole);

    if (!hasDirect || !hasRole) {
      console.error('❌ Error: Expected feed to contain both direct and role-based notifications!');
      process.exit(1);
    }

    // 4. Mark direct notification as read
    console.log('\n🔄 Marking direct notification as read for User 1...');
    await NotificationService.markAsRead(directNote._id, fakeUserId1);
    
    // 5. Mark role notification as read
    console.log('🔄 Marking role-based notification as read for User 1...');
    await NotificationService.markAsRead(roleNote._id, fakeUserId1);

    // 6. Fetch feed again and check read statuses
    console.log('🔍 Re-fetching feed to verify read statuses...');
    const user1FeedUpdated = await NotificationService.getUserNotifications(fakeUserId1, 'MANAGER');
    
    const directUpdated = user1FeedUpdated.find(n => n.title === 'Test Direct Notification');
    const roleUpdated = user1FeedUpdated.find(n => n.title === 'Test Role-based Notification');

    console.log('- Direct note isRead:', directUpdated?.isRead);
    console.log('- Role-based note isRead:', roleUpdated?.isRead);

    if (!directUpdated?.isRead || !roleUpdated?.isRead) {
      console.error('❌ Error: Read flags did not compile correctly!');
      process.exit(1);
    }
    console.log('✅ Read statuses updated and verified successfully.');

    // 7. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await Notification.deleteMany({ title: 'Test Direct Notification' });
    await Notification.deleteMany({ title: 'Test Role-based Notification' });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL NOTIFICATIONS MODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
