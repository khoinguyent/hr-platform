const db = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  async createUser(email, password, firstName, lastName) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const query = `
      INSERT INTO users(email, password_hash, first_name, last_name)
      VALUES($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name;
    `;
    const { rows } = await db.query(query, [email, passwordHash, firstName, lastName]);
    return rows[0];
  },

  async findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  },

  async findUserById(id) {
    const query = 'SELECT id, email, first_name, last_name FROM users WHERE id = $1;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  async findOrCreateUserByProvider(profile) {
    const { id: providerUserId, provider, displayName, emails, name } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : null;

    if (!email) {
      throw new Error('Email not provided by social provider.');
    }

    // 1. Check if this social account is already linked
    const providerResult = await db.query(
      'SELECT * FROM social_providers WHERE provider_name = $1 AND provider_user_id = $2;',
      [provider, providerUserId]
    );

    if (providerResult.rows.length > 0) {
      // Social account exists, find the associated user
      return await this.findUserById(providerResult.rows[0].user_id);
    }

    // 2. Check if a user with this email already exists
    let user = await this.findUserByEmail(email);

    if (!user) {
      // 3. If no user exists, create a new one
      const firstName = name ? name.givenName : displayName.split(' ')[0];
      const lastName = name ? name.familyName : displayName.split(' ').slice(1).join(' ');
      const newUserResult = await db.query(
        `INSERT INTO users(email, first_name, last_name) VALUES($1, $2, $3) RETURNING id, email, first_name, last_name;`,
        [email, firstName, lastName]
      );
      user = newUserResult.rows[0];
    }

    // 4. Link the social provider to the user (either existing or new)
    await db.query(
      'INSERT INTO social_providers(user_id, provider_name, provider_user_id) VALUES($1, $2, $3);',
      [user.id, provider, providerUserId]
    );

    return user;
  }
};

module.exports = userModel;