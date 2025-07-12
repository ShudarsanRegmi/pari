import { connectMongo } from './mongo.ts';
import { User } from './models.ts';

async function updateEcoImpactForExistingUsers() {
  try {
    await connectMongo();
    
    // Get all users who don't have ecoImpact set
    const usersToUpdate = await User.find({ ecoImpact: { $exists: false } });
    
    console.log(`Found ${usersToUpdate.length} users to update with EcoImpact`);
    
    // Update each user with a random initial EcoImpact value (between 10-100 kg CO2)
    for (const user of usersToUpdate) {
      const initialEcoImpact = Math.floor(Math.random() * 91) + 10; // Random value between 10-100
      
      await User.findByIdAndUpdate(user._id, { ecoImpact: initialEcoImpact });
      console.log(`Updated user ${user.email} with EcoImpact: ${initialEcoImpact} kg CO2`);
    }
    
    // Also update users who have ecoImpact set to 0 (default value)
    const usersWithZeroEcoImpact = await User.find({ ecoImpact: 0 });
    
    console.log(`Found ${usersWithZeroEcoImpact.length} users with zero EcoImpact to update`);
    
    for (const user of usersWithZeroEcoImpact) {
      const initialEcoImpact = Math.floor(Math.random() * 91) + 10; // Random value between 10-100
      
      await User.findByIdAndUpdate(user._id, { ecoImpact: initialEcoImpact });
      console.log(`Updated user ${user.email} with EcoImpact: ${initialEcoImpact} kg CO2`);
    }
    
    console.log('EcoImpact update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating EcoImpact:', error);
    process.exit(1);
  }
}

updateEcoImpactForExistingUsers(); 