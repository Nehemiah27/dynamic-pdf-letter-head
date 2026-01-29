db.auth('revira_admin', '2b0YlZxL79D');

db = db.getSiblingDB('revira_local_compass');

db.createUser({
  user: 'revira_db_owner',
  pwd: 'i5u3h1PHb61',
  roles: [
    {
      role: 'dbOwner',
      db: 'revira_local_compass'
    }
  ]
});

db.createCollection('users');
