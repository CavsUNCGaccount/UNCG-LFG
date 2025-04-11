/**
 * This script generates a bcrypt hash for a given password
 * Use it to reset a password for a user in the database if you forget the password
 * Replace password with the actual password you want to use
 * To use this script, run it with Node.js with the command: node generate-hash.js
 * 
 * After running this script, copy the generated hash and update the password in your database
 * using the SQL command:
 * UPDATE users SET password = '<generated_hash>' WHERE username = '<username>';
 * Make sure to replace <generated_hash> and <username> with the actual values and that there is no whitespace in the hash
 **/   
(async () => {
  const password = "player2reset123";
  const hash = await bcrypt.hash(password, 10);

  console.log("Generated hash:", hash);

  const match = await bcrypt.compare(password, hash);
  console.log("Password match:", match); // Should say: true
})();
